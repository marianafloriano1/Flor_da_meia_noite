import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";
import { registerAdminSession, type VerifiedIdentity, verifyBearer } from "@/lib/auth/http";
import { getRecentMfaTimestamp } from "@/lib/auth/step-up";

const url = process.env.TASK016_TEST_SUPABASE_URL;
const anonKey = process.env.TASK016_TEST_SUPABASE_ANON_KEY;
const serviceKey = process.env.TASK016_TEST_SUPABASE_SERVICE_ROLE_KEY;
const configured = Boolean(url && anonKey && serviceKey);

function decodeBase32(secret: string) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of secret.toUpperCase().replace(/=+$/, "")) {
    const value = alphabet.indexOf(character);
    if (value < 0) throw new Error("invalid_totp_secret");
    bits += value.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8)
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  return Buffer.from(bytes);
}

function currentTotp(secret: string) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000)));
  const digest = createHmac("sha1", decodeBase32(secret)).update(counter).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  return String((digest.readUInt32BE(offset) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}

test("server step-up accepts a fresh TOTP proof only at AAL2", () => {
  const now = Date.now();
  const timestamp = now / 1000 - 10;
  assert.equal(
    getRecentMfaTimestamp({ aal: "aal2", amr: [{ method: "totp", timestamp }] }, now)?.getTime(),
    timestamp * 1000,
  );
  assert.equal(
    getRecentMfaTimestamp({ aal: "aal1", amr: [{ method: "totp", timestamp }] }, now),
    null,
  );
});

async function assertRecentAal2Session(client: ReturnType<typeof createClient>) {
  const result = await client.auth.getSession();
  assert.ok(result.data.session);
  const claims = JSON.parse(
    Buffer.from(result.data.session.access_token.split(".")[1], "base64url").toString("utf8"),
  ) as Record<string, unknown>;
  assert.equal(claims.aal, "aal2");
  assert.ok(getRecentMfaTimestamp(claims), "server step-up logic must recognize the TOTP proof");
  const bearer = await verifyBearer(
    new Request("http://localhost/api/auth/session", {
      headers: { Authorization: `Bearer ${result.data.session.access_token}` },
    }),
  );
  assert.equal(bearer?.aal, "aal2", "server must validate the fresh post-MFA access token");
  assert.ok(bearer?.recentMfaAt);
  return bearer;
}

test("TASK-016: TOTP enrollment, AAL2 challenge, logout and subsequent login", {
  skip: !configured,
}, async () => {
  const endpoint = new URL(url as string);
  assert.ok(
    ["127.0.0.1", "localhost", "::1"].includes(endpoint.hostname) && endpoint.port === "54321",
    "TOTP integration test only permits the local Supabase API on port 54321",
  );

  const admin = createClient(url as string, serviceKey as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.SUPABASE_SERVICE_ROLE_KEY = serviceKey;
  const syntheticEmail = `task016-totp-${randomUUID()}@example.invalid`;
  const password = `T16-${randomUUID()}-Aa1!`;
  let userId: string | undefined;
  try {
    const created = await admin.auth.admin.createUser({
      email: syntheticEmail,
      password,
      email_confirm: true,
      app_metadata: { role: "admin" },
    });
    assert.equal(created.error, null);
    userId = created.data.user?.id;
    assert.ok(userId);

    const user = createClient(url as string, anonKey as string, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    assert.equal(
      (await user.auth.signInWithPassword({ email: syntheticEmail, password })).error,
      null,
    );

    const initialSession = (await user.auth.getSession()).data.session;
    assert.ok(initialSession);
    const initialClaims = JSON.parse(
      Buffer.from(initialSession.access_token.split(".")[1], "base64url").toString("utf8"),
    ) as Record<string, unknown>;
    const initialIdentity: VerifiedIdentity = {
      uid: userId,
      role: "admin",
      email: syntheticEmail,
      emailVerified: true,
      phoneNumber: undefined,
      phoneVerified: false,
      sessionId: String(initialClaims.session_id),
      aal: "aal1",
      recentMfaAt: null,
    };
    await registerAdminSession(initialIdentity);
    const initialRow = await admin
      .from("admin_auth_sessions")
      .select("mfa_verified_at")
      .eq("session_id", initialIdentity.sessionId)
      .single();
    assert.equal(initialRow.data?.mfa_verified_at, null);

    const enrollment = await user.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "TASK-016 local test",
    });
    assert.equal(enrollment.error, null);
    assert.ok(enrollment.data.totp?.secret);
    assert.ok(enrollment.data.totp?.qr_code);

    const firstVerification = await user.auth.mfa.challengeAndVerify({
      factorId: enrollment.data.id,
      code: currentTotp(enrollment.data.totp.secret),
    });
    assert.equal(firstVerification.error, null);
    assert.equal((await user.auth.mfa.getAuthenticatorAssuranceLevel()).data.currentLevel, "aal2");
    const verifiedIdentity = await assertRecentAal2Session(user);
    assert.equal(verifiedIdentity?.sessionId, initialIdentity.sessionId);
    await registerAdminSession(verifiedIdentity as VerifiedIdentity);
    const refreshedRow = await admin
      .from("admin_auth_sessions")
      .select("mfa_verified_at,revoked_at")
      .eq("session_id", initialIdentity.sessionId)
      .single();
    assert.ok(refreshedRow.data?.mfa_verified_at);
    assert.equal(refreshedRow.data?.revoked_at, null);

    assert.equal((await user.auth.signOut()).error, null);
    assert.equal(
      (await user.auth.signInWithPassword({ email: syntheticEmail, password })).error,
      null,
    );
    const beforeSecondFactor = await user.auth.mfa.getAuthenticatorAssuranceLevel();
    assert.equal(beforeSecondFactor.data.currentLevel, "aal1");
    assert.equal(beforeSecondFactor.data.nextLevel, "aal2");

    const secondVerification = await user.auth.mfa.challengeAndVerify({
      factorId: enrollment.data.id,
      code: currentTotp(enrollment.data.totp.secret),
    });
    assert.equal(secondVerification.error, null);
    assert.equal((await user.auth.mfa.getAuthenticatorAssuranceLevel()).data.currentLevel, "aal2");
    await assertRecentAal2Session(user);
  } finally {
    if (userId) await admin.auth.admin.deleteUser(userId);
  }
});

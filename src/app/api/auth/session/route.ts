import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  registerAdminSession,
  requireSameOrigin,
  requireSession,
  verifyBearer,
} from "@/lib/auth/http";

export async function POST(request: Request) {
  if (!(await requireSameOrigin()))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  // MFA verification can rotate the browser's Supabase cookies immediately before this call.
  // Validate the current access token directly so session registration cannot see a stale cookie.
  const hasBearer = request.headers.has("authorization");
  const identity = hasBearer ? await verifyBearer(request) : await requireSession();
  if (!identity) return NextResponse.json({ error: "account_not_provisioned" }, { status: 403 });
  try {
    await registerAdminSession(identity);
    return NextResponse.json({ uid: identity.uid, role: identity.role });
  } catch {
    return NextResponse.json({ error: "admin_session_registration_failed" }, { status: 503 });
  }
}

export async function DELETE() {
  if (!(await requireSameOrigin()))
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteNavigation } from "@/app/components/site-navigation";
import { normalizeAndValidateCpf } from "@/lib/auth/cpf";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

type PendingChallenge = {
  factorId: string;
  factorType: "phone" | "totp";
  challengeId: string;
  purpose: "login" | "step-up" | "enroll";
};

type AdminMfaFactor = { id: string; factorType: "phone" | "totp" };

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register" | "recovery">("login");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [errorText, setErrorText] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [phonePending, setPhonePending] = useState(false);
  const [adminAccount, setAdminAccount] = useState(false);
  const [adminNeedsEnrollment, setAdminNeedsEnrollment] = useState(false);
  const [adminCanEnrollTotp, setAdminCanEnrollTotp] = useState(false);
  const [adminFactor, setAdminFactor] = useState<AdminMfaFactor | null>(null);
  const [totpQrCode, setTotpQrCode] = useState("");
  const [pendingChallenge, setPendingChallenge] = useState<PendingChallenge | null>(null);
  const [busy, setBusy] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Restore the persisted session only once on initial page load.
  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    const isRecovery = params.get("mode") === "recovery";
    const hasCallbackError = params.has("error") || params.has("error_code");
    if (isRecovery) setMode("recovery");
    if (hasCallbackError && !isRecovery) {
      setErrorText(
        "O link de confirmação é inválido ou expirou. Solicite um novo e-mail de confirmação.",
      );
    }

    void getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data, error }) => {
        if (!active || isRecovery || hasCallbackError) return;
        if (error) {
          setErrorText(
            "Não foi possível restaurar a sessão. Abra novamente o link de confirmação ou tente recuperar a senha.",
          );
          return;
        }
        if (!data.session) return;
        void continueSignedInUser().catch((error: unknown) => {
          if (active)
            setErrorText(
              error instanceof Error
                ? error.message
                : "A sessão foi iniciada, mas não foi possível concluir a autenticação. Tente novamente.",
            );
        });
      })
      .catch(() => {
        if (active && !isRecovery)
          setErrorText(
            "Não foi possível validar o link de acesso. Solicite um novo e-mail de confirmação.",
          );
      });

    return () => {
      active = false;
    };
  }, []);

  async function establishSession() {
    const { data, error } = await getSupabaseBrowserClient().auth.getSession();
    if (error || !data.session)
      throw new Error("A sessão Supabase não foi persistida após a verificação MFA.");
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: { Authorization: `Bearer ${data.session.access_token}` },
    });
    if (!response.ok) {
      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (result?.error === "account_not_provisioned")
        throw new Error(
          "A autenticação foi validada, mas esta conta ainda não foi provisionada no aplicativo.",
        );
      if (result?.error === "forbidden")
        throw new Error("A sessão foi validada, mas a origem da solicitação não foi aceita.");
      if (result?.error === "admin_session_registration_failed")
        throw new Error(
          "A sessão AAL2 foi validada, mas o registro seguro da sessão administrativa falhou. Tente novamente.",
        );
      throw new Error(
        "A autenticação foi validada, mas o servidor não conseguiu registrar a sessão administrativa.",
      );
    }
  }

  async function continueSignedInUser() {
    const supabase = getSupabaseBrowserClient();
    const { data: result, error } = await supabase.auth.getUser();
    const user = result.user;
    if (error || !user) throw new Error("Entre novamente para continuar.");

    if (user.app_metadata.role === "admin") {
      setAdminAccount(true);
      const [{ data: level }, { data: factors, error: factorsError }] = await Promise.all([
        supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        supabase.auth.mfa.listFactors(),
      ]);
      if (factorsError) throw new Error("Não foi possível consultar os fatores MFA da conta.");
      const factor =
        factors?.totp.find((item) => item.status === "verified") ??
        factors?.phone.find((item) => item.status === "verified");
      const selectedFactor = factor
        ? { id: factor.id, factorType: factor.factor_type as "phone" | "totp" }
        : null;
      const canEnroll = !selectedFactor || level?.currentLevel === "aal2";
      setAdminFactor(selectedFactor);
      setAdminNeedsEnrollment(!selectedFactor);
      setAdminCanEnrollTotp(canEnroll);
      if (level?.nextLevel === "aal2" && level.currentLevel !== "aal2" && selectedFactor) {
        await startChallenge(selectedFactor.id, "login", selectedFactor.factorType);
        return;
      }
      if (!selectedFactor) {
        setMessage(
          "Configure um aplicativo autenticador para ativar a proteção MFA da conta administrativa.",
        );
        return;
      }
      if (selectedFactor.factorType === "phone" && !canEnroll) {
        setMessage(
          "Esta conta já possui MFA por SMS. Para cadastrar TOTP com segurança, primeiro confirme o fator SMS existente.",
        );
      }
    }

    try {
      await establishSession();
      setShowProfile(false);
      setMessage("Sessão iniciada.");
      router.push("/");
    } catch (error) {
      if (user.app_metadata.role === "admin") {
        setErrorText(
          error instanceof Error
            ? error.message
            : "A autenticação foi concluída, mas não foi possível registrar a sessão administrativa.",
        );
        return;
      }
      if (!user.email_confirmed_at) {
        setMessage("Confirme seu e-mail pelo link enviado e entre novamente para continuar.");
        return;
      }
      let draft: { fullName?: string; cpf?: string; phone?: string } = {};
      try {
        draft = JSON.parse(window.sessionStorage.getItem("fdmn-profile-draft") ?? "{}");
      } catch {
        draft = {};
      }
      setFullName(String(draft.fullName ?? user.user_metadata.full_name ?? ""));
      setCpf(String(draft.cpf ?? ""));
      setPhone(String(user.phone ?? draft.phone ?? ""));
      setEmail(user.email ?? "");
      setShowProfile(true);
      setMessage("Confirme seu celular e conclua o cadastro.");
    }
  }

  async function startChallenge(
    factorId: string,
    purpose: PendingChallenge["purpose"],
    factorType: PendingChallenge["factorType"],
  ) {
    const { data, error } = await getSupabaseBrowserClient().auth.mfa.challenge({ factorId });
    if (error || !data) {
      throw new Error(
        factorType === "totp"
          ? "Não foi possível iniciar a verificação do autenticador. Tente novamente."
          : "Não foi possível enviar o SMS. Verifique a configuração do provedor local.",
      );
    }
    setPendingChallenge({ factorId, factorType, challengeId: data.id, purpose });
    setMessage(
      factorType === "totp"
        ? "Abra seu aplicativo autenticador e informe o código atual de seis dígitos."
        : "Digite o código SMS para confirmar a ação.",
    );
  }

  async function login() {
    setBusy(true);
    setErrorText("");
    setMessage("");
    let credentialsAccepted = false;
    try {
      const { error } = await getSupabaseBrowserClient().auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      credentialsAccepted = true;
      await continueSignedInUser();
    } catch (error) {
      setErrorText(
        credentialsAccepted && error instanceof Error
          ? error.message
          : "Login não efetuado. Confira os dados e a confirmação do e-mail.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function register() {
    setBusy(true);
    setErrorText("");
    setMessage("");
    try {
      const normalizedCpf = normalizeAndValidateCpf(cpf);
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!normalizedCpf || !normalizedPhone)
        throw new Error("Confira o CPF e informe um celular válido com código do país.");
      setPhone(normalizedPhone);
      window.sessionStorage.setItem(
        "fdmn-profile-draft",
        JSON.stringify({ fullName: fullName.trim(), cpf: normalizedCpf, phone: normalizedPhone }),
      );
      const { data, error } = await getSupabaseBrowserClient().auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
      if (!data.session) {
        setMessage(
          "Enviamos um link de confirmação ao e-mail. Depois de confirmar, entre para validar o celular.",
        );
      } else {
        await continueSignedInUser();
      }
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setBusy(false);
    }
  }

  async function sendPhoneCode() {
    setBusy(true);
    setErrorText("");
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: result, error: authError } = await supabase.auth.getUser();
      const user = result.user;
      const normalizedPhone = normalizePhoneNumber(phone);
      if (authError || !user?.email_confirmed_at || !normalizedPhone)
        throw new Error("Confirme o e-mail e informe o celular antes de continuar.");
      if (normalizePhoneNumber(user.phone) === normalizedPhone && user.phone_confirmed_at) {
        await completeCustomerRegistration();
        return;
      }
      const { error } = await supabase.auth.updateUser({ phone: normalizedPhone });
      if (error) throw error;
      setPhone(normalizedPhone);
      setPhonePending(true);
      setMessage("Enviamos um código SMS para confirmar o celular.");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Não foi possível enviar o código SMS.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function completeCustomerRegistration() {
    const supabase = getSupabaseBrowserClient();
    const { data: result } = await supabase.auth.getUser();
    const user = result.user;
    if (!user?.phone) throw new Error("Confirme o celular para concluir o cadastro.");
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, cpf, phoneNumber: user.phone }),
    });
    if (!response.ok)
      throw new Error("Cadastro não concluído. Confira os dados e as confirmações.");
    await supabase.auth.refreshSession();
    await establishSession();
    window.sessionStorage.removeItem("fdmn-profile-draft");
    setPhonePending(false);
    setShowProfile(false);
    setMessage("E-mail e celular confirmados. Cadastro concluído.");
  }

  async function confirmPhoneCode() {
    setBusy(true);
    setErrorText("");
    try {
      let verificationError: Error | null = null;
      try {
        const { error } = await getSupabaseBrowserClient().auth.verifyOtp({
          phone,
          token: code.trim(),
          type: "phone_change",
        });
        verificationError = error;
      } catch {
        setErrorText("Não foi possível validar o código SMS. Tente novamente ou solicite outro.");
        return;
      }
      if (verificationError) {
        setErrorText(
          "Código SMS inválido ou expirado. Solicite um novo e use o código mais recente.",
        );
        return;
      }

      setCode("");
      try {
        await completeCustomerRegistration();
      } catch {
        setErrorText(
          "Código confirmado, mas não foi possível concluir o cadastro. Confira os dados e tente novamente.",
        );
      }
    } catch {
      setErrorText("O código foi confirmado, mas houve um erro ao concluir o cadastro.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyMfaCode() {
    const challenge = pendingChallenge;
    if (!challenge) return;
    setBusy(true);
    setErrorText("");
    try {
      const supabase = getSupabaseBrowserClient();
      let verificationError: Error | null = null;
      try {
        const { error } = await supabase.auth.mfa.verify({
          factorId: challenge.factorId,
          challengeId: challenge.challengeId,
          code: code.trim(),
        });
        verificationError = error;
      } catch {
        setErrorText(
          challenge.factorType === "totp"
            ? "Não foi possível validar o código do autenticador. Confira o horário do dispositivo e tente o código atual."
            : "Não foi possível validar o código SMS. Tente novamente ou solicite outro.",
        );
        return;
      }
      if (verificationError) {
        setErrorText(
          challenge.factorType === "totp"
            ? "Código do autenticador inválido ou expirado. Aguarde o próximo código e tente novamente."
            : "Código SMS inválido ou expirado. Solicite um novo e use o código mais recente.",
        );
        return;
      }

      const purpose = challenge.purpose;
      setPendingChallenge(null);
      setCode("");
      try {
        if (purpose === "enroll") {
          setAdminNeedsEnrollment(false);
          setAdminFactor({ id: challenge.factorId, factorType: challenge.factorType });
          setTotpQrCode("");
          await establishSession();
          setMessage(
            challenge.factorType === "totp"
              ? "Aplicativo autenticador configurado. A sessão administrativa está protegida por MFA."
              : "Fator SMS confirmado. A sessão administrativa está protegida por MFA.",
          );
          router.push("/");
        } else if (purpose === "step-up") {
          const response = await fetch("/api/auth/step-up", { method: "POST" });
          if (!response.ok) throw new Error("step_up_session_rejected");
          setMessage("Verificação administrativa renovada.");
        } else {
          await establishSession();
          setMessage("Sessão administrativa protegida iniciada.");
          router.push("/");
        }
      } catch (error) {
        if (error instanceof Error && error.message === "step_up_session_rejected") {
          setErrorText(
            "O código foi confirmado, mas o servidor não registrou a renovação MFA. Entre novamente e tente outra vez.",
          );
        } else {
          setErrorText(
            error instanceof Error
              ? `Código confirmado, mas ${error.message.charAt(0).toLowerCase()}${error.message.slice(1)}`
              : "Código confirmado, mas o servidor não conseguiu concluir a sessão.",
          );
        }
      }
    } catch {
      setErrorText("O código foi confirmado, mas houve um erro ao concluir a sessão.");
    } finally {
      setBusy(false);
    }
  }

  async function enrollAdminTotp() {
    setBusy(true);
    setErrorText("");
    try {
      if (!adminCanEnrollTotp)
        throw new Error("Confirme primeiro o fator MFA já cadastrado antes de adicionar outro.");
      const { data, error } = await getSupabaseBrowserClient().auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Flor da Meia-Noite",
      });
      if (error) throw error;
      if (!data.totp?.qr_code) throw new Error("O Supabase não retornou o QR do autenticador.");
      setTotpQrCode(data.totp.qr_code);
      setAdminFactor({ id: data.id, factorType: "totp" });
      await startChallenge(data.id, "enroll", "totp");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Não foi possível iniciar o cadastro TOTP.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function enrollAdminPhoneFactor() {
    setBusy(true);
    setErrorText("");
    try {
      if (!adminCanEnrollTotp)
        throw new Error("Confirme primeiro o fator MFA já cadastrado antes de adicionar outro.");
      const { data, error } = await getSupabaseBrowserClient().auth.mfa.enroll({
        factorType: "phone",
        phone,
      });
      if (error) throw error;
      await startChallenge(data.id, "enroll", "phone");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Não foi possível iniciar o cadastro SMS.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function renewAdminStepUp() {
    setBusy(true);
    setErrorText("");
    try {
      const { data, error } = await getSupabaseBrowserClient().auth.mfa.listFactors();
      if (error) throw error;
      const factor =
        data.totp.find((item) => item.status === "verified") ??
        data.phone.find((item) => item.status === "verified");
      if (!factor) throw new Error("Cadastre primeiro um fator MFA administrativo.");
      await startChallenge(factor.id, "step-up", factor.factor_type as "phone" | "totp");
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Não foi possível solicitar novo código.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordRecovery() {
    setBusy(true);
    setErrorText("");
    try {
      const { error } = await getSupabaseBrowserClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=recovery`,
      });
      if (error) throw error;
      setMessage("Se houver uma conta para esse endereço, enviaremos um link de recuperação.");
    } catch {
      setMessage("Se houver uma conta para esse endereço, enviaremos um link de recuperação.");
    } finally {
      setBusy(false);
    }
  }

  async function completePasswordRecovery() {
    setBusy(true);
    setErrorText("");
    try {
      const { error } = await getSupabaseBrowserClient().auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setMode("login");
      setMessage("Senha atualizada. Entre com a nova senha.");
    } catch {
      setErrorText(
        "Não foi possível atualizar a senha. Abra novamente o link recebido por e-mail.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await getSupabaseBrowserClient().auth.signOut();
    setAdminAccount(false);
    setMessage("Sessão encerrada.");
  }

  return (
    <main className="page-shell auth-page">
      <section className="intro auth-card" aria-labelledby="auth-title">
        <SiteNavigation compact />
        <p className="eyebrow">FLOR DA MEIA-NOITE</p>
        <h1 id="auth-title">
          {mode === "login"
            ? "Acesse sua conta"
            : mode === "register"
              ? "Crie sua conta"
              : "Recupere sua senha"}
        </h1>
        <p className="description">Cadastro e acesso protegidos pelo Supabase Auth.</p>
        <div className="auth-form">
          {(mode === "register" || showProfile) && !phonePending && (
            <>
              <label>
                Nome completo
                <input
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                />
              </label>
              <label>
                CPF
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={cpf}
                  onChange={(event) => setCpf(event.target.value)}
                />
              </label>
            </>
          )}
          {mode !== "recovery" && (
            <label>
              E-mail
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
          )}
          {(mode === "login" || mode === "register" || mode === "recovery") &&
            !pendingChallenge &&
            !phonePending && (
              <label>
                {mode === "recovery" ? "Nova senha" : "Senha"}
                <input
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>
            )}
          {(mode === "register" || showProfile) && (
            <label>
              Celular com código do país (com ou sem +)
              <input
                type="tel"
                placeholder="5511999999999 ou +5511999999999"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </label>
          )}
          {(pendingChallenge || phonePending) && (
            <label>
              {pendingChallenge?.factorType === "totp"
                ? "Código do aplicativo autenticador"
                : "Código recebido por SMS"}
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
              />
            </label>
          )}

          {mode === "register" && !showProfile && (
            <button type="button" disabled={busy} onClick={() => void register()}>
              {busy ? "Aguarde…" : "Criar conta"}
            </button>
          )}
          {mode === "login" && !showProfile && !pendingChallenge && (
            <button type="button" disabled={busy} onClick={() => void login()}>
              {busy ? "Aguarde…" : "Entrar"}
            </button>
          )}
          {showProfile && !phonePending && (
            <button type="button" disabled={busy} onClick={() => void sendPhoneCode()}>
              {busy ? "Aguarde…" : "Enviar código SMS"}
            </button>
          )}
          {phonePending && (
            <button type="button" disabled={busy} onClick={() => void confirmPhoneCode()}>
              {busy ? "Aguarde…" : "Confirmar celular"}
            </button>
          )}
          {pendingChallenge && (
            <>
              <button type="button" disabled={busy} onClick={() => void verifyMfaCode()}>
                {busy ? "Aguarde…" : "Confirmar código"}
              </button>
              <button
                className="text-button"
                type="button"
                disabled={busy}
                onClick={() =>
                  void startChallenge(
                    pendingChallenge.factorId,
                    pendingChallenge.purpose,
                    pendingChallenge.factorType,
                  ).catch((error: unknown) =>
                    setErrorText(
                      error instanceof Error
                        ? error.message
                        : "Não foi possível iniciar outro desafio MFA.",
                    ),
                  )
                }
              >
                Gerar novo desafio MFA
              </button>
            </>
          )}
          {mode === "recovery" && (
            <button type="button" disabled={busy} onClick={() => void completePasswordRecovery()}>
              Atualizar senha
            </button>
          )}
          {mode === "login" && !showProfile && !pendingChallenge && (
            <button
              className="text-button"
              type="button"
              disabled={busy}
              onClick={() => void requestPasswordRecovery()}
            >
              Recuperar senha por e-mail
            </button>
          )}
          {adminAccount && totpQrCode && (
            <div className="auth-totp-setup" aria-live="polite">
              <p>
                Escaneie este QR no Google Authenticator, Microsoft Authenticator ou outro app TOTP.
                O QR é temporário; não compartilhe esta tela.
              </p>
              {/* Supabase returns a data URL for the official TOTP provisioning QR. */}
              {/* biome-ignore lint/performance/noImgElement: Supabase returns this short-lived QR as a data URL. */}
              <img
                src={totpQrCode}
                alt="QR temporário para cadastrar MFA no aplicativo autenticador"
              />
              <p>
                Depois, informe o código de seis dígitos gerado pelo aplicativo para confirmar o
                cadastro.
              </p>
            </div>
          )}
          {adminAccount && !pendingChallenge && (
            <>
              {totpQrCode && adminFactor?.factorType === "totp" && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() =>
                    void startChallenge(adminFactor.id, "enroll", "totp").catch((error: unknown) =>
                      setErrorText(
                        error instanceof Error
                          ? error.message
                          : "Não foi possível iniciar o desafio TOTP.",
                      ),
                    )
                  }
                >
                  Continuar configuração do autenticador
                </button>
              )}
              {adminNeedsEnrollment && adminCanEnrollTotp && (
                <button type="button" disabled={busy} onClick={() => void enrollAdminTotp()}>
                  Configurar aplicativo autenticador (TOTP)
                </button>
              )}
              {adminFactor?.factorType === "phone" && adminCanEnrollTotp && (
                <button type="button" disabled={busy} onClick={() => void enrollAdminTotp()}>
                  Adicionar aplicativo autenticador (TOTP)
                </button>
              )}
              {adminNeedsEnrollment && adminCanEnrollTotp && (
                <>
                  <label>
                    Celular para MFA por SMS (opcional)
                    <input
                      type="tel"
                      placeholder="+5511999999999"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void enrollAdminPhoneFactor()}
                  >
                    Configurar MFA por SMS
                  </button>
                </>
              )}
              {!adminNeedsEnrollment && adminFactor && (
                <button type="button" disabled={busy} onClick={() => void renewAdminStepUp()}>
                  Renovar verificação administrativa
                </button>
              )}
            </>
          )}
          {adminAccount && (
            <button className="text-button" type="button" onClick={() => void logout()}>
              Encerrar sessão
            </button>
          )}
          {mode !== "recovery" && !showProfile && !pendingChallenge && (
            <button
              className="text-button"
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorText("");
                setMessage("");
              }}
            >
              {mode === "login" ? "Ainda não tenho cadastro" : "Já tenho conta"}
            </button>
          )}
          {mode === "login" && !showProfile && !pendingChallenge && (
            <a className="auth-staff-link" href="/auth?mode=login">
              Sou funcionário
            </a>
          )}
          {mode === "recovery" && (
            <button className="text-button" type="button" onClick={() => setMode("login")}>
              Voltar ao acesso
            </button>
          )}
          {message && (
            <p role="status" className="form-message">
              {message}
            </p>
          )}
          {errorText && (
            <p role="alert" className="form-error">
              {errorText}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

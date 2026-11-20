"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { LogoutButton } from "./logout-button";

export function SiteNavigation({
  home = false,
  compact = false,
}: {
  home?: boolean;
  compact?: boolean;
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let active = true;
    const refreshRole = async () => {
      try {
        const [{ data, error }, { data: assurance }] = await Promise.all([
          supabase.auth.getUser(),
          supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
        ]);
        if (active)
          setIsAdmin(
            !error &&
              data.user?.app_metadata.role === "admin" &&
              assurance?.currentLevel === "aal2",
          );
      } catch {
        if (active) setIsAdmin(false);
      }
    };

    void refreshRole();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setIsAdmin(false);
      else void refreshRole();
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className={`home-header site-navigation${compact ? " site-navigation--compact" : ""}`}>
      <Link aria-label="Flor da Meia-Noite — início" className="home-wordmark" href="/">
        Flor da <span>Meia-Noite</span>
      </Link>
      <nav aria-label="Navegação principal" className="home-nav">
        <Link href={home ? "#colecoes" : "/#colecoes"}>Coleções</Link>
        <Link href="/catalog">Catálogo</Link>
        <Link href="/auth">Conta</Link>
        <Link href="/cart">Sacola</Link>
        {isAdmin && <Link href="/admin/catalog">Cadastro de produtos</Link>}
      </nav>
      <LogoutButton />
    </header>
  );
}

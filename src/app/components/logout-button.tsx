"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export function LogoutButton() {
	const router = useRouter();
	const [signedIn, setSignedIn] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const supabase = getSupabaseBrowserClient();
		let active = true;
		const { data } = supabase.auth.onAuthStateChange((_event, session) => {
			if (active) setSignedIn(Boolean(session));
		});

		void supabase.auth
			.getSession()
			.then(({ data: sessionData, error: sessionError }) => {
				if (active) setSignedIn(!sessionError && Boolean(sessionData.session));
			});

		return () => {
			active = false;
			data.subscription.unsubscribe();
		};
	}, []);

	async function logout() {
		setBusy(true);
		setError("");
		try {
			const response = await fetch("/api/auth/session", {
				method: "DELETE",
				credentials: "same-origin",
			});
			if (!response.ok) throw new Error("server_session_not_cleared");

			const { error: signOutError } =
				await getSupabaseBrowserClient().auth.signOut({
					scope: "local",
				});
			if (signOutError) throw signOutError;

			setSignedIn(false);
			router.replace("/auth");
			router.refresh();
		} catch {
			setError("Não foi possível sair da conta. Tente novamente.");
			setBusy(false);
		}
	}

	if (!signedIn) return null;

	return (
		<span className="home-logout">
			<button
				aria-busy={busy}
				aria-label="Sair da conta"
				className="home-logout-button"
				disabled={busy}
				onClick={() => void logout()}
				title="Sair da conta"
				type="button"
			>
				<svg
					aria-hidden="true"
					fill="none"
					focusable="false"
					viewBox="0 0 24 24"
				>
					<path
						d="M10 4H5v16h5M14 8l4 4-4 4m4-4H9"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.6"
					/>
				</svg>
			</button>
			{error && (
				<span aria-live="polite" className="home-logout-error">
					{error}
				</span>
			)}
		</span>
	);
}

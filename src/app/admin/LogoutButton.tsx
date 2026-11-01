"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setPending(true);
    setError("");
    const { error: signOutError } = await createClient().auth.signOut();
    if (signOutError) {
      setError("Logout nahi ho paya. Dobara try karein.");
      setPending(false);
      return;
    }
    window.location.assign("/");
  }

  return (
    <div className="admin__logout-wrap">
      <button className="admin__back" type="button" onClick={logout} disabled={pending}>
        {pending ? "Logging out…" : "Logout"}
      </button>
      {error && <span className="admin__logout-error" role="alert">{error}</span>}
    </div>
  );
}

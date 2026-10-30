"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email ya password galat hai.");
      return;
    }
    const requestedPath = new URLSearchParams(window.location.search).get("next");
    const destination =
      requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
        ? requestedPath
        : "/";
    window.location.href = destination;
  }

  return (
    <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, width: "100%", maxWidth: 360 }}>
      <h1 style={{ fontSize: 28, margin: 0 }}>Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
        style={{ padding: 12, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "inherit" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
        style={{ padding: 12, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "inherit" }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{ padding: 12, borderRadius: 8, border: 0, background: "#d4af37", color: "#000", fontWeight: 600, cursor: "pointer" }}
      >
        {loading ? "Wait..." : "Login"}
      </button>
      {error && <p style={{ color: "#ff6b6b", margin: 0 }}>{error}</p>}
    </form>
  );
}

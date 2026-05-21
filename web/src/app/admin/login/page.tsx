"use client";

import { useState } from "react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function AdminLoginPage() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="py-10">
      <Container className="max-w-lg">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 shadow-sm">
          <div className="text-xl font-extrabold">Welcome Dhaivat Sir</div>
          <div className="mt-1 text-sm text-muted">
            Enter the your Username and Password to edit site content.
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              setLoading(true);
              try {
                const res = await fetch("/api/admin/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ user, pass }),
                });
                if (!res.ok) {
                  const msg = await res.text();
                  setError(msg || "Login failed");
                  return;
                }
                window.location.href = "/admin/edit";
              } catch {
                setError("Login failed");
              } finally {
                setLoading(false);
              }
            }}
          >
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">Username</label>
              <input
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
              />
            </div>


            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <Button type="submit" className="w-full" variant="primary">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  );
}


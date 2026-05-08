"use client";

import { useMemo, useState } from "react";

type Field =
  | { kind: "text" | "email" | "tel"; name: string; label: string; placeholder?: string; required?: boolean; colSpan?: 1 | 2 }
  | { kind: "select"; name: string; label: string; required?: boolean; colSpan?: 1 | 2; options: { label: string; value: string }[] }
  | { kind: "textarea"; name: string; label: string; placeholder?: string; required?: boolean; colSpan?: 1 | 2; rows?: number }
  | { kind: "radio"; name: string; label: string; colSpan?: 1 | 2; options: { label: string; value: string }[]; defaultValue?: string };

function formspreeSubmitUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw.replace(/\/+$/, "");
  return `https://formspree.io/f/${raw.replace(/^\/+/, "")}`;
}

export function MailtoForm({
  toEmail,
  subjectPrefix,
  fields,
  submitLabel,
  footerHint,
  className = "",
}: {
  toEmail: string;
  subjectPrefix: string;
  fields: Field[];
  submitLabel: string;
  footerHint?: string;
  className?: string;
}) {
  const formspreeUrl = useMemo(() => formspreeSubmitUrl(), []);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const radioDefaults = useMemo(() => {
    const map = new Map<string, string>();
    for (const f of fields) {
      if (f.kind === "radio" && f.defaultValue) map.set(f.name, f.defaultValue);
    }
    return map;
  }, [fields]);

  return (
    <form
      className={`grid gap-4 sm:grid-cols-2 ${className}`}
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const fd = new FormData(form);

        for (const [name, val] of radioDefaults.entries()) {
          if (!fd.get(name)) fd.set(name, val);
        }

        if (!formspreeUrl) {
          const subject = encodeURIComponent(subjectPrefix);
          const lines: string[] = [];
          for (const f of fields) {
            if (f.kind === "radio") continue;
            const v = String(fd.get(f.name) ?? "");
            if (v) lines.push(`${f.label}: ${v}`);
          }
          for (const f of fields) {
            if (f.kind !== "radio") continue;
            const v = String(fd.get(f.name) ?? "");
            if (v) lines.push(`${f.label}: ${v}`);
          }
          const body = encodeURIComponent(lines.join("\n"));
          window.location.href = `mailto:${toEmail}?subject=${subject}&body=${body}`;
          return;
        }

        fd.append("_subject", subjectPrefix);

        setSubmitting(true);
        setSuccess(false);
        try {
          const res = await fetch(formspreeUrl, {
            method: "POST",
            body: fd,
            headers: { Accept: "application/json" },
          });
          const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: unknown };
          if (!res.ok) {
            const msg =
              typeof data.error === "string"
                ? data.error
                : Array.isArray(data.errors)
                  ? JSON.stringify(data.errors)
                  : `Request failed (${res.status})`;
            throw new Error(msg);
          }
          setSuccess(true);
          form.reset();
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err));
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {formspreeUrl ? (
        <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      ) : null}

      {fields.map((f) => {
        const col = f.colSpan === 2 ? "sm:col-span-2" : "";

        if (f.kind === "select") {
          return (
            <div key={f.name} className={`space-y-1 ${col}`}>
              <label className="text-xs font-semibold text-muted">{f.label}</label>
              <select
                name={f.name}
                required={f.required}
                className="w-full rounded-xl border border-border px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Select an option
                </option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }

        if (f.kind === "textarea") {
          return (
            <div key={f.name} className={`space-y-1 ${col}`}>
              <label className="text-xs font-semibold text-muted">{f.label}</label>
              <textarea
                name={f.name}
                required={f.required}
                rows={f.rows ?? 5}
                className="min-h-28 w-full rounded-xl border border-border px-3 py-2 text-sm"
                placeholder={f.placeholder}
              />
            </div>
          );
        }

        if (f.kind === "radio") {
          return (
            <div key={f.name} className={`space-y-2 ${col}`}>
              <div className="text-xs font-semibold text-muted">{f.label}</div>
              <div className="flex flex-wrap gap-4 text-sm">
                {f.options.map((o) => (
                  <label key={o.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={f.name}
                      value={o.value}
                      defaultChecked={(f.defaultValue ?? "") === o.value}
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </div>
          );
        }

        return (
          <div key={f.name} className={`space-y-1 ${col}`}>
            <label className="text-xs font-semibold text-muted">{f.label}</label>
            <input
              name={f.name}
              type={f.kind}
              required={f.required}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm"
              placeholder={f.placeholder}
            />
          </div>
        );
      })}

      <div className="sm:col-span-2">
        {success ? (
          <div className="mt-2 rounded-xl border border-border bg-brand/10 px-4 py-3 text-center text-sm font-semibold text-foreground">
            Thanks — your message was sent. We&apos;ll get back to you soon.
          </div>
        ) : null}
        {error ? (
          <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800">
            {error}
          </div>
        ) : null}
        {!formspreeUrl ? (
          <p className="mb-2 text-center text-xs text-muted">
            Formspree is not configured — opens your email app instead. Set{" "}
            <span className="font-mono">NEXT_PUBLIC_FORMSPREE_FORM_ID</span> in Vercel for direct submissions.
          </p>
        ) : null}
        <button
          className="mt-2 w-full rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white hover:bg-brand/90 disabled:opacity-60"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Sending…" : submitLabel}
        </button>
        {footerHint ? <div className="mt-2 text-center text-xs text-muted">{footerHint}</div> : null}
      </div>
    </form>
  );
}

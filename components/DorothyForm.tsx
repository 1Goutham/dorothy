"use client";

/* Forms need no backend: they POST to a free form service when one is configured,
   and otherwise open the visitor's email app with the message ready to send. */
import { useState, type FormEvent, type ReactNode } from "react";
import { config } from "@/lib/config";

export default function DorothyForm({ kind, children }: { kind: string; children: ReactNode }) {
  const [status, setStatus] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("company")) return; // honeypot
    data.delete("company");
    const lines: string[] = [];
    data.forEach((v, k) => lines.push(`${k}: ${v}`));
    if (config.formEndpoint) {
      try {
        data.append("_subject", "Dorothy, " + kind);
        const res = await fetch(config.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        setStatus("Thank you. We received this, and someone from Dorothy will reach out.");
        return;
      } catch {
        setStatus("Couldn't send right now. Opening your email app instead…");
      }
    }
    window.location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent("Dorothy, " + kind)}&body=${encodeURIComponent(lines.join("\n"))}`;
    setStatus("Your email app should open with this message ready to send.");
  }

  return (
    <form className="form" onSubmit={onSubmit}>
      {children}
      <p className="form-status" role="status">{status}</p>
    </form>
  );
}

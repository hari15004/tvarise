"use client";

import { FormEvent, useState } from "react";

export function ContactForm({ email }: { email: string }) {
  const [message, setMessage] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email) {
      setMessage("Contact email configure nahi hai. Website admin se contact karein.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const sender = String(formData.get("email") ?? "").trim();
    const project = String(formData.get("project") ?? "").trim();
    const subject = encodeURIComponent(`Project enquiry from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${sender}\n\nProject details:\n${project}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <h2>Project enquiry</h2>
      <label>
        <span>Your name</span>
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <label>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" required maxLength={160} />
      </label>
      <label>
        <span>What are you looking to build?</span>
        <textarea name="project" rows={6} required maxLength={3000} />
      </label>
      {message && <p className="contact-form__message" role="alert">{message}</p>}
      <button type="submit" className="btn btn--primary">Prepare email ↗</button>
      <p className="contact-form__hint">This opens your email app with your enquiry ready to send.</p>
    </form>
  );
}

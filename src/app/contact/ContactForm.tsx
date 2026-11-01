"use client";

import { useState, useTransition, type FormEvent } from "react";
import { submitContactInquiry } from "./actions";

export function ContactForm() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setMessage("");
    setSent(false);
    const animationDelay = new Promise((resolve) => window.setTimeout(resolve, 650));

    startTransition(async () => {
      const [result] = await Promise.all([submitContactInquiry(formData), animationDelay]);
      setMessage(result.message);
      if (result.ok) {
        setSent(true);
        form.reset();
      }
    });
  }

  return (
    <form
      className="contact-form"
      onSubmit={submit}
      onChange={() => {
        if (sent) {
          setSent(false);
          setMessage("");
        }
      }}
    >
      <p className="contact-form__eyebrow">CONTACT</p>
      <h1>Tell us what you have in mind.</h1>
      <label>
        <span>Your name</span>
        <input name="name" autoComplete="name" required maxLength={100} />
      </label>
      <label>
        <span>Mobile number</span>
        <input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={30} />
      </label>
      <label>
        <span>Email address</span>
        <input name="email" type="email" autoComplete="email" required maxLength={254} />
      </label>
      <label>
        <span>What would you like us to do?</span>
        <textarea name="request" rows={4} required maxLength={3000} />
      </label>
      {message && (
        <p className={`contact-form__message${sent ? " is-success" : ""}`} role="status">
          {message}
        </p>
      )}
      <button
        type="submit"
        className={`btn btn--primary contact-form__send${pending ? " is-sending" : ""}${sent ? " is-sent" : ""}`}
        disabled={pending}
      >
        <span className="contact-form__envelope" aria-hidden="true">
          <span className="contact-form__paper" />
          <span className="contact-form__flap" />
        </span>
        <span>{pending ? "Sending…" : sent ? "Sent" : "Send message"}</span>
      </button>
    </form>
  );
}

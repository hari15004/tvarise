"use server";

import { createClient } from "@/lib/supabase/server";

export async function submitContactInquiry(formData: FormData) {
  const name = formData.get("name");
  const phone = formData.get("phone");
  const email = formData.get("email");
  const request = formData.get("request");

  if (
    typeof name !== "string" ||
    typeof phone !== "string" ||
    typeof email !== "string" ||
    typeof request !== "string"
  ) {
    return { ok: false, message: "Please fill in all fields." };
  }

  const inquiry = {
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    request: request.trim(),
  };
  if (
    inquiry.name.length < 1 ||
    inquiry.name.length > 100 ||
    inquiry.phone.length < 7 ||
    inquiry.phone.length > 30 ||
    inquiry.email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email) ||
    inquiry.request.length < 1 ||
    inquiry.request.length > 3000
  ) {
    return { ok: false, message: "Please check your details and try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_inquiries").insert(inquiry);
  if (error) {
    console.error("Could not save contact inquiry:", error.message);
    return { ok: false, message: "Your message could not be sent. Please try again." };
  }

  return { ok: true, message: "Message sent. We’ll be in touch soon." };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function markInquiryRead(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("Invalid enquiry.");
  if (!/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(id)) {
    throw new Error("Invalid enquiry.");
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login?next=/admin/inquiries");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError || profile?.role !== "admin") {
    throw new Error("Only admins can manage enquiries.");
  }

  const { error } = await supabase
    .from("contact_inquiries")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  if (error) {
    console.error("Could not mark contact inquiry read:", error.message);
    throw new Error("Could not mark enquiry as read.");
  }

  revalidatePath("/admin/inquiries");
}

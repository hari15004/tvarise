"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminInquiryBell() {
  const [unread, setUnread] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function loadUnreadCount() {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Could not verify admin for inquiry notifications:", authError.message);
        return;
      }
      if (!user) return;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError) {
        console.error("Could not verify admin role for inquiry notifications:", profileError.message);
        return;
      }
      if (profile?.role !== "admin") return;

      const { count, error } = await supabase
        .from("contact_inquiries")
        .select("id", { count: "exact", head: true })
        .is("read_at", null);
      if (error) {
        console.error("Could not load unread inquiry count:", error.message);
        return;
      }
      if (active) setUnread(count ?? 0);
    }

    void loadUnreadCount();
    const interval = window.setInterval(() => void loadUnreadCount(), 15000);
    window.addEventListener("focus", loadUnreadCount);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", loadUnreadCount);
    };
  }, []);

  if (unread === null) return null;

  return (
    <Link
      href="/admin/inquiries"
      className="cta__inquiry-bell"
      aria-label={unread ? `${unread} unread enquiries` : "Enquiry inbox"}
      title="Enquiry inbox"
    >
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
      </svg>
      {unread > 0 && <span className="cta__inquiry-count">{unread > 99 ? "99+" : unread}</span>}
    </Link>
  );
}

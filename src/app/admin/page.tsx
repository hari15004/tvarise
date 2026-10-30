import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminContentSnapshot } from "@/lib/content";
import { createClient } from "@/lib/supabase/server";
import CmsEditor from "./CmsEditor";
import "./admin.css";

export const metadata: Metadata = { title: "Admin | Tvarise" };

async function AdminContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return <p className="admin__notice">Admin permissions verify nahi ho paaye. Supabase profile setup check karein.</p>;
  }
  if (profile?.role !== "admin") {
    return (
      <div className="admin__notice">
        <h1>Admin access required</h1>
        <p>Is account ko Supabase mein admin role dene ke baad yahan content manage kar sakte hain.</p>
        <Link href="/">Back to website</Link>
      </div>
    );
  }

  return <CmsEditor initialDocuments={await getAdminContentSnapshot()} />;
}

export default function AdminPage() {
  return (
    <section className="admin">
      <Suspense fallback={<p className="admin__notice">Admin load ho raha hai…</p>}>
        <AdminContent />
      </Suspense>
    </section>
  );
}

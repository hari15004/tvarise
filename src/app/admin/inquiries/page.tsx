import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "../LogoutButton";
import { markInquiryRead } from "./actions";
import "./inquiries.css";

export const metadata: Metadata = { title: "Enquiries | Tvarise Admin" };

type Inquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  request: string;
  created_at: string;
  read_at: string | null;
};

async function InquiriesContent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin/inquiries");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return (
      <section className="admin">
        <div className="admin__notice">
          <h1>Admin access required</h1>
          <p>Enquiries sirf admin account mein dekhi ja sakti hain.</p>
          <Link href="/">Back to website</Link>
        </div>
      </section>
    );
  }

  const { data, error } = await supabase
    .from("contact_inquiries")
    .select("id, name, phone, email, request, created_at, read_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <section className="admin">
      <div className="admin__wrap">
        <header className="admin__header">
          <div>
            <p className="admin__eyebrow">TVARISE / PRIVATE INBOX</p>
            <h1>Enquiries</h1>
            <p className="admin__intro">Website contact form se aayi messages, sirf admin ke liye.</p>
          </div>
          <div className="admin__header-links">
            <Link className="admin__back" href="/admin">Content admin</Link>
            <LogoutButton />
          </div>
        </header>
        {error ? (
          <p className="inquiries__notice">
            Enquiries load nahi ho paayi. Supabase mein contact-inquiries migration apply karein.
          </p>
        ) : !data?.length ? (
          <p className="inquiries__notice">Abhi koi enquiry nahi aayi hai.</p>
        ) : (
          <ul className="inquiries">
            {(data as Inquiry[]).map((inquiry) => (
              <li className={`inquiry${inquiry.read_at ? "" : " is-new"}`} key={inquiry.id}>
                <div className="inquiry__top">
                  <div>
                    <h2>{inquiry.name}</h2>
                    {!inquiry.read_at && <span className="inquiry__badge">New</span>}
                  </div>
                  <time dateTime={inquiry.created_at}>
                    {new Date(inquiry.created_at).toLocaleString()}
                  </time>
                </div>
                <div className="inquiry__contacts">
                  <a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a>
                  <a href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                </div>
                <p className="inquiry__request">{inquiry.request}</p>
                {!inquiry.read_at && (
                  <form action={markInquiryRead}>
                    <input type="hidden" name="id" value={inquiry.id} />
                    <button className="admin__back" type="submit">Mark as read</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function InquiriesPage() {
  return (
    <Suspense fallback={<section className="admin"><p className="admin__notice">Enquiries load ho rahi hain…</p></section>}>
      <InquiriesContent />
    </Suspense>
  );
}

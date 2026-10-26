"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveMember } from "./actions";

type Initial = {
  name: string;
  role_title: string;
  bio: string;
  skills: string[];
  email: string;
  available: boolean;
};

const box = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #555",
  background: "transparent",
  color: "inherit",
  width: "100%",
} as const;

export default function EditPanel({ slug, initial }: { slug: string; initial: Initial }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ ...initial, skillsText: initial.skills.join(", ") });
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function onSave() {
    setMsg("");
    start(async () => {
      const res = await saveMember(slug, {
        name: f.name,
        role_title: f.role_title,
        bio: f.bio,
        skills: f.skillsText.split(","),
        email: f.email,
        available: f.available,
      });
      if (res.ok) {
        setMsg("Save ho gaya.");
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ position: "fixed", right: 16, bottom: 16, zIndex: 50, padding: "12px 18px", borderRadius: 999, border: 0, background: "#d4af37", color: "#000", fontWeight: 600 }}
      >
        Edit page
      </button>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, overflowY: "auto", background: "rgba(0,0,0,0.92)", padding: 20 }}>
      <div style={{ display: "grid", gap: 12, maxWidth: 480, margin: "0 auto" }}>
        <h2 style={{ margin: 0 }}>Edit page</h2>
        <input style={box} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Naam" />
        <input style={box} value={f.role_title} onChange={(e) => setF({ ...f, role_title: e.target.value })} placeholder="Role" />
        <textarea style={{ ...box, minHeight: 120 }} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} placeholder="About" />
        <input style={box} value={f.skillsText} onChange={(e) => setF({ ...f, skillsText: e.target.value })} placeholder="Skills (comma se alag)" />
        <input style={box} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Contact email" />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={f.available} onChange={(e) => setF({ ...f, available: e.target.checked })} />
          Available for work
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onSave} disabled={pending} style={{ flex: 1, padding: 12, borderRadius: 8, border: 0, background: "#d4af37", color: "#000", fontWeight: 600 }}>
            {pending ? "Wait..." : "Save"}
          </button>
          <button onClick={() => setOpen(false)} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #555", background: "transparent", color: "inherit" }}>
            Close
          </button>
        </div>
        {msg && <p style={{ margin: 0 }}>{msg}</p>}
      </div>
    </div>
  );
}

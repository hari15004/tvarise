"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { saveMember } from "./actions";

type Link = { label: string; href: string };
type Work = { title: string; summary: string; link?: string; image?: string };
type Initial = {
  name: string;
  role_title: string;
  bio: string;
  skills: string[];
  email: string;
  available: boolean;
  short_line: string;
  links: Link[];
  work: Work[];
  portfolioUrl: string;
  portrait: string | null;
};

function MemberImageControl({
  value,
  label,
  onChange,
}: {
  value: string | null;
  label: string;
  onChange: (value: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("JPG, PNG, WebP ya AVIF photo chunein.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Photo 8 MB se chhoti honi chahiye.");
      return;
    }
    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Login expire ho gaya. Dobara login karke try karein.");
        return;
      }
      const extension = file.type.split("/")[1].replace("jpeg", "jpg");
      const { data, error: uploadError } = await supabase.storage
        .from("tvarise-media")
        .upload(`${user.id}/${crypto.randomUUID()}.${extension}`, file, {
          cacheControl: "3600",
          contentType: file.type,
        });
      if (uploadError) {
        setError(`Photo upload nahi hui: ${uploadError.message}`);
        return;
      }
      onChange(supabase.storage.from("tvarise-media").getPublicUrl(data.path).data.publicUrl);
    } catch (uploadError) {
      setError(`Photo upload nahi hui: ${uploadError instanceof Error ? uploadError.message : "Network error"}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="member-editor__image-control">
      <div className="member-editor__section-heading">
        <div><h3>{label}</h3><p>Image upload karein ya URL paste karein.</p></div>
      </div>
      <div className="member-editor__portrait">
        {value ? <img src={value} alt={`${label} preview`} /> : <span>Image nahi hai</span>}
        <div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? "Uploading…" : value ? "Change image" : "Upload image"}
          </button>
          {value && <button type="button" onClick={() => onChange("")}>Remove image</button>}
        </div>
        <input
          ref={inputRef}
          className="member-editor__file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          onChange={(event) => {
            void upload(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </div>
      <label><span>Image URL</span><input type="url" placeholder="https://..." value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></label>
      {error && <p className="member-editor__message" role="alert">{error}</p>}
    </div>
  );
}

export default function EditPanel({ slug, initial }: { slug: string; initial: Initial }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  function save() {
    setMessage("");
    startTransition(async () => {
      const result = await saveMember(slug, form);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setMessage("Changes save ho gaye.");
      router.refresh();
    });
  }

  if (!open) {
    return (
      <button type="button" className="member-editor__open" data-member-editor onClick={() => setOpen(true)}>
        Edit profile
      </button>
    );
  }

  return (
    <div className="member-editor__backdrop" data-member-editor role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !pending) setOpen(false);
    }}>
      <section className="member-editor" role="dialog" aria-modal="true" aria-labelledby="member-editor-title">
        <header className="member-editor__header">
          <div>
            <p>PROFILE EDITOR</p>
            <h2 id="member-editor-title">Edit profile: {form.name}</h2>
            <span className="member-editor__hint">Photo · availability · skills · work · links</span>
          </div>
          <button type="button" aria-label="Close editor" onClick={() => setOpen(false)}>×</button>
        </header>

        <nav className="member-editor__nav" aria-label="Profile sections">
          {[
            ["edit-basics", "Basics"],
            ["edit-photo", "Photo"],
            ["edit-availability", "Availability"],
            ["edit-skills", "Skills"],
            ["edit-work", "Work"],
            ["edit-links", "Find me on"],
            ["edit-portfolio", "Portfolio"],
          ].map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
        </nav>

        <div className="member-editor__body">
          <div className="member-editor__grid" id="edit-basics">
            <label>
              <span>Name</span>
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              <span>Role</span>
              <input value={form.role_title} onChange={(event) => setForm({ ...form, role_title: event.target.value })} />
            </label>
            <label className="member-editor__wide">
              <span>Short intro</span>
              <input value={form.short_line} onChange={(event) => setForm({ ...form, short_line: event.target.value })} />
            </label>
            <label className="member-editor__wide">
              <span>About</span>
              <textarea rows={5} value={form.bio} onChange={(event) => setForm({ ...form, bio: event.target.value })} />
            </label>
            <label className="member-editor__wide">
              <span>Contact email</span>
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </label>
          </div>

          <section className="member-editor__section" id="edit-photo">
          <MemberImageControl
            value={form.portrait}
            label="Profile photo"
            onChange={(portrait) => setForm({ ...form, portrait })}
          />
          </section>

          <label id="edit-availability" className={`member-editor__availability${form.available ? " is-available" : " is-unavailable"}`}>
            <input
              type="checkbox"
              checked={form.available}
              onChange={(event) => setForm({ ...form, available: event.target.checked })}
            />
            <i aria-hidden="true" />
            <span>
              <strong>{form.available ? "Available for work" : "Not available for work"}</strong>
              <small>Availability badge profile par {form.available ? "green" : "red"} light ke saath dikhega.</small>
            </span>
          </label>

          <section className="member-editor__section" id="edit-skills">
            <div className="member-editor__section-heading">
              <div><h3>Skills</h3><p>Profile par dikhne wali skills add karein.</p></div>
              <button type="button" onClick={() => setForm({ ...form, skills: [...form.skills, ""] })}>+ Add skill</button>
            </div>
            {form.skills.length === 0 && <p className="member-editor__empty">Abhi koi skill nahi hai.</p>}
            {form.skills.map((skill, index) => (
              <div className="member-editor__row" key={`skill-${index}`}>
                <input
                  aria-label={`Skill ${index + 1}`}
                  value={skill}
                  placeholder="e.g. UI Design"
                  onChange={(event) => setForm({ ...form, skills: form.skills.map((item, i) => i === index ? event.target.value : item) })}
                />
                <button type="button" aria-label={`Remove skill ${index + 1}`} onClick={() => setForm({ ...form, skills: form.skills.filter((_, i) => i !== index) })}>Remove</button>
              </div>
            ))}
          </section>

          <section className="member-editor__section" id="edit-work">
            <div className="member-editor__section-heading">
              <div><h3>My work</h3><p>Projects ya work samples add karein.</p></div>
              <button type="button" onClick={() => setForm({ ...form, work: [...form.work, { title: "", summary: "", link: "", image: "" }] })}>+ Add work</button>
            </div>
            {form.work.length === 0 && <p className="member-editor__empty">Abhi koi work sample nahi hai.</p>}
            {form.work.map((item, index) => (
              <fieldset className="member-editor__item" key={`work-${index}`}>
                <legend>Work {index + 1}</legend>
                <button type="button" className="member-editor__remove" onClick={() => setForm({ ...form, work: form.work.filter((_, i) => i !== index) })}>Remove</button>
                <label><span>Title</span><input value={item.title} onChange={(event) => setForm({ ...form, work: form.work.map((work, i) => i === index ? { ...work, title: event.target.value } : work) })} /></label>
                <label><span>Description</span><textarea rows={3} value={item.summary} onChange={(event) => setForm({ ...form, work: form.work.map((work, i) => i === index ? { ...work, summary: event.target.value } : work) })} /></label>
                <label><span>Work link (optional)</span><input type="url" placeholder="https://" value={item.link ?? ""} onChange={(event) => setForm({ ...form, work: form.work.map((work, i) => i === index ? { ...work, link: event.target.value } : work) })} /></label>
                <MemberImageControl
                  value={item.image ?? ""}
                  label="Work photo (optional)"
                  onChange={(image) => setForm({ ...form, work: form.work.map((work, i) => i === index ? { ...work, image } : work) })}
                />
              </fieldset>
            ))}
          </section>

          <section className="member-editor__section" id="edit-links">
            <div className="member-editor__section-heading">
              <div><h3>Find me on</h3><p>Social ya professional profile links add karein.</p></div>
              <button type="button" onClick={() => setForm({ ...form, links: [...form.links, { label: "", href: "" }] })}>+ Add link</button>
            </div>
            {form.links.filter((link) => link.label.toLowerCase() !== "portfolio").length === 0 && <p className="member-editor__empty">Abhi koi social link nahi hai.</p>}
            {form.links.map((link, index) => link.label.toLowerCase() === "portfolio" ? null : (
              <div className="member-editor__row member-editor__row--link" key={`link-${index}`}>
                <input aria-label={`Link name ${index + 1}`} placeholder="LinkedIn" value={link.label} onChange={(event) => setForm({ ...form, links: form.links.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
                <input aria-label={`Link URL ${index + 1}`} type="url" placeholder="https://" value={link.href} onChange={(event) => setForm({ ...form, links: form.links.map((item, i) => i === index ? { ...item, href: event.target.value } : item) })} />
                <button type="button" aria-label={`Remove link ${index + 1}`} onClick={() => setForm({ ...form, links: form.links.filter((_, i) => i !== index) })}>Remove</button>
              </div>
            ))}
          </section>

          <section className="member-editor__section" id="edit-portfolio">
            <div className="member-editor__section-heading">
              <div><h3>Personal portfolio</h3><p>Profile par “View portfolio” button dikhega.</p></div>
            </div>
            <label><span>Portfolio website URL</span><input type="url" placeholder="https://yourportfolio.com" value={form.portfolioUrl} onChange={(event) => setForm({ ...form, portfolioUrl: event.target.value })} /></label>
          </section>

          {message && <p className={`member-editor__message${message.includes("save") ? " is-success" : ""}`} role="status">{message}</p>}
        </div>

        <footer className="member-editor__footer">
          <button type="button" onClick={() => setOpen(false)} disabled={pending}>Cancel</button>
          <button type="button" className="member-editor__save" onClick={save} disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </section>
    </div>
  );
}

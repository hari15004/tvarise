"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteContentDocument, saveContentDocument } from "./actions";
import type { CmsCollection, CmsDocument } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

const sections: { id: CmsCollection; label: string; singleton?: boolean }[] = [
  { id: "site", label: "Site, menu & logo", singleton: true },
  { id: "home", label: "Homepage", singleton: true },
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "team", label: "Team members" },
  { id: "building", label: "Currently building" },
];

const homeSectionNames = [
  "services",
  "work",
  "building",
  "process",
  "team",
  "about",
  "cta",
] as const;

const nestedDefaults: Record<string, unknown> = {
  nav: { label: "", href: "/" },
  social: { label: "", href: "https://" },
  links: { label: "", href: "https://" },
  why: { title: "", text: "" },
  process: { title: "", text: "" },
  work: { title: "", summary: "", link: "", image: "" },
  pages: { label: "", title: "", note: "" },
  sections: { label: "", title: "" },
};

function template(collection: CmsCollection, slug: string): Record<string, unknown> {
  const shared = { slug, order: 1, published: false, placeholder: true };
  if (collection === "services") {
    return { ...shared, title: "", summary: "", includes: [], pieceId: "" };
  }
  if (collection === "team") {
    return {
      ...shared,
      name: "",
      role: "",
      shortLine: "",
      bio: "",
      portrait: null,
      links: [],
      pieceId: "",
      skills: [],
      email: "",
      available: true,
      work: [],
    };
  }
  if (collection === "projects") {
    return {
      ...shared,
      title: "",
      year: null,
      services: [],
      team: [],
      cover: null,
      summary: "",
      featured: false,
    };
  }
  return {
    ...shared,
    title: "",
    description: "",
    status: "",
    updatedAt: new Date().toISOString().slice(0, 10),
  };
}

function humanize(value: string) {
  if (value === "nav") return "Menu items";
  if (value === "social") return "Social links";
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function defaultForField(key: string): unknown {
  if (nestedDefaults[key]) return structuredClone(nestedDefaults[key]);
  if (["nav", "social", "links"].includes(key)) return { label: "", href: "" };
  if (["why", "process", "work"].includes(key)) return { title: "", text: "" };
  return "";
}

function MediaField({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dragging, setDragging] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setError("");
    setNotice("");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("JPG, PNG, WebP ya AVIF image select karein.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Image 8 MB se chhoti honi chahiye.");
      return;
    }
    setUploading(true);
    try {
      const extension = file.type.split("/")[1].replace("jpeg", "jpg");
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Admin login expire ho gaya. Dobara login karke photo upload karein.");
        return;
      }
      const { data, error: uploadError } = await supabase.storage
        .from("tvarise-media")
        .upload(`${crypto.randomUUID()}.${extension}`, file, {
          cacheControl: "3600",
          contentType: file.type,
        });
      if (uploadError) {
        const detail = uploadError.message.toLowerCase();
        if (detail.includes("row-level security") || detail.includes("not authorized")) {
          setError("Upload ki permission nahi mili. Supabase mein is account ka Admin role check karein.");
        } else if (detail.includes("bucket") && detail.includes("not found")) {
          setError("Photo storage set up nahi hai. Supabase media migration apply karein.");
        } else {
          setError(`Photo upload nahi hui: ${uploadError.message}`);
        }
        return;
      }
      onChange(supabase.storage.from("tvarise-media").getPublicUrl(data.path).data.publicUrl);
      setNotice("Photo upload ho gayi. Website par dikhane ke liye neeche “Save changes” dabayein.");
    } catch (error) {
      setError(`Photo upload nahi hui: ${error instanceof Error ? error.message : "Network error"}`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="admin__media">
      <div
        className={`admin__upload${dragging ? " is-dragging" : ""}${uploading ? " is-uploading" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void upload(event.dataTransfer.files[0]);
        }}
      >
        {value ? (
          <img className="admin__image-preview" src={value} alt={`${label} preview`} />
        ) : (
          <span className="admin__upload-icon" aria-hidden="true">↑</span>
        )}
        <div className="admin__upload-copy">
          <strong>{uploading ? "Photo upload ho rahi hai…" : value ? `${label} set hai` : `${label} add karein`}</strong>
          <span>Photo yahan drag karein ya device se select karein. JPG, PNG, WebP, AVIF · max 8 MB</span>
        </div>
        <button
          type="button"
          className="admin__upload-button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? "Upload…" : value ? "Photo badlein" : "Photo chunein"}
        </button>
        <input
          ref={inputRef}
          className="admin__file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          onChange={(event) => {
            void upload(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
      </div>
      <label className="admin__field admin__media-url">
        <span>Ya image ka URL paste karein</span>
        <input
          value={value}
          placeholder="https://... ya /images/photo.jpg"
          onChange={(event) => {
            setError("");
            setNotice("");
            onChange(event.target.value);
          }}
        />
      </label>
      {error && <p className="admin__upload-error" role="alert">{error}</p>}
      {notice && <p className="admin__upload-notice" role="status">{notice}</p>}
    </div>
  );
}

function FieldEditor({
  name,
  value,
  onChange,
  depth = 0,
}: {
  name: string;
  value: unknown;
  onChange: (value: unknown) => void;
  depth?: number;
}) {
  const label = humanize(name);

  if (name === "sectionOrder" || name === "sectionVisibility") return null;

  if (typeof value === "boolean") {
    return (
      <label className="admin__toggle">
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
        <span>{label}</span>
      </label>
    );
  }

  if (typeof value === "number" || (value === null && ["year", "progress"].includes(name))) {
    return (
      <label className="admin__field">
        <span>{label}</span>
        <input
          type="number"
          value={value === null ? "" : value}
          min={name === "progress" ? 0 : undefined}
          max={name === "progress" ? 100 : undefined}
          onChange={(event) =>
            onChange(event.target.value === "" ? null : Number(event.target.value))
          }
        />
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <fieldset className="admin__group">
        <legend>{label}</legend>
        {value.length === 0 && <p className="admin__empty">No items added yet.</p>}
        <div className="admin__array">
          {value.map((item, index) => (
            <div className="admin__array-item" key={`${name}-${index}`}>
              <div className="admin__array-actions" aria-label={`${label} item ${index + 1} controls`}>
                <strong>{label} {index + 1}</strong>
                <div>
                  <button
                    type="button"
                    aria-label={`Move ${label} item up`}
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...value];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      onChange(next);
                    }}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label={`Move ${label} item down`}
                    disabled={index === value.length - 1}
                    onClick={() => {
                      const next = [...value];
                      [next[index], next[index + 1]] = [next[index + 1], next[index]];
                      onChange(next);
                    }}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="admin__array-remove"
                    aria-label={`Remove ${label} item`}
                    onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
                  >
                    Remove
                  </button>
                </div>
              </div>
              {typeof item === "string" || typeof item === "number" ? (
                <input
                  className="admin__control"
                  aria-label={`${label} ${index + 1}`}
                  value={String(item)}
                  onChange={(event) => {
                    const next = [...value];
                    next[index] = typeof item === "number" ? Number(event.target.value) : event.target.value;
                    onChange(next);
                  }}
                />
              ) : (
                <ObjectFields
                  value={item}
                  onChange={(nextItem) => {
                    const next = [...value];
                    next[index] = nextItem;
                    onChange(next);
                  }}
                  depth={depth + 1}
                />
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin__add-item"
          onClick={() => onChange([...value, defaultForField(name)])}
        >
          + Add {label.toLowerCase()}
        </button>
      </fieldset>
    );
  }

  if (value !== null && typeof value === "object") {
    return (
      <fieldset className="admin__group">
        <legend>{label}</legend>
        <ObjectFields value={value} onChange={onChange} depth={depth + 1} />
      </fieldset>
    );
  }

  if (value === null || typeof value === "string") {
    const text = value ?? "";
    const isLong = ["bio", "summary", "description", "text", "note", "tagline"].includes(name);
    const isUrl = ["portrait", "cover", "image", "href", "link"].includes(name);
    const isImage = ["logo", "portrait", "cover", "image"].includes(name);
    const setValue = (input: string) =>
      onChange(value === null && input === "" ? null : input);
    if (isImage && !isLong) {
      return (
        <MediaField
          label={label}
          value={String(text)}
          onChange={(input) => setValue(input)}
        />
      );
    }
    return (
      <label className={`admin__field${depth > 0 ? " admin__field--nested" : ""}`}>
        <span>{label}</span>
        {isLong ? (
          <textarea
            rows={Math.min(8, Math.max(3, String(text).split("\n").length + 1))}
            value={String(text)}
            onChange={(event) => setValue(event.target.value)}
          />
        ) : (
          <input
            type={name.toLowerCase().includes("email") ? "email" : "text"}
            placeholder={isUrl ? "Image URL or /images/file.jpg" : ""}
            value={String(text)}
            readOnly={name === "slug"}
            onChange={(event) => setValue(event.target.value)}
          />
        )}
        {name === "slug" && <small className="admin__field-hint">Record URL ka ID; change nahi hota.</small>}
        {isUrl && text && !isImage && (
          <small className="admin__field-hint">URL: {String(text)}</small>
        )}
      </label>
    );
  }

  return null;
}

function ObjectFields({
  value,
  onChange,
  depth = 0,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  depth?: number;
}) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;

  return (
    <div className={`admin__fields${depth === 0 ? " admin__fields--root" : ""}`}>
      {Object.entries(record).map(([key, fieldValue]) => (
        <FieldEditor
          key={key}
          name={key}
          value={fieldValue}
          depth={depth}
          onChange={(nextValue) => onChange({ ...record, [key]: nextValue })}
        />
      ))}
    </div>
  );
}

export default function CmsEditor({ initialDocuments }: { initialDocuments: CmsDocument[] }) {
  const router = useRouter();
  const [documents, setDocuments] = useState(initialDocuments);
  const [collection, setCollection] = useState<CmsCollection>("site");
  const visible = useMemo(
    () => documents.filter((document) => document.collection === collection),
    [documents, collection]
  );
  const [slug, setSlug] = useState("singleton");
  const selected = visible.find((document) => document.slug === slug) ?? visible[0];
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [newSlug, setNewSlug] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const content = draft ?? selected?.content ?? null;

  function chooseCollection(next: CmsCollection) {
    if (draft && !window.confirm("Unsaved changes discard karne hain?")) return;
    setCollection(next);
    const first = documents.find((document) => document.collection === next);
    setSlug(first?.slug ?? "singleton");
    setDraft(null);
    setMessage("");
  }

  function chooseDocument(document: CmsDocument) {
    if (draft && !window.confirm("Unsaved changes discard karne hain?")) return;
    setSlug(document.slug);
    setDraft(null);
    setMessage("");
  }

  function addDocument() {
    if (draft && !window.confirm("Unsaved changes discard karke naya item add karein?")) return;
    const nextSlug = newSlug.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(nextSlug)) {
      setMessage("Slug lowercase letters, numbers aur hyphens mein likhein.");
      return;
    }
    if (documents.some((document) => document.collection === collection && document.slug === nextSlug)) {
      setMessage("Is slug ka record pehle se hai.");
      return;
    }
    const content = template(collection, nextSlug);
    const document = { collection, slug: nextSlug, content } satisfies CmsDocument;
    setDocuments((current) => [...current, document]);
    setSlug(nextSlug);
    setDraft(content);
    setNewSlug("");
    setMessage("Naya draft bana. Details fill karke save karein.");
  }

  function moveHomeSection(section: (typeof homeSectionNames)[number], direction: -1 | 1) {
    const current = draft ?? selected?.content;
    if (!current) return;
    const order = Array.isArray(current.sectionOrder)
      ? [...current.sectionOrder] as string[]
      : [...homeSectionNames];
    const index = order.indexOf(section);
    const swapWith = index + direction;
    if (index < 0 || swapWith < 0 || swapWith >= order.length) return;
    [order[index], order[swapWith]] = [order[swapWith], order[index]];
    setDraft({ ...current, sectionOrder: order });
  }

  function toggleHomeSection(section: string) {
    const current = draft ?? selected?.content;
    if (!current) return;
    const currentVisibility =
      current.sectionVisibility && typeof current.sectionVisibility === "object"
        ? current.sectionVisibility as Record<string, boolean>
        : Object.fromEntries(homeSectionNames.map((name) => [name, true]));
    setDraft({
      ...current,
      sectionVisibility: {
        ...currentVisibility,
        [section]: currentVisibility[section] === false,
      },
    });
  }

  function save() {
    if (!selected || !content) return;
    setMessage("");
    startTransition(async () => {
      const result = await saveContentDocument(collection, selected.slug, JSON.stringify(content));
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      setDocuments((current) =>
        current.map((document) =>
          document.collection === collection && document.slug === selected.slug
            ? { ...document, content }
            : document
        )
      );
      setDraft(null);
      setMessage("Save ho gaya—website par changes update ho gaye.");
      router.refresh();
    });
  }

  function remove() {
    if (!selected || !window.confirm(`"${selected.slug}" ko website se remove karna hai?`)) return;
    startTransition(async () => {
      const result = await deleteContentDocument(collection, selected.slug);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      const remaining = documents.filter(
        (document) => !(document.collection === collection && document.slug === selected.slug)
      );
      setDocuments(remaining);
      setSlug(remaining.find((document) => document.collection === collection)?.slug ?? "");
      setDraft(null);
      setMessage("Record website se remove ho gaya.");
      router.refresh();
    });
  }

  const singleton = sections.find((section) => section.id === collection)?.singleton;
  const homeOrder = Array.isArray(content?.sectionOrder)
    ? content.sectionOrder as string[]
    : [...homeSectionNames];
  const homeVisibility =
    content?.sectionVisibility && typeof content.sectionVisibility === "object"
      ? content.sectionVisibility as Record<string, boolean>
      : {};

  return (
    <div className="admin__wrap">
      <header className="admin__header">
        <div>
          <p className="admin__eyebrow">TVARISE / CONTENT STUDIO</p>
          <h1>Website admin</h1>
          <p className="admin__intro">
            Website ka text, menu, logo aur photos yahan se badlein. Har change ke baad “Save changes” dabana na bhoolein.
          </p>
        </div>
        <Link className="admin__back" href="/">Website dekhein ↗</Link>
      </header>

      <div className="admin__layout">
        <aside className="admin__sidebar" aria-label="Content collections">
          <p className="admin__label">WEBSITE KE HISSE</p>
          {sections.map((section) => (
            <button
              type="button"
              key={section.id}
              className={`admin__section${collection === section.id ? " is-active" : ""}`}
              onClick={() => chooseCollection(section.id)}
            >
              <span>{section.label}</span>
              <span className="admin__count">
                {section.singleton
                  ? "01"
                  : String(documents.filter((item) => item.collection === section.id).length).padStart(2, "0")}
              </span>
            </button>
          ))}
          <p className="admin__hint">
            Koi tab chunein, content badlein, phir Save karein. Changes turant website par dikhne chahiye.
          </p>
        </aside>

        <section className="admin__workspace" aria-label="Website content editor">
          <div className="admin__records">
            <div className="admin__records-head">
              <p className="admin__label">{singleton ? "SETTINGS" : "ITEMS"}</p>
              {!singleton && (
                <div className="admin__add">
                  <input
                    aria-label="Naye item ka naam"
                    placeholder="naya-item"
                    value={newSlug}
                    onChange={(event) => setNewSlug(event.target.value)}
                  />
                  <button type="button" onClick={addDocument}>+ Add</button>
                </div>
              )}
            </div>
            {visible.length === 0 ? (
              <p className="admin__empty">Abhi koi item nahi hai. Naya item add karein.</p>
            ) : (
              <ul>
                {visible.map((document) => (
                  <li key={document.slug}>
                    <button
                      type="button"
                      className={`admin__record${(selected?.slug ?? slug) === document.slug ? " is-active" : ""}`}
                      onClick={() => chooseDocument(document)}
                    >
                      <span>{String(document.content.title ?? document.content.name ?? document.slug)}</span>
                      {document.content.published === false && <small>Draft</small>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="admin__editor">
            <div className="admin__editor-head">
              <div>
                <p className="admin__label">EDIT WEBSITE</p>
                <h2>{String(content?.title ?? content?.name ?? selected?.slug ?? "Naya item")}</h2>
              </div>
              <div className="admin__actions">
                {selected && !singleton && (
                  <button type="button" className="admin__delete" disabled={pending} onClick={remove}>
                    Delete item
                  </button>
                )}
                <button type="button" className="admin__save" disabled={pending || !content} onClick={save}>
                  {pending ? "Save ho raha hai…" : "Save changes"}
                </button>
              </div>
            </div>

            {collection === "home" && content && (
              <fieldset className="admin__group admin__section-order">
                <legend>Homepage par sections ka order</legend>
                <p>↑ ↓ se section ki position badlein.</p>
                <ol>
                  {homeOrder.map((section, index) => (
                    <li key={section}>
                      <span>
                        {index + 1}. {humanize(section)}
                        {homeVisibility[section] === false && " (hidden)"}
                      </span>
                      <div>
                        <button
                          type="button"
                          aria-label={`${humanize(section)} show/hide`}
                          onClick={() => toggleHomeSection(section)}
                        >
                          {homeVisibility[section] === false
                            ? "Show"
                            : "Hide"}
                        </button>
                        <button
                          type="button"
                          aria-label={`${humanize(section)} ko upar karein`}
                          disabled={index === 0}
                          onClick={() => moveHomeSection(section as (typeof homeSectionNames)[number], -1)}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          aria-label={`${humanize(section)} ko neeche karein`}
                          disabled={index === homeOrder.length - 1}
                          onClick={() => moveHomeSection(section as (typeof homeSectionNames)[number], 1)}
                        >
                          ↓
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              </fieldset>
            )}

            {content ? (
              <ObjectFields value={content} onChange={(next) => setDraft(next as Record<string, unknown>)} />
            ) : (
              <p className="admin__empty">Edit karne ke liye koi item select karein ya naya item add karein.</p>
            )}
            {message && <p className="admin__message" role="status">{message}</p>}
            <div className="admin__editor-footer">
              <span>Photo upload ke baad “Save changes” dabayein; tabhi website par update hogi.</span>
              <Link href="/" target="_blank" rel="noreferrer">Website preview kholen ↗</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

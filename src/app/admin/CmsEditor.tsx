"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteContentDocument,
  saveContentDocument,
} from "./actions";
import type { CmsCollection, CmsDocument } from "@/lib/types";

const sections: { id: CmsCollection; label: string; singleton?: boolean }[] = [
  { id: "site", label: "Site settings", singleton: true },
  { id: "home", label: "Homepage sections", singleton: true },
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "team", label: "Team members" },
  { id: "building", label: "Currently building" },
];

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
  return { ...shared, title: "", description: "", status: "", updatedAt: new Date().toISOString() };
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
  const [text, setText] = useState(() => JSON.stringify(selected?.content ?? {}, null, 2));
  const [newSlug, setNewSlug] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function chooseCollection(next: CmsCollection) {
    setCollection(next);
    const first = documents.find((document) => document.collection === next);
    setSlug(first?.slug ?? "singleton");
    setText(JSON.stringify(first?.content ?? {}, null, 2));
    setMessage("");
  }

  function chooseDocument(document: CmsDocument) {
    setSlug(document.slug);
    setText(JSON.stringify(document.content, null, 2));
    setMessage("");
  }

  function addDocument() {
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
    setText(JSON.stringify(content, null, 2));
    setNewSlug("");
    setMessage("Naya draft bana. Publish karne se pehle fields update karke save karein.");
  }

  function save() {
    setMessage("");
    startTransition(async () => {
      const result = await saveContentDocument(collection, selected?.slug ?? slug, text);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      let content: Record<string, unknown>;
      try {
        content = JSON.parse(text) as Record<string, unknown>;
      } catch {
        setMessage("Saved, lekin editor JSON parse nahi kar paaya.");
        return;
      }
      setDocuments((current) =>
        current.map((document) =>
          document.collection === collection && document.slug === (selected?.slug ?? slug)
            ? { ...document, content }
            : document
        )
      );
      setMessage("Changes save ho gaye.");
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
      const next = remaining.find((document) => document.collection === collection);
      setDocuments(remaining);
      setSlug(next?.slug ?? "");
      setText(JSON.stringify(next?.content ?? {}, null, 2));
      setMessage("Record remove ho gaya.");
      router.refresh();
    });
  }

  return (
    <div className="admin__wrap">
      <header className="admin__header">
        <div>
          <p className="admin__eyebrow">TVARISE / CONTENT STUDIO</p>
          <h1>Website admin</h1>
          <p className="admin__intro">
            Site copy, homepage sections, services, projects, team aur current builds manage karein.
          </p>
        </div>
        <Link className="admin__back" href="/">View website ↗</Link>
      </header>

      <div className="admin__layout">
        <aside className="admin__sidebar" aria-label="Content collections">
          <p className="admin__label">CONTENT TYPE</p>
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
            Edits are checked on the server. JSON lets you manage every field, including media URLs,
            visibility and member details.
          </p>
        </aside>

        <section className="admin__workspace" aria-label="Edit content">
          <div className="admin__records">
            <div className="admin__records-head">
              <p className="admin__label">RECORDS</p>
              {sections.find((section) => section.id === collection)?.singleton ? null : (
                <div className="admin__add">
                  <input
                    aria-label="New record slug"
                    placeholder="new-slug"
                    value={newSlug}
                    onChange={(event) => setNewSlug(event.target.value)}
                  />
                  <button type="button" onClick={addDocument}>Add</button>
                </div>
              )}
            </div>
            {visible.length === 0 ? (
              <p className="admin__empty">No records yet. Add one with a slug.</p>
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
                <p className="admin__label">EDIT JSON</p>
                <h2>{selected?.slug ?? "Create a record"}</h2>
              </div>
              <div className="admin__actions">
                {selected && !sections.find((section) => section.id === collection)?.singleton && (
                  <button type="button" className="admin__delete" disabled={pending} onClick={remove}>
                    Remove
                  </button>
                )}
                <button type="button" className="admin__save" disabled={pending || !selected} onClick={save}>
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
            <label className="sr-only" htmlFor="admin-json">Content JSON</label>
            <textarea
              id="admin-json"
              spellCheck={false}
              value={text}
              onChange={(event) => setText(event.target.value)}
              disabled={!selected}
              aria-describedby="admin-json-help"
            />
            <p id="admin-json-help" className="admin__help">
              Use valid JSON. Collection items must keep the slug consistent with the record name.
              Set <code>published</code> to <code>false</code> to hide a record without deleting it.
            </p>
            {message && <p className="admin__message" role="status">{message}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { CmsCollection, CmsDocument } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { getInlineEditorContent, saveContentDocument } from "./actions";

const collections: { id: CmsCollection; label: string }[] = [
  { id: "site", label: "Site, menu & logo" },
  { id: "home", label: "Homepage" },
  { id: "services", label: "Services" },
  { id: "projects", label: "Projects" },
  { id: "team", label: "Team" },
  { id: "building", label: "Building" },
];

function titleOf(document: CmsDocument) {
  return String(document.content.title ?? document.content.name ?? document.slug);
}

function labelOf(key: string) {
  if (key === "inProgress") return "Currently working on this";
  if (key === "nav") return "Menu items";
  if (key === "social") return "Social links";
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function emptyValue(key: string): unknown {
  if (["nav", "social", "links"].includes(key)) {
    return { label: key === "social" ? "Instagram" : "", href: "" };
  }
  if (["process", "why"].includes(key)) return { title: "", text: "" };
  return "";
}

function newProject(order: number, inProgress: boolean): Record<string, unknown> {
  return {
    slug: "new-project",
    order,
    published: true,
    placeholder: false,
    title: "",
    year: null,
    services: [],
    team: [],
    cover: null,
    summary: "",
    featured: true,
    inProgress,
  };
}

function newService(order: number): Record<string, unknown> {
  return {
    slug: "new-service",
    order,
    published: true,
    placeholder: false,
    title: "",
    summary: "",
    includes: [],
    pieceId: "piece-web",
  };
}

function newPerson(order: number): Record<string, unknown> {
  return {
    slug: "new-person",
    order,
    published: true,
    placeholder: false,
    name: "",
    role: "",
    shortLine: "",
    bio: "",
    portrait: null,
    links: [],
    pieceId: "piece-new-person",
    skills: [],
    email: "",
    available: true,
    work: [],
  };
}

function makeSlug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findFieldPath(value: unknown, target: string, keyPath: string[] = []): string[] | null {
  if (typeof value === "string" && normalizeText(value) === target) return keyPath;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const path = findFieldPath(value[index], target, [...keyPath, String(index)]);
      if (path) return path;
    }
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (["slug", "pieceId", "updatedAt"].includes(key)) continue;
      const path = findFieldPath(child, target, [...keyPath, key]);
      if (path) return path;
    }
  }
  return null;
}

function findMediaPath(value: unknown, target: string, keyPath: string[] = []): string[] | null {
  if (
    typeof value === "string" &&
    value === target &&
    ["logo", "portrait", "cover", "image"].includes(keyPath.at(-1) ?? "")
  ) return keyPath;
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      const path = findMediaPath(value[index], target, [...keyPath, String(index)]);
      if (path) return path;
    }
  } else if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      const path = findMediaPath(child, target, [...keyPath, key]);
      if (path) return path;
    }
  }
  return null;
}

function readPath(value: unknown, path: string[]) {
  return path.reduce<unknown>((current, key) => {
    if (Array.isArray(current)) return current[Number(key)];
    if (current !== null && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, value);
}

function writePath(value: Record<string, unknown>, path: string[], nextValue: unknown): Record<string, unknown> {
  if (!path.length) return value;
  const [key, ...remaining] = path;
  if (Array.isArray(value[key])) {
    const array = [...value[key] as unknown[]];
    const index = Number(key);
    if (remaining.length) {
      array[index] = writeNested(array[index], remaining, nextValue);
    } else {
      array[index] = nextValue;
    }
    return { ...value, [key]: array };
  }
  return { ...value, [key]: remaining.length ? writeNested(value[key], remaining, nextValue) : nextValue };
}

function writeNested(value: unknown, path: string[], nextValue: unknown): unknown {
  if (!path.length) return nextValue;
  const [key, ...remaining] = path;
  if (Array.isArray(value)) {
    const array = [...value];
    const index = Number(key);
    array[index] = writeNested(array[index], remaining, nextValue);
    return array;
  }
  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return { ...record, [key]: remaining.length ? writeNested(record[key], remaining, nextValue) : nextValue };
  }
  return value;
}

function ImageControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setError("JPG, PNG, WebP ya AVIF photo select karein.");
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
        setError("Login expire ho gaya. Dobara login karke photo upload karein.");
        return;
      }
      const extension = file.type.split("/")[1].replace("jpeg", "jpg");
      const { data, error: uploadError } = await supabase.storage
        .from("tvarise-media")
        .upload(`${crypto.randomUUID()}.${extension}`, file, {
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
    <div className="visual-editor__image">
      {value ? <img src={value} alt={`${label} preview`} /> : <span className="visual-editor__image-placeholder">No photo selected</span>}
      <label className="visual-editor__upload">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={uploading}
          onChange={(event) => {
            void upload(event.currentTarget.files?.[0]);
            event.currentTarget.value = "";
          }}
        />
        <span>{uploading ? "Uploading…" : value ? "Change photo" : "Choose photo"}</span>
      </label>
      <label className="visual-editor__field">
        <span>Or paste image URL</span>
        <input value={value} onChange={(event) => onChange(event.target.value)} />
      </label>
      {error && <p className="visual-editor__error" role="alert">{error}</p>}
    </div>
  );
}

type SocialLink = { label: string; href: string };
const socialPlatforms = ["Instagram", "LinkedIn", "Facebook", "YouTube", "X", "WhatsApp", "Other"];

function SocialLinksEditor({
  value,
  onChange,
}: {
  value: unknown[];
  onChange: (value: SocialLink[]) => void;
}) {
  const links: SocialLink[] = value.map((item) => {
    if (item !== null && typeof item === "object") {
      const link = item as Record<string, unknown>;
      return {
        label: typeof link.label === "string" ? link.label : "",
        href: typeof link.href === "string" ? link.href : "",
      };
    }
    return { label: "", href: "" };
  });
  const [platform, setPlatform] = useState("");

  function addLink() {
    if (!platform) return;
    onChange([...links, { label: platform, href: "" }]);
    setPlatform("");
  }

  return (
    <fieldset className="visual-editor__group">
      <legend>Social media links</legend>
      <p className="visual-editor__status">Platform ka naam, uska profile URL, aur remove control har link ke saath hai.</p>
      {links.map((link, index) => (
        <div className="visual-editor__social-item" key={`${link.label}-${index}`}>
          <label className="visual-editor__field">
            <span>Platform name</span>
            <input
              value={link.label}
              placeholder="Instagram"
              onChange={(event) => onChange(links.map((item, i) => i === index ? { ...item, label: event.target.value } : item))}
            />
          </label>
          <label className="visual-editor__field">
            <span>Profile link</span>
            <input
              type="url"
              value={link.href}
              placeholder="https://instagram.com/your-account"
              onChange={(event) => onChange(links.map((item, i) => i === index ? { ...item, href: event.target.value } : item))}
            />
          </label>
          <button
            type="button"
            className="visual-editor__social-remove"
            onClick={() => onChange(links.filter((_, i) => i !== index))}
          >
            Remove {link.label || "link"}
          </button>
        </div>
      ))}
      <div className="visual-editor__social-add">
        <label className="visual-editor__field">
          <span>Add a platform</span>
          <select value={platform} onChange={(event) => setPlatform(event.target.value)}>
            <option value="">Choose platform</option>
            {socialPlatforms.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </label>
        <button type="button" className="visual-editor__add" disabled={!platform} onClick={addLink}>
          + Add social link
        </button>
      </div>
    </fieldset>
  );
}

function EditableFields({
  value,
  onChange,
  name = "",
  depth = 0,
  socialLinks = false,
}: {
  value: unknown;
  onChange: (value: unknown) => void;
  name?: string;
  depth?: number;
  socialLinks?: boolean;
}) {
  if (["sectionOrder", "sectionVisibility", "slug", "order", "placeholder"].includes(name)) return null;

  if (Array.isArray(value)) {
    if (name === "social") {
      return <SocialLinksEditor value={value} onChange={onChange} />;
    }
    return (
      <fieldset className="visual-editor__group">
        <legend>{labelOf(name)}</legend>
        {value.map((item, index) => (
          <div className="visual-editor__array-item" key={`${name}-${index}`}>
            <div className="visual-editor__array-head">
              <strong>{labelOf(name)} {index + 1}</strong>
              <button
                type="button"
                aria-label={`Remove ${labelOf(name)} ${index + 1}`}
                onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </div>
            <EditableFields
              name={String(index + 1)}
              value={item}
              depth={depth + 1}
              socialLinks={name === "social" || socialLinks}
              onChange={(nextItem) => {
                const next = [...value];
                next[index] = nextItem;
                onChange(next);
              }}
            />
          </div>
        ))}
        <button type="button" className="visual-editor__add" onClick={() => onChange([...value, emptyValue(name)])}>
          + Add {labelOf(name).toLowerCase()}
        </button>
      </fieldset>
    );
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      <fieldset className={`visual-editor__group${depth ? " visual-editor__group--nested" : ""}`}>
        <legend>{name ? labelOf(name) : "Content"}</legend>
        <div className="visual-editor__fields">
          {Object.entries(record).map(([key, fieldValue]) => (
            <EditableFields
              key={key}
              name={key}
              value={fieldValue}
              depth={depth + 1}
              socialLinks={socialLinks}
              onChange={(nextValue) => onChange({ ...record, [key]: nextValue })}
            />
          ))}
        </div>
      </fieldset>
    );
  }

  if (typeof value === "boolean") {
    return (
      <label className="visual-editor__toggle">
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
        <span>{labelOf(name)}</span>
      </label>
    );
  }

  const isImage = ["logo", "portrait", "cover", "image"].includes(name);
  if (isImage) {
    return (
      <div className="visual-editor__field">
        <span>{labelOf(name)}</span>
        <ImageControl label={labelOf(name)} value={typeof value === "string" ? value : ""} onChange={onChange} />
      </div>
    );
  }

  const stringValue = value === null || value === undefined ? "" : String(value);
  const longText = ["bio", "summary", "description", "text", "note", "tagline"].includes(name);
  const numeric = typeof value === "number" || (value === null && ["year", "progress"].includes(name));
  const isHref = name === "href";
  const isSocialLabel = socialLinks && name === "label";
  return (
    <label className="visual-editor__field">
      <span>{isSocialLabel ? "Platform name" : isHref && socialLinks ? "Profile URL" : labelOf(name)}</span>
      {longText ? (
        <textarea value={stringValue} rows={4} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input
          type={numeric ? "number" : name.toLowerCase().includes("email") ? "email" : isHref ? "url" : "text"}
          value={stringValue}
          placeholder={isHref && socialLinks ? "https://instagram.com/your-account" : isSocialLabel ? "Instagram, LinkedIn, Facebook…" : undefined}
          readOnly={name === "slug"}
          onChange={(event) => onChange(numeric ? (event.target.value === "" ? null : Number(event.target.value)) : event.target.value)}
        />
      )}
    </label>
  );
}

export function SiteVisualEditor() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<CmsDocument[]>([]);
  const [collection, setCollection] = useState<CmsCollection>("home");
  const [slug, setSlug] = useState("singleton");
  const [draft, setDraft] = useState<Record<string, unknown> | null>(null);
  const [fieldPath, setFieldPath] = useState<string[] | null>(null);
  const [creatingCollection, setCreatingCollection] = useState<"projects" | "services" | "team" | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const [editorPosition, setEditorPosition] = useState<{ left: number; top: number } | null>(null);
  const dragOrigin = useRef<{ pointerId: number; x: number; y: number; left: number; top: number } | null>(null);
  const isMemberProfile = /^\/team\/[^/]+\/?$/.test(pathname);

  const currentCollectionDocs = useMemo(
    () => documents.filter((document) => document.collection === collection),
    [documents, collection]
  );
  const selected = currentCollectionDocs.find((document) => document.slug === slug) ?? currentCollectionDocs[0];
  const content = draft ?? selected?.content ?? null;

  useEffect(() => {
    let active = true;
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (active && !error) setIsAdmin(data?.role === "admin");
    }
    void checkAdmin();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isMemberProfile && enabled) {
      setEnabled(false);
      setDraft(null);
      setFieldPath(null);
      setCreatingCollection(null);
      setMessage("");
    }
  }, [enabled, isMemberProfile]);

  useEffect(() => {
    if (!enabled) return;
    document.body.dataset.siteEditMode = "true";
    function onPageClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const completeProject = target.closest<HTMLElement>("[data-edit-complete-project]");
      if (completeProject) {
        event.preventDefault();
        event.stopPropagation();
        if (draft && !window.confirm("Unsaved changes discard karein?")) return;
        const slug = completeProject.dataset.editCompleteProject;
        if (!slug) return;
        const markComplete = (items: CmsDocument[]) => {
          const project = items.find((item) => item.collection === "projects" && item.slug === slug);
          if (!project) {
            setMessage("Project nahi mila. Page refresh karke dobara try karein.");
            return;
          }
          const completed = { ...project.content, inProgress: false, featured: true };
          setLoading(true);
          startTransition(async () => {
            const result = await saveContentDocument("projects", slug, JSON.stringify(completed));
            setLoading(false);
            if (!result.ok) {
              setMessage(result.error);
              return;
            }
            setDocuments((current) => current.map((item) =>
              item.collection === "projects" && item.slug === slug
                ? { ...item, content: completed }
                : item
            ));
            setDraft(null);
            setFieldPath(null);
            setCollection("projects");
            setSlug(slug);
            setMessage("Project complete — it has moved to Work that moves.");
            router.refresh();
          });
        };
        if (documents.length) {
          markComplete(documents);
        } else {
          setLoading(true);
          void getInlineEditorContent().then((result) => {
            if (!result.ok) {
              setLoading(false);
              setMessage(result.error);
              return;
            }
            setDocuments(result.documents);
            markComplete(result.documents);
          }).catch((error: unknown) => {
            setLoading(false);
            setMessage(error instanceof Error ? error.message : "Project load nahi ho paya.");
          });
        }
        return;
      }
      const addButton = target.closest<HTMLElement>("[data-edit-add-project], [data-edit-add-service], [data-edit-add-person]");
      if (addButton) {
        event.preventDefault();
        event.stopPropagation();
        if (draft && !window.confirm("Unsaved changes discard karein?")) return;
        const newCollection = addButton.hasAttribute("data-edit-add-service")
          ? "services"
          : addButton.hasAttribute("data-edit-add-person") ? "team" : "projects";
        const startCreating = (items: CmsDocument[]) => {
          setDocuments(items);
          setCollection(newCollection);
          setSlug(newCollection === "services" ? "new-service" : newCollection === "team" ? "new-person" : "new-project");
          const nextOrder = items
            .filter((item) => item.collection === newCollection)
            .reduce((highest, item) => Math.max(highest, Number(item.content.order) || 0), 0) + 1;
          setDraft(
            newCollection === "services"
              ? newService(nextOrder)
              : newCollection === "team"
                ? newPerson(nextOrder)
                : newProject(nextOrder, addButton?.dataset.editAddProject === "current")
          );
          setFieldPath(null);
          setCreatingCollection(newCollection);
          setMessage(newCollection === "services"
            ? "Service ka title aur description likhkar save karein."
            : newCollection === "team"
              ? "Naam, role, bio aur photo add karke save karein."
            : addButton?.dataset.editAddProject === "current"
              ? "Current project ka title, photo aur summary add karein."
              : "Completed project ka title, photo aur summary add karein.");
        };
        if (documents.length) {
          startCreating(documents);
        } else {
          setLoading(true);
          void getInlineEditorContent().then((result) => {
            setLoading(false);
            if (!result.ok) {
              setMessage(result.error);
              return;
            }
            startCreating(result.documents);
          }).catch((error: unknown) => {
            setLoading(false);
            setMessage(error instanceof Error ? error.message : "Content load nahi ho paya.");
          });
        }
        return;
      }
      if (target.closest("[data-visual-editor], .visual-editor, [data-member-editor]")) return;
      const main = target.closest("main");
      const siteChrome = target.closest(".nav, footer.footer");
      if (!main && !siteChrome) return;
      event.preventDefault();
      event.stopPropagation();
      if (draft && !window.confirm("Unsaved changes discard karein?")) return;
      setMessage("");
      const explicitTarget = target.closest<HTMLElement>("[data-edit-collection][data-edit-slug][data-edit-field]");
      const imageTarget = target.closest("img");
      const visibleTexts: string[] = [];
      let textTarget: Element | null = target;
      while (textTarget && textTarget !== main && textTarget !== siteChrome) {
        const text = normalizeText(textTarget.textContent ?? "");
        if (text && text.length < 240 && !visibleTexts.includes(text)) visibleTexts.push(text);
        textTarget = textTarget.parentElement;
      }
      const imageSource = imageTarget?.getAttribute("src") ?? "";
      const selectTarget = (items: CmsDocument[]) => {
        if (explicitTarget) {
          const targetCollection = explicitTarget.dataset.editCollection as CmsCollection;
          const targetSlug = explicitTarget.dataset.editSlug;
          const targetField = explicitTarget.dataset.editField;
          const document = items.find((item) =>
            item.collection === targetCollection && item.slug === targetSlug
          );
          if (document && targetField) {
            setCollection(document.collection);
            setSlug(document.slug);
            setDraft(null);
            setFieldPath(targetField.split("."));
            setMessage("");
            return true;
          }
        }
        const preferred = routeCollection(pathname, Boolean(siteChrome));
        const ordered = [...items].sort((a, b) =>
          Number(b.collection === preferred) - Number(a.collection === preferred)
        );
        for (const document of ordered) {
          if (imageSource) {
            const path = findMediaPath(document.content, imageSource);
            if (path?.length) {
              setCollection(document.collection);
              setSlug(document.slug);
              setDraft(null);
              setFieldPath(path);
              setMessage("");
              return true;
            }
          } else {
            for (const visibleText of visibleTexts) {
              const path = findFieldPath(document.content, visibleText);
              if (!path?.length) continue;
              setCollection(document.collection);
              setSlug(document.slug);
              setDraft(null);
              setFieldPath(path);
              setMessage("");
              return true;
            }
          }
        }
        setFieldPath(null);
        setMessage("Is text/photo ko content mein dhoondh nahi paya. Neeche se section chunein.");
        selectRouteDefault(items, siteChrome ? "/__site" : pathname, setCollection, setSlug, setDraft);
        return false;
      };
      if (!documents.length) {
        setLoading(true);
        void getInlineEditorContent().then((result) => {
          setLoading(false);
          if (!result.ok) {
            setMessage(result.error);
            return;
          }
          setDocuments(result.documents);
          selectTarget(result.documents);
        }).catch((error: unknown) => {
          setLoading(false);
          setMessage(error instanceof Error ? error.message : "Content load nahi ho paya.");
        });
      } else {
        selectTarget(documents);
      }
    }
    document.addEventListener("click", onPageClick, true);
    return () => {
      document.removeEventListener("click", onPageClick, true);
      delete document.body.dataset.siteEditMode;
    };
  }, [enabled, documents, draft, pathname]);

  function closePanel() {
    setEnabled(false);
    setDraft(null);
    setFieldPath(null);
    setCreatingCollection(null);
    setMessage("");
  }

  function save() {
    if ((!selected && !creatingCollection) || !content) return;
    if (collection === "site" && Array.isArray(content.social)) {
      const invalidSocial = content.social.find((item) =>
        item === null ||
        typeof item !== "object" ||
        !("label" in item) ||
        !String(item.label).trim() ||
        !("href" in item) ||
        (String(item.href).trim() !== "" && !/^https?:\/\/\S+$/i.test(String(item.href).trim()))
      );
      if (invalidSocial) {
        setMessage("Social link ke liye https:// wala poora URL daalein, ya URL khali chhodein aur baad mein add karein.");
        return;
      }
    }
    const savedSlug = creatingCollection
      ? makeSlug(String(creatingCollection === "team" ? content.name ?? "" : content.title ?? ""))
      : selected?.slug;
    if (!savedSlug) {
      setMessage(creatingCollection === "services"
        ? "Service ka title pehle likhein."
        : creatingCollection === "team" ? "Person ka naam pehle likhein." : "Project ka title pehle likhein.");
      return;
    }
    if (
      creatingCollection &&
      documents.some((document) => document.collection === creatingCollection && document.slug === savedSlug)
    ) {
      setMessage(`Is naam ka ${creatingCollection === "services" ? "service" : creatingCollection === "team" ? "person" : "project"} pehle se hai.`);
      return;
    }
    const wasInProgress = !creatingCollection && selected?.content.inProgress === true;
    const savedContent = {
      ...content,
      slug: savedSlug,
      ...(collection === "projects" && wasInProgress && content.inProgress !== true
        ? { featured: true }
        : {}),
      ...(creatingCollection === "team" ? { pieceId: `piece-${savedSlug}` } : {}),
    };
    setMessage("");
    startTransition(async () => {
      const targetCollection = creatingCollection ?? collection;
      const result = await saveContentDocument(targetCollection, savedSlug, JSON.stringify(savedContent));
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      if (creatingCollection) {
        setDocuments((current) => [...current, {
          collection: targetCollection,
          slug: savedSlug,
          content: savedContent,
        }]);
      } else {
        setDocuments((current) =>
          current.map((document) =>
            document.collection === collection && document.slug === selected?.slug
              ? { ...document, content: savedContent }
              : document
          )
        );
      }
      setDraft(null);
      setCreatingCollection(null);
      setFieldPath(null);
      setMessage(creatingCollection
        ? `${creatingCollection === "services" ? "Service" : creatingCollection === "team" ? "Person" : "Project"} add ho gaya.`
        : "Saved. Website updated.");
      router.refresh();
    });
  }

  if (!isAdmin || isMemberProfile) return null;

  const visibleCollections = collections.filter((item) =>
    pathname === "/__site" ? item.id === "site" :
    item.id === "site" ||
    (pathname === "/" ? true :
      pathname.startsWith("/team") ? item.id === "team" :
        pathname.startsWith("/services") ? item.id === "services" :
          pathname.startsWith("/work") ? item.id === "projects" :
            item.id === "home")
  );
  const editorPositionStyle: CSSProperties = editorPosition
    ? { left: editorPosition.left, top: editorPosition.top, right: "auto" }
    : {};

  function startDragging(event: ReactPointerEvent<HTMLElement>) {
    if ((event.target as HTMLElement).closest("button")) return;
    const rect = event.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
    };
    setEditorPosition({ left: rect.left, top: rect.top });
  }

  function moveEditor(event: ReactPointerEvent<HTMLElement>) {
    const origin = dragOrigin.current;
    if (!origin || origin.pointerId !== event.pointerId) return;
    const editor = event.currentTarget.parentElement;
    if (!editor) return;
    const maxLeft = Math.max(0, window.innerWidth - editor.offsetWidth);
    const maxTop = Math.max(0, window.innerHeight - editor.offsetHeight);
    setEditorPosition({
      left: Math.min(maxLeft, Math.max(0, origin.left + event.clientX - origin.x)),
      top: Math.min(maxTop, Math.max(0, origin.top + event.clientY - origin.y)),
    });
  }

  function stopDragging(event: ReactPointerEvent<HTMLElement>) {
    if (dragOrigin.current?.pointerId === event.pointerId) dragOrigin.current = null;
  }

  return (
    <>
      <button
        type="button"
        className={`visual-editor__toggle-button${enabled ? " is-active" : ""}`}
        data-visual-editor
        onClick={() => {
          if (enabled && draft && !window.confirm("Unsaved changes discard karein?")) return;
          setEnabled((current) => !current);
          setDraft(null);
          setMessage("");
        }}
      >
        {enabled ? "✕  Edit mode band karein" : "✎  Website edit karein"}
      </button>
      {enabled && (
        <div className="visual-editor__prompt" data-visual-editor>
          <span>Jis page ko edit karna hai, us par click karein</span>
          <button type="button" aria-label="Close edit mode" onClick={closePanel}>✕</button>
        </div>
      )}
      {(loading || message || content) && enabled && (
        <div className="visual-editor" style={editorPositionStyle} data-visual-editor role="dialog" aria-modal="false" aria-label="Website content editor">
          <header
            className="visual-editor__header"
            onPointerDown={startDragging}
            onPointerMove={moveEditor}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <div>
              <span className="visual-editor__drag-hint" aria-hidden="true">⠿ Drag to move</span>
              <p>WEBSITE EDITOR</p>
              <h2>{creatingCollection ? `Add ${creatingCollection === "services" ? "a service" : creatingCollection === "team" ? "a person" : "a project"}` : selected ? titleOf(selected) : "Edit this page"}</h2>
            </div>
            <button type="button" aria-label="Close editor" onClick={closePanel}>✕</button>
          </header>
          {loading ? (
            <p className="visual-editor__status">Page content load ho raha hai…</p>
          ) : message && !content ? (
            <p className="visual-editor__error" role="alert">{message}</p>
          ) : (
            <>
              {creatingCollection ? (
                <p className="visual-editor__selected-label">
                  {creatingCollection === "services" ? "NAYI SERVICE" : creatingCollection === "team" ? "NAYA PERSON" : "NAYA PROJECT"}
                  <strong>
                    {creatingCollection === "services"
                      ? "Title, description aur includes add karein"
                      : creatingCollection === "team"
                        ? "Naam, role, photo aur bio add karein"
                        : "Title, photo aur summary add karein"}
                  </strong>
                </p>
              ) : fieldPath ? (
                <button
                  type="button"
                  className="visual-editor__back-to-select"
                  onClick={() => {
                    if (draft && !window.confirm("Unsaved changes discard karein?")) return;
                    setDraft(null);
                    setFieldPath(null);
                    setMessage("");
                  }}
                >
                  ← Page par doosri cheez chunein
                </button>
              ) : (
                <nav className="visual-editor__collections" aria-label="Content to edit">
                  {visibleCollections.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={collection === item.id ? "is-active" : ""}
                      onClick={() => {
                        if (draft && !window.confirm("Unsaved changes discard karein?")) return;
                        setCollection(item.id);
                        setSlug("");
                        setDraft(null);
                        setMessage("");
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
              )}
              {!creatingCollection && !fieldPath && currentCollectionDocs.length > 1 && (
                <label className="visual-editor__field visual-editor__record-select">
                  <span>Choose item</span>
                  <select
                    value={selected?.slug ?? ""}
                    onChange={(event) => {
                      if (draft && !window.confirm("Unsaved changes discard karein?")) {
                        event.currentTarget.value = selected?.slug ?? "";
                        return;
                      }
                      setSlug(event.target.value);
                      setDraft(null);
                    }}
                  >
                    {currentCollectionDocs.map((document) => (
                      <option key={document.slug} value={document.slug}>{titleOf(document)}</option>
                    ))}
                  </select>
                </label>
              )}
              {content ? (
                <div className="visual-editor__body">
                  {creatingCollection ? (
                    <EditableFields value={content} onChange={(next) => setDraft(next as Record<string, unknown>)} />
                  ) : fieldPath ? (
                    <>
                      <p className="visual-editor__selected-label">
                        AAP EDIT KAR RAHE HAIN
                        <strong>{fieldPath.map((part) => /^\d+$/.test(part) ? `#${Number(part) + 1}` : labelOf(part)).join("  ›  ")}</strong>
                      </p>
                      <EditableFields
                        name={fieldPath.at(-1) ?? ""}
                        value={readPath(content, fieldPath)}
                        onChange={(next) => setDraft(writePath(content, fieldPath, next))}
                      />
                    </>
                  ) : (
                    <p className="visual-editor__status">
                      Page par jis text ya photo ko badalna hai, us par click karein.
                    </p>
                  )}
                </div>
              ) : (
                <p className="visual-editor__status">Is page ke liye content item nahi mila.</p>
              )}
              {message && <p className="visual-editor__success" role="status">{message}</p>}
              <footer className="visual-editor__footer">
                <button type="button" onClick={closePanel}>Cancel</button>
                <button type="button" className="visual-editor__save" disabled={pending || !content} onClick={save}>
                  {pending ? "Saving…" : "Save changes"}
                </button>
              </footer>
            </>
          )}
        </div>
      )}
    </>
  );
}

function selectRouteDefault(
  documents: CmsDocument[],
  pathname: string,
  setCollection: (collection: CmsCollection) => void,
  setSlug: (slug: string) => void,
  setDraft: (draft: Record<string, unknown> | null) => void
) {
  const collection = routeCollection(pathname);
  const slug = pathname.startsWith("/team/") ? pathname.split("/")[2] ?? "" : "singleton";
  const selected = documents.find((document) => document.collection === collection && document.slug === slug)
    ?? documents.find((document) => document.collection === collection);
  setCollection(collection);
  setSlug(selected?.slug ?? "");
  setDraft(null);
}

function routeCollection(pathname: string, siteChrome = false): CmsCollection {
  if (siteChrome || pathname === "/__site") return "site";
  if (pathname.startsWith("/team")) return "team";
  if (pathname.startsWith("/services")) return "services";
  if (pathname.startsWith("/work")) return "projects";
  if (pathname === "/") return "home";
  return "site";
}

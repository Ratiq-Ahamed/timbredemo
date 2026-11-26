"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Eye,
  Heart,
  Plus,
  RotateCcw,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  LockKeyhole,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDemo } from "@/lib/demo/store";
import { date, downloadEligible, galleryAccess } from "@/lib/demo/selectors";
import {
  Badge,
  Button,
  Empty,
  FilterBar,
  Modal,
  PageHeader,
  Panel,
  Select,
  Tabs,
  downloadText,
} from "@/components/ui";
import { useActionForm } from "@/components/action-forms";
export function Galleries({ id }: { id?: string }) {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [copied, setCopied] = useState(false);
  const [filePreview, setFilePreview] = useState("");
  const [filename, setFilename] = useState("");
  const forms = useActionForm();
  const g = s.galleries.find((g) => g.id === id);
  useEffect(
    () => () => {
      if (filePreview) URL.revokeObjectURL(filePreview);
    },
    [filePreview],
  );
  if (id && !g)
    return (
      <Empty
        title="Gallery not found"
        action={
          <Link className="button" href="/admin/galleries">
            Back to galleries
          </Link>
        }
      />
    );
  if (g) {
    const booking = s.bookings.find((b) => b.id === g.bookingId)!;
    return (
      <>
        <Link
          className="text-link"
          href="/admin/galleries"
          style={{ marginBottom: 18 }}
        >
          <ArrowLeft size={13} />
          All galleries
        </Link>
        <PageHeader
          title={g.name}
          description={`${g.id} · ${booking.name} · ${g.media.length} photographs`}
          actions={
            <>
              <Link
                href={`/client/gallery/${g.id}`}
                className="button secondary"
              >
                <Eye size={15} />
                Customer preview
              </Link>
              {g.status !== "Published" ? (
                <Button
                  onClick={() =>
                    execute("gallery.update", { id: g.id, status: "Published" })
                  }
                >
                  Publish gallery
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() =>
                    execute("gallery.update", { id: g.id, status: "Revoked" })
                  }
                >
                  Revoke access
                </Button>
              )}
            </>
          }
        />
        <div className="detail-grid">
          <div className="stack">
            <Panel
              title="Collection photographs"
              caption="Stable file IDs connect customer selections to studio records."
              action={<Badge>{g.status}</Badge>}
            >
              <div className="panel-body">
                <div className="photo-manager">
                  {g.media.map((m) => (
                    <figure key={m.id}>
                      <img
                        src={m.src.replace(".webp", "-thumb.webp")}
                        alt={`Sample ${m.section} photograph ${m.label}`}
                        loading="lazy"
                      />
                      {g.selected.includes(m.id) && (
                        <span className="selected-label">Selected</span>
                      )}
                      <figcaption>
                        <span>{m.label}</span>
                        <span>
                          {g.favorites.includes(m.id) && <Heart size={12} />}
                        </span>
                      </figcaption>
                      {m.status === "Failed" ? (
                        <Button
                          variant="ghost"
                          onClick={() =>
                            execute("gallery.retry", {
                              id: g.id,
                              mediaId: m.id,
                            })
                          }
                        >
                          Failed · Retry upload
                        </Button>
                      ) : (
                        <button
                          className="text-link"
                          style={{ fontSize: 9, marginTop: 5 }}
                          disabled={m.id === g.coverId}
                          onClick={() =>
                            execute("gallery.update", {
                              id: g.id,
                              coverId: m.id,
                            })
                          }
                        >
                          {m.id === g.coverId
                            ? "Current cover"
                            : "Set as cover"}
                        </button>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
            </Panel>
            <Panel
              title="Customer album selection"
              caption={`${g.selected.length}/${g.target} selected · ${g.favorites.length} favorites`}
              action={
                <Badge>{g.submitted ? "Submitted" : "In progress"}</Badge>
              }
            >
              <div className="panel-body">
                <p className="callout">
                  {g.selected.length
                    ? g.selected
                        .map(
                          (id) =>
                            `${id} (${g.media.find((m) => m.id === id)?.label})`,
                        )
                        .join(", ")
                    : "The customer has not selected any photographs yet."}
                </p>
                <div className="inline-actions" style={{ marginTop: 15 }}>
                  <Button
                    variant="secondary"
                    disabled={!g.submitted}
                    title="Customer must submit first"
                    onClick={() => execute("gallery.reopen", { id: g.id })}
                  >
                    <RotateCcw size={14} />
                    Reopen selection
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={!g.selected.length}
                    onClick={() =>
                      downloadText(
                        `${g.id}-selection.txt`,
                        g.selected
                          .map(
                            (id) =>
                              `${id}\t${g.media.find((m) => m.id === id)?.label}`,
                          )
                          .join("\n"),
                      )
                    }
                  >
                    Export selected IDs
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
          <div className="stack">
            <Panel title="Access & release">
              <div className="panel-body stack">
                <div className="summary-list">
                  <div>
                    <span>Gallery status</span>
                    <Badge>{g.status}</Badge>
                  </div>
                  <div>
                    <span>Published</span>
                    <strong>{date(g.publishedAt || "")}</strong>
                  </div>
                  <div>
                    <span>Access expires</span>
                    <strong>{date(g.expiresAt)}</strong>
                  </div>
                  <div>
                    <span>Payment lock</span>
                    <strong>
                      {g.paymentLock
                        ? "Originals restricted until paid"
                        : "Off"}
                    </strong>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() =>
                    forms.open(
                      "gallery.update",
                      "Gallery access settings",
                      [
                        {
                          name: "expiresAt",
                          label: "Access expiry",
                          type: "date",
                          value: g.expiresAt,
                          required: true,
                        },
                        {
                          name: "paymentLock",
                          label: "Lock sample download until fully paid",
                          type: "checkbox",
                          value: g.paymentLock,
                        },
                        {
                          name: "externalUrl",
                          label: "External Pixieset gallery URL (optional)",
                          value: g.externalUrl,
                        },
                      ],
                      { id: g.id },
                    )
                  }
                >
                  Edit access settings
                </Button>
                <Button
                  variant="secondary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(
                        `${window.location.origin}/client/gallery/${g.id}`,
                      );
                      setCopied(true);
                    } catch {
                      downloadText(
                        `${g.id}-url.txt`,
                        `${window.location.origin}/client/gallery/${g.id}`,
                      );
                    }
                  }}
                >
                  <Copy size={14} />
                  {copied ? "Demo URL copied" : "Copy demo URL"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() =>
                    execute("gallery.update", { id: g.id, status: "Expired" })
                  }
                >
                  Simulate access expiry
                </Button>
                {g.externalUrl && (
                  <a
                    className="text-link"
                    href={g.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open external gallery
                    <ArrowRight size={13} />
                  </a>
                )}
                <small>
                  Expiry restricts access; it does not delete the studio
                  archive. URLs share a demo route, not browser-local edits.
                </small>
              </div>
            </Panel>
            <Panel
              title="Demo upload queue"
              caption="Local previews and synthetic upload state only."
            >
              <div className="panel-body stack">
                <input
                  aria-label="Preview a local demo image"
                  type="file"
                  accept="image/*"
                  disabled={g.status !== "Draft"}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setFilename(f.name);
                      setFilePreview(URL.createObjectURL(f));
                    }
                  }}
                />
                {filePreview && (
                  <>
                    <img
                      src={filePreview}
                      alt="Temporary local upload preview"
                      style={{
                        width: "100%",
                        maxHeight: 170,
                        objectFit: "cover",
                        borderRadius: 5,
                      }}
                    />
                    <small>{filename} · temporary preview only</small>
                  </>
                )}
                <Button
                  variant="secondary"
                  disabled={g.status !== "Draft"}
                  title="Uploads require draft gallery state"
                  onClick={() => execute("gallery.upload", { id: g.id })}
                >
                  <Upload size={14} />
                  Simulate interrupted upload
                </Button>
                <p className="muted small">
                  Retry failed files in the collection. Publishing is blocked
                  until every item is ready.
                </p>
              </div>
            </Panel>
          </div>
        </div>
        {forms.modal}
      </>
    );
  }
  return (
    <>
      <PageHeader
        title="Client galleries"
        description="A beautiful final chapter for every story."
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Search galleries…"
        onClear={() => {
          setSearch("");
          setStatus("All statuses");
        }}
      >
        <Select
          label="Gallery status"
          value={status}
          onChange={setStatus}
          options={["All statuses", "Draft", "Published", "Expired", "Revoked"]}
        />
      </FilterBar>
      <div className="gallery-cards">
        {s.galleries
          .filter(
            (g) =>
              g.name.toLowerCase().includes(search.toLowerCase()) &&
              (status === "All statuses" || g.status === status),
          )
          .map((g) => (
            <article className="gallery-card" key={g.id}>
              <Link href={`/admin/galleries/${g.id}`}>
                <img
                  src={
                    (g.media.find((m) => m.id === g.coverId) || g.media[0]).src
                  }
                  alt={`Sample cover for ${g.name}`}
                  loading="lazy"
                />
              </Link>
              <div className="gallery-card-body">
                <div
                  className="inline-actions"
                  style={{ justifyContent: "space-between" }}
                >
                  <h2>{g.name}</h2>
                  <Badge>{g.status}</Badge>
                </div>
                <p>
                  {g.media.length} photographs · {g.selected.length}/{g.target}{" "}
                  selected · expires {date(g.expiresAt)}
                </p>
                <div className="inline-actions">
                  <small>
                    {g.submitted
                      ? "Album selection submitted"
                      : "Awaiting album selection"}
                  </small>
                  <Link href={`/admin/galleries/${g.id}`} className="text-link">
                    Manage collection
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
      </div>
    </>
  );
}
export function CustomerGallery({ id }: { id: string }) {
  const s = useDemo((x) => x.data);
  const execute = useDemo((x) => x.execute);
  const [section, setSection] = useState("All photographs");
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const g = s.galleries.find((g) => g.id === id);
  const media = useMemo(
    () => g?.media.filter((m) => m.status === "Ready") || [],
    [g],
  );
  const active = media.findIndex((m) => m.id === lightbox);
  const move = (direction: number) => {
    if (media.length)
      setLightbox(media[(active + direction + media.length) % media.length].id);
  };
  useEffect(() => {
    if (!lightbox) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setLightbox(media[(active + 1) % media.length].id);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setLightbox(media[(active - 1 + media.length) % media.length].id);
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [lightbox, active, media]);
  if (!g)
    return (
      <Empty
        title="Gallery not found"
        action={
          <Link className="button" href="/client">
            Your projects
          </Link>
        }
      />
    );
  const reason = galleryAccess(s, g);
  if (reason)
    return (
      <div className="access-state" style={{ minHeight: "70vh" }}>
        <LockKeyhole size={34} />
        <h1>Let’s keep these memories safe.</h1>
        <p className="muted">{reason}</p>
        <Link href="/client" className="button secondary">
          Back to your project
        </Link>
        {s.identity.role === "owner" && (
          <Link href={`/admin/galleries/${g.id}`} className="text-link">
            Manage demo access
            <ArrowRight size={14} />
          </Link>
        )}
      </div>
    );
  const cover = g.media.find((m) => m.id === g.coverId) || g.media[0];
  const photos = media.filter(
    (m) =>
      (section === "All photographs" || m.section === section) &&
      (!showFavorites || g.favorites.includes(m.id)),
  );
  const book = s.bookings.find((b) => b.id === g.bookingId)!;
  const download = () => {
    if (!downloadEligible(s, g)) return;
    downloadText(
      `${g.name.replaceAll(" ", "-")}-sample-manifest.txt`,
      `TIMBREL STUDIO · SAMPLE DOWNLOAD\n\nThis is a filename manifest for the fictional ${g.name} gallery. No full-resolution client collection is transferred.\n\n${media.map((m) => `${m.id}\t${m.label}\t${m.section}`).join("\n")}`,
    );
  };
  return (
    <main className="client-gallery">
      <div className="gallery-hero">
        <img
          src={cover.src}
          alt="Licensed sample wedding photograph"
          fetchPriority="high"
        />
        <div className="gallery-hero-copy">
          <span>A LITTLE FOREVER, BEAUTIFULLY KEPT</span>
          <h1>{g.name}</h1>
          <p>
            {date(
              s.sessions.find((x) => x.bookingId === g.bookingId)?.start ||
                "2026-11-15",
              { year: "numeric" },
            )}{" "}
            · {book.location}
          </p>
        </div>
      </div>
      <div className="gallery-intro">
        <p>
          The moments that made your day.
          <br />
          The memories you’ll keep for a lifetime.
        </p>
        <small>
          ILLUSTRATIVE STOCK PHOTOGRAPHY · FICTIONAL DEMO COLLECTION
        </small>
      </div>
      <div className="gallery-toolbar">
        <Tabs
          items={["All photographs", "Wedding", "Reception", "Portraits"]}
          value={section}
          onChange={setSection}
        />
        <div className="inline-actions">
          <Button
            variant="ghost"
            onClick={() => setShowFavorites(!showFavorites)}
          >
            <Heart size={14} />
            {showFavorites ? "Show all" : "Favorites"} ({g.favorites.length})
          </Button>
          <Button
            variant="secondary"
            disabled={!downloadEligible(s, g)}
            title={
              !downloadEligible(s, g)
                ? "Sample download locked until payment is complete"
                : "Download a sample filename manifest"
            }
            onClick={download}
          >
            <Download size={14} />
            Sample download
          </Button>
        </div>
      </div>
      <div className="photo-grid">
        {photos.map((m) => (
          <article className="photo-card" key={m.id}>
            <Dialog.Root
              open={lightbox === m.id}
              onOpenChange={(o) => setLightbox(o ? m.id : null)}
            >
              <Dialog.Trigger
                className="photo-open"
                aria-label={`Open ${m.label}`}
              >
                <img
                  src={m.src}
                  srcSet={`${m.src.replace(".webp", "-thumb.webp")} 480w, ${m.src} 1400w`}
                  sizes="(max-width: 767px) 46vw, 30vw"
                  alt={`Sample ${m.section.toLowerCase()} photograph ${m.label}`}
                  loading="lazy"
                />
              </Dialog.Trigger>
              {lightbox === m.id && (
                <Dialog.Portal>
                  <Dialog.Overlay className="lightbox-overlay" />
                  <Dialog.Content
                    className="lightbox-content"
                    aria-describedby={undefined}
                  >
                    <Dialog.Title className="sr-only">
                      {m.label} · {m.section}
                    </Dialog.Title>
                    <Dialog.Close
                      className="icon-button lightbox-close"
                      aria-label="Close photograph"
                    >
                      <X size={24} />
                    </Dialog.Close>
                    <button
                      className="lightbox-prev"
                      aria-label="Previous photograph"
                      onClick={() => move(-1)}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <img
                      src={m.src}
                      alt={`${m.label} enlarged sample photograph`}
                    />
                    <button
                      className="lightbox-next"
                      aria-label="Next photograph"
                      onClick={() => move(1)}
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className="lightbox-caption">
                      {m.label} · {active + 1} / {media.length}
                      <div
                        className="inline-actions"
                        style={{ justifyContent: "center", marginTop: 10 }}
                      >
                        <Button
                          variant="secondary"
                          disabled={g.submitted}
                          onClick={() =>
                            execute("gallery.select", {
                              id: g.id,
                              mediaId: m.id,
                            })
                          }
                        >
                          {g.selected.includes(m.id)
                            ? "Selected for album"
                            : "Select for album"}
                        </Button>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Portal>
              )}
            </Dialog.Root>
            <div className="photo-controls">
              <small>{m.label}</small>
              <div>
                <button
                  className={`photo-control ${g.favorites.includes(m.id) ? "favorite" : ""}`}
                  aria-label={`Favorite ${m.label}`}
                  aria-pressed={g.favorites.includes(m.id)}
                  onClick={() =>
                    execute("gallery.favorite", { id: g.id, mediaId: m.id })
                  }
                >
                  <Heart size={13} />
                </button>
                <button
                  className={`photo-control ${g.selected.includes(m.id) ? "selected" : ""}`}
                  aria-label={`Select ${m.label} for album`}
                  aria-pressed={g.selected.includes(m.id)}
                  disabled={g.submitted}
                  onClick={() =>
                    execute("gallery.select", { id: g.id, mediaId: m.id })
                  }
                >
                  {g.selected.includes(m.id) ? (
                    <Check size={14} />
                  ) : (
                    <Plus size={14} />
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!photos.length && (
        <Empty
          title="Your favorites will live here"
          description="Tap the heart beside a photograph to save it."
        />
      )}
      <div className="gallery-footer">
        Photographs for demonstration only · Gallery access expires{" "}
        {date(g.expiresAt)}
        <br />
        Timbrel Studio · Powered by Myurrix
      </div>
      <div className="selection-bar">
        <div className="selection-count">
          <span>
            {g.selected.length}/{g.target}
          </span>
          <div>
            <strong>
              {g.submitted
                ? "Your album selection is with us."
                : "Your story. Your favourite moments."}
            </strong>
            <small>
              {g.submitted
                ? "Contact the studio to request a change."
                : `Choose ${g.target} photographs for your album.`}
            </small>
          </div>
        </div>
        <Button
          disabled={g.submitted || g.selected.length !== g.target}
          onClick={() => setConfirm(true)}
        >
          {g.submitted ? (
            <>
              <Check size={14} />
              Submitted
            </>
          ) : (
            <>
              Submit selection
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="These are your forever favourites?"
        description={`Submit your ${g.target} selected photographs to the studio for album design.`}
      >
        <div className="stack">
          <p className="callout">
            {g.selected
              .map((id) => g.media.find((m) => m.id === id)?.label)
              .join(" · ")}
          </p>
          <p className="muted small">
            Your selection will become read-only. The studio can reopen it if
            you need changes.
          </p>
          <Button
            onClick={() => {
              const r = execute("gallery.submit", { id: g.id });
              if (r.ok) setConfirm(false);
            }}
          >
            Confirm album selection
            <Check size={15} />
          </Button>
        </div>
      </Modal>
    </main>
  );
}

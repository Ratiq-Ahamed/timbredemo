"use client";
import {
  useEffect,
  useState,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type FormEvent,
} from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronDown,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  SlidersHorizontal,
} from "lucide-react";
import { useDemo } from "@/lib/demo/store";
import type { Input } from "@/lib/demo/types";
export function Badge({
  children,
  tone,
}: {
  children: ReactNode;
  tone?: string;
}) {
  const label = String(children);
  const kind =
    tone ||
    (/Overdue|Damaged|Lost|Cancelled|Declined|Failed|Revoked/.test(label)
      ? "danger"
      : /Completed|Confirmed|Accepted|Approved|Published|Delivered|Good|Available|Paid|Ready/.test(
            label,
          )
        ? "success"
        : /Hold|Proposed|Pending|Review|Reserved|inspection|progress|Issued|Expired|Blocked|Maintenance/.test(
              label,
            )
          ? "warning"
          : "neutral");
  return (
    <span className={`badge ${kind}`}>
      <span className="status-dot" />
      {children}
    </span>
  );
}
export function Button({
  children,
  onClick,
  variant = "",
  type = "button",
  disabled = false,
  className = "",
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <button
      title={title}
      className={`button ${variant} ${className}`}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
export function IconButton({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className="icon-button"
      aria-label={label}
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Empty({
  title = "Nothing here yet",
  description = "Try another filter or add a record.",
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <SlidersHorizontal size={24} />
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="header-actions">{actions}</div>
    </header>
  );
}
export function Tabs({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="tabs" role="tablist">
      {items.map((i) => (
        <button
          key={i}
          role="tab"
          aria-selected={value === i}
          className={value === i ? "active" : ""}
          onClick={() => onChange(i)}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
export function Panel({
  title,
  caption,
  children,
  action,
  className = "",
}: {
  title?: string;
  caption?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <div className="panel-header">
          <div>
            <h2>{title}</h2>
            {caption && <p>{caption}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
export function Table({
  headers,
  rows,
  label = "Records",
}: {
  headers: string[];
  rows: ReactNode[][];
  label?: string;
}) {
  if (!rows.length)
    return (
      <Empty
        title="No matching records"
        description="Clear your filters to see more results."
      />
    );
  return (
    <div className="table-scroll">
      <table aria-label={label}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function RecordLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <Link href={href} className="record-link">
      <strong>{title}</strong>
      {subtitle && <small>{subtitle}</small>}
    </Link>
  );
}
export function Avatar({
  name,
  small = false,
}: {
  name: string;
  small?: boolean;
}) {
  return (
    <span className={`avatar ${small ? "small" : ""}`}>
      {name
        .split(/[ &]+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")}
    </span>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  const id = useId();
  const control = isValidElement<{ id?: string; "aria-label"?: string }>(
    children,
  )
    ? cloneElement(children, {
        id: children.props.id || id,
        "aria-label": children.props["aria-label"] || label,
      })
    : children;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      {control}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function FilterBar({
  search,
  onSearch,
  placeholder = "Search records…",
  children,
  onClear,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  children?: ReactNode;
  onClear?: () => void;
}) {
  return (
    <div className="filter-bar">
      <label className="search-field">
        <Search size={16} />
        <input
          aria-label={placeholder}
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
        />
        {search && (
          <button aria-label="Clear search" onClick={() => onSearch("")}>
            <X size={14} />
          </button>
        )}
      </label>
      {children}
      {onClear && (
        <Button variant="ghost" onClick={onClear}>
          Clear all
        </Button>
      )}
    </div>
  );
}
export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
}) {
  return (
    <label className="select-wrap">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o}>{o}</option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={`dialog-content ${wide ? "wide" : ""}`}
          aria-describedby={description ? "modal-description" : undefined}
        >
          <div className="dialog-heading">
            <div>
              <Dialog.Title>{title}</Dialog.Title>
              {description && (
                <Dialog.Description id="modal-description">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <X size={20} />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export interface FormField {
  name: string;
  label: string;
  type?:
    | "text"
    | "number"
    | "date"
    | "datetime-local"
    | "textarea"
    | "select"
    | "checkbox"
    | "email";
  value?: string | number | boolean;
  options?: (string | { value: string; label: string })[];
  required?: boolean;
  min?: number;
  hint?: string;
  step?: number;
}
export function FormModal({
  title,
  description,
  fields,
  onSubmit,
  onClose,
  submitLabel = "Save changes",
}: {
  title: string;
  description?: string;
  fields: FormField[];
  onSubmit: (values: Input) => boolean | void;
  onClose: () => void;
  submitLabel?: string;
}) {
  const [error, setError] = useState("");
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Input = {};
    for (const f of fields)
      data[f.name] =
        f.type === "checkbox"
          ? fd.has(f.name)
          : f.type === "number"
            ? Number(fd.get(f.name))
            : String(fd.get(f.name) || "");
    const result = onSubmit(data);
    if (result !== false) onClose();
    else setError(useDemo.getState().error || "Please check the form values.");
  };
  return (
    <Modal open onClose={onClose} title={title} description={description}>
      <form onSubmit={submit} className="form-stack">
        {fields.map((f) => (
          <Field key={f.name} label={f.label} hint={f.hint}>
            {f.type === "select" ? (
              <select
                name={f.name}
                defaultValue={String(f.value ?? "")}
                required={f.required}
              >
                {f.options?.map((o) =>
                  typeof o === "string" ? (
                    <option key={o}>{o}</option>
                  ) : (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ),
                )}
              </select>
            ) : f.type === "textarea" ? (
              <textarea
                name={f.name}
                defaultValue={String(f.value ?? "")}
                required={f.required}
                rows={3}
              />
            ) : f.type === "checkbox" ? (
              <input
                type="checkbox"
                name={f.name}
                defaultChecked={Boolean(f.value)}
              />
            ) : (
              <input
                type={f.type || "text"}
                name={f.name}
                defaultValue={String(f.value ?? "")}
                required={f.required}
                min={f.min}
                step={f.step}
              />
            )}
          </Field>
        ))}
        {error && (
          <p className="inline-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </p>
        )}
        <div className="dialog-footer">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {submitLabel}
            <Check size={16} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export function Metric({
  label,
  value,
  detail,
  href,
  icon,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  href?: string;
  icon?: ReactNode;
}) {
  const body = (
    <>
      <div className="metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-detail">{detail}</div>
      {href && <ArrowRight className="metric-arrow" size={15} />}
    </>
  );
  return href ? (
    <Link href={href} className="metric">
      {body}
    </Link>
  ) : (
    <div className="metric">{body}</div>
  );
}
export function MoneyInput(p: {
  name: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      name={p.name}
      aria-label={p.name}
      type="number"
      min="0"
      step="1"
      value={p.value / 100}
      onChange={(e) => p.onChange(Math.round(Number(e.target.value) * 100))}
    />
  );
}
export function downloadText(
  filename: string,
  content: string,
  type = "text/plain",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function exportCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][],
) {
  const safe = (v: string | number) => {
    let str = String(v);
    if (/^[=+@\-\t\r]/.test(str)) str = `'${str}`;
    return `"${str.replaceAll('"', '""')}"`;
  };
  downloadText(
    filename,
    [headers, ...rows].map((r) => r.map(safe).join(",")).join("\r\n"),
    "text/csv;charset=utf-8",
  );
}
export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="secondary" onClick={onClick}>
      <ArrowDownToLine size={15} />
      Export CSV
    </Button>
  );
}
export function Providers({ children }: { children: ReactNode }) {
  const hydrated = useDemo((s) => s.hydrated);
  const notice = useDemo((s) => s.notice);
  const error = useDemo((s) => s.error);
  const storageError = useDemo((s) => s.storageError);
  useEffect(() => {
    void useDemo.persist.rehydrate();
  }, []);
  useEffect(() => {
    if (!notice && !error) return;
    const t = setTimeout(() => useDemo.getState().clear(), 6000);
    return () => clearTimeout(t);
  }, [notice, error]);
  if (!hydrated)
    return (
      <div className="loading-screen">
        <div className="loader" />
        <span>Opening your studio…</span>
      </div>
    );
  return (
    <>
      {storageError && (
        <div className="storage-warning" role="alert">
          {storageError}
        </div>
      )}
      {children}
      {(notice || error) && (
        <div
          className={`toast ${error ? "error" : ""}`}
          role={error ? "alert" : "status"}
        >
          {error ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{error || notice}</span>
          <IconButton
            label="Dismiss notification"
            onClick={() => useDemo.getState().clear()}
          >
            <X size={16} />
          </IconButton>
        </div>
      )}
    </>
  );
}

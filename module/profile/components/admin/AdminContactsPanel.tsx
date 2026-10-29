// module/profile/components/admin/AdminContactsPanel.tsx
"use client";

// Admin → Contact Messages: the enquiries sent from the contact page.
//
//   • Filter tabs (Inbox / New / Replied / Archived / All) and a search box
//   • Each message is a row; click it to drop down the full details
//     (opening a NEW message marks it READ):
//     call / WhatsApp / email buttons, event · date · guests, the message,
//     a private note, status buttons, delete
//
// Data: app/actions/contact.ts

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Copy,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import {
  deleteContactMessage,
  getContactMessages,
  saveContactNote,
  setContactStatus,
  type ContactMessageRow,
} from "@/app/actions/contact";

type Status = ContactMessageRow["status"];
type Filter = "inbox" | Status | "ALL";

const STATUS_STYLE: Record<Status, { label: string; className: string }> = {
  NEW: { label: "New", className: "bg-[#c49a3c] text-white" },
  READ: { label: "Read", className: "bg-slate-100 text-slate-600" },
  REPLIED: { label: "Replied", className: "bg-emerald-50 text-emerald-700" },
  ARCHIVED: { label: "Archived", className: "bg-slate-100 text-slate-400" },
};

const FILTERS: { value: Filter; label: string }[] = [
  { value: "inbox", label: "Inbox" }, // everything except archived
  { value: "NEW", label: "New" },
  { value: "REPLIED", label: "Replied" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "ALL", label: "All" },
];

/** Does this message belong under the chosen filter tab? */
const inFilter = (m: ContactMessageRow, filter: Filter) =>
  filter === "ALL"
    ? true
    : filter === "inbox"
      ? m.status !== "ARCHIVED"
      : m.status === filter;

const received = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dhaka",
  });

/** "Nusrat Jahan" → "NJ" */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** "01712345678" / "+880 1712…" → "8801712345678" for wa.me links. */
const whatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `88${digits}` : digits;
};

export function AdminContactsPanel() {
  const [messages, setMessages] = useState<ContactMessageRow[] | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("inbox");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const result = await getContactMessages();
    setMessages(result.messages);
    setError(result.error ?? "");
  }

  useEffect(() => {
    getContactMessages().then((result) => {
      setMessages(result.messages);
      setError(result.error ?? "");
    });
  }, []);

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  /** Change one message in the list without reloading everything. */
  function patch(id: string, changes: Partial<ContactMessageRow>) {
    setMessages(
      (prev) =>
        prev?.map((m) => (m.id === id ? { ...m, ...changes } : m)) ?? null,
    );
  }

  async function changeStatus(id: string, status: Status) {
    patch(id, { status }); // show it straight away
    const result = await setContactStatus(id, status);
    if (!result.success) {
      setError(result.error ?? "Failed to update");
      await load();
    }
  }

  async function remove(message: ContactMessageRow) {
    if (
      !confirm(`Delete the enquiry from ${message.name}? This can't be undone.`)
    )
      return;
    const result = await deleteContactMessage(message.id);
    if (!result.success) return setError(result.error ?? "Failed to delete");
    setMessages((prev) => prev?.filter((m) => m.id !== message.id) ?? null);
    setOpenId(null);
  }

  /** Open / close a message. Opening a new one marks it read. */
  function toggle(message: ContactMessageRow) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && message.status === "NEW")
      void changeStatus(message.id, "READ");
  }

  // ─── Loading ───
  if (messages === null) {
    return (
      <div className="space-y-3">
        <div className="h-16 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
        <div className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
        <div className="h-24 animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/70" />
      </div>
    );
  }

  const newCount = messages.filter((m) => m.status === "NEW").length;
  const term = search.trim().toLowerCase();
  const shown = messages.filter(
    (m) =>
      inFilter(m, filter) &&
      (!term ||
        [m.name, m.phone, m.email ?? "", m.eventType, m.message]
          .join(" ")
          .toLowerCase()
          .includes(term)),
  );

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
            Enquiries
          </p>
          <p className="mt-1 text-2xl font-semibold text-[#14245a]">
            Contact messages
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Sent from the contact page.{" "}
            {newCount > 0 ? (
              <span className="font-semibold text-[#a8852f]">
                {newCount} new
              </span>
            ) : (
              "Nothing new."
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-[#14245a] hover:border-[#c49a3c] disabled:opacity-60"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}

      {/* ─── Filters + search ─── */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const count = messages.filter((m) => inFilter(m, f.value)).length;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                filter === f.value
                  ? "bg-[#14245a] text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
              }`}
            >
              {f.label}{" "}
              <span
                className={
                  filter === f.value ? "text-[#dcb45c]" : "text-slate-400"
                }
              >
                {count}
              </span>
            </button>
          );
        })}
        <label className="relative ml-auto w-full sm:w-64">
          <Search
            size={14}
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, message…"
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pr-3 pl-8 text-sm outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
          />
        </label>
      </div>

      {/* ─── Messages ─── */}
      {messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] p-12 text-center">
          <Inbox className="mx-auto mb-4 h-10 w-10 text-[#c49a3c]" />
          <p className="text-lg font-semibold text-[#14245a]">
            No messages yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Enquiries from the contact page will appear here.
          </p>
        </div>
      ) : shown.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200/70">
          No messages here.
        </p>
      ) : (
        <div className="space-y-2">
          {shown.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              open={openId === message.id}
              onToggle={() => toggle(message)}
              onStatus={(status) => changeStatus(message.id, status)}
              onNoteSaved={(note) =>
                patch(message.id, { adminNote: note || null })
              }
              onDelete={() => remove(message)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  One message
// ════════════════════════════════════════════════════════════════════════

const STATUS_ORDER: Status[] = ["NEW", "READ", "REPLIED", "ARCHIVED"];

function MessageCard({
  message,
  open,
  onToggle,
  onStatus,
  onNoteSaved,
  onDelete,
}: {
  message: ContactMessageRow;
  open: boolean;
  onToggle: () => void;
  onStatus: (status: Status) => void;
  onNoteSaved: (note: string) => void;
  onDelete: () => void;
}) {
  const badge = STATUS_STYLE[message.status];
  const isNew = message.status === "NEW";

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white ring-1 transition-shadow duration-300 ${
        open
          ? "shadow-xl shadow-[#14245a]/8 ring-[#c49a3c]/50"
          : "ring-slate-200/70 hover:shadow-md hover:shadow-[#14245a]/5 hover:ring-slate-300"
      }`}
    >
      {/* ─── Header: click to open / close ───
          Closed: small initials, name, event type, one-line preview, date.
          Open:   big initials, name, status, when it was received + delete. */}
      <div className="flex items-center gap-1 pr-2 sm:pr-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-2xl p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#c49a3c] sm:gap-4 sm:p-5"
        >
          <span className="relative shrink-0">
            <span
              className={`flex items-center justify-center rounded-full font-semibold transition-all duration-300 ${
                open ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs"
              } ${isNew || open ? "bg-[#14245a] text-[#dcb45c]" : "bg-slate-100 text-slate-500"}`}
            >
              {initials(message.name)}
            </span>
            {isNew && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#c49a3c] ring-2 ring-white" />
            )}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[#14245a] transition-all ${
                  open
                    ? "text-xl font-semibold"
                    : `text-sm ${isNew ? "font-bold" : "font-semibold"}`
                }`}
              >
                {message.name}
              </span>
              {open ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase ${badge.className}`}
                >
                  {badge.label}
                </span>
              ) : (
                <span className="rounded-full bg-[#c49a3c]/10 px-2 py-0.5 text-[11px] font-medium text-[#8a6d26]">
                  {message.eventType}
                </span>
              )}
            </span>
            <span
              className={`mt-0.5 block truncate ${
                open
                  ? "text-xs text-slate-400"
                  : `text-sm ${isNew ? "text-slate-600" : "text-slate-400"}`
              }`}
            >
              {open
                ? `Received ${received(message.createdAt)}`
                : message.message}
            </span>
          </span>

          {!open && (
            <span className="hidden shrink-0 text-xs text-slate-400 sm:inline">
              {received(message.createdAt)}
            </span>
          )}
        </button>

        {open && (
          <button
            type="button"
            onClick={onDelete}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
            title="Delete message"
          >
            <Trash2 size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={open ? "Close message" : "Open message"}
          className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
        >
          <ChevronDown
            size={17}
            className={`transition-transform duration-300 ${open ? "rotate-180 text-[#c49a3c]" : ""}`}
          />
        </button>
      </div>

      {/* ─── Details: slides open (grid rows 0 → 1). `inert` keeps the
          hidden buttons out of the keyboard tab order while closed. ─── */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden" inert={!open}>
          {/* Get back to them */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 pb-5 sm:px-5">
            <ContactButton
              href={`tel:${message.phone}`}
              icon={<Phone size={14} />}
              primary
            >
              Call {message.phone}
            </ContactButton>
            <CopyButton text={message.phone} />
            <ContactButton
              href={`https://wa.me/${whatsappNumber(message.phone)}`}
              icon={<MessageCircle size={14} />}
              newTab
            >
              WhatsApp
            </ContactButton>
            {message.email && (
              <ContactButton
                href={`mailto:${message.email}?subject=${encodeURIComponent(
                  `Your ${message.eventType} enquiry — Venus Corporation`,
                )}`}
                icon={<Mail size={14} />}
              >
                {message.email}
              </ContactButton>
            )}
          </div>

          <div className="space-y-5 bg-[#fdfcf9] p-4 sm:p-5">
            {/* Event · Date · Guests */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <Fact
                icon={<Sparkles size={13} />}
                label="Event"
                value={message.eventType}
              />
              <Fact
                icon={<CalendarDays size={13} />}
                label="Date"
                value={
                  message.eventDate
                    ? new Date(message.eventDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })
                    : "Not decided"
                }
              />
              <Fact
                icon={<Users size={13} />}
                label="Guests"
                value={message.guests ?? "Not given"}
              />
            </div>

            {/* What they wrote */}
            <div>
              <p className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-[#a8852f] uppercase">
                Message
              </p>
              <p className="rounded-2xl rounded-tl-md bg-[#faf8f3] p-4 text-[15px] leading-relaxed whitespace-pre-line text-slate-700 ring-1 ring-[#c49a3c]/20">
                {message.message}
              </p>
            </div>

            <NoteBox message={message} onSaved={onNoteSaved} />

            {/* Status: one segmented bar, plus a shortcut once it's been read */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  Mark as
                </span>
                <div className="flex rounded-xl bg-slate-100 p-0.5">
                  {STATUS_ORDER.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => onStatus(status)}
                      aria-pressed={message.status === status}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition sm:px-3 ${
                        message.status === status
                          ? "bg-[#14245a] text-white shadow-sm"
                          : "text-slate-500 hover:text-[#14245a]"
                      }`}
                    >
                      {STATUS_STYLE[status].label}
                    </button>
                  ))}
                </div>
              </div>
              {message.status === "READ" && (
                <button
                  type="button"
                  onClick={() => onStatus("REPLIED")}
                  className="flex cursor-pointer items-center gap-1.5 rounded-xl bg-[#c49a3c]/10 px-3 py-1.5 text-xs font-semibold text-[#8a6d26] transition hover:bg-[#c49a3c]/20"
                >
                  <Check size={13} /> Mark as replied
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A small "label / value" box: event, date, guests. */
function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-white p-3 ring-1 ring-slate-200/70">
      <p className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c49a3c]/10 text-[#c49a3c]">
          {icon}
        </span>
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold break-words text-[#14245a]">
        {value}
      </p>
    </div>
  );
}

/** Call / WhatsApp / email button. `primary` = navy. */
function ContactButton({
  href,
  icon,
  primary = false,
  newTab = false,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  primary?: boolean;
  newTab?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition ${
        primary
          ? "bg-[#14245a] text-white hover:bg-[#1d3274]"
          : "bg-white text-[#14245a] ring-1 ring-slate-200 hover:ring-[#c49a3c]"
      }`}
    >
      <span className={primary ? "text-[#dcb45c]" : "text-[#c49a3c]"}>
        {icon}
      </span>
      {children}
    </a>
  );
}

/** Copy the phone number, with a "Copied" tick for a moment. */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      title="Copy number"
      className="flex cursor-pointer items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 transition hover:text-[#14245a] hover:ring-[#c49a3c]"
    >
      {copied ? (
        <Check size={14} className="text-emerald-600" />
      ) : (
        <Copy size={14} />
      )}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

/** Private admin note: edit, then Save. */
function NoteBox({
  message,
  onSaved,
}: {
  message: ContactMessageRow;
  onSaved: (note: string) => void;
}) {
  const [note, setNote] = useState(message.adminNote ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const changed = note !== (message.adminNote ?? "");

  async function save() {
    setSaving(true);
    setError("");
    const result = await saveContactNote(message.id, note);
    setSaving(false);
    if (!result.success) return setError(result.error ?? "Failed to save");
    onSaved(note.trim());
  }

  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.15em] text-[#a8852f] uppercase">
        Note{" "}
        <span className="font-normal tracking-normal text-slate-400 normal-case">
          · only admins see this
        </span>
      </p>
      <textarea
        rows={2}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Called on Monday, sending a quote by Friday"
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15"
      />
      {(changed || error) && (
        <div className="mt-1.5 flex items-center gap-3">
          {changed && (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#14245a] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1d3274] disabled:opacity-60"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              Save note
            </button>
          )}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      )}
    </div>
  );
}

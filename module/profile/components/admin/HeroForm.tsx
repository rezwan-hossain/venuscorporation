// module/profile/components/admin/HeroForm.tsx
"use client";

// Admin → Manage Homepage → create / edit the homepage hero.
//
// Top: a live preview. It uses the same code as the homepage
// (buildHeroContent + HeroView), so what you see is what visitors get.
//
// Below, the settings in the order they appear in the hero:
//   1. What to show  — an event, or your own text
//   2. Background    — photo, phone photo
//   3. Video         — YouTube link for "Watch our events"
//   4. Options       — show the gold button / the countdown
//
// The form is checked on the server when saving (checkHeroForm in
// app/actions/homepage.ts); its error message is shown here.

import { useEffect, useState } from "react";
import { CalendarDays, Eye, Loader2, Save, Type } from "lucide-react";

import {
  createHero,
  updateHero,
  getAllHeroes,
  getHeroEvents,
} from "@/app/actions/homepage";
import type {
  HeroEvent,
  HeroFormData,
  HeroSectionData,
  HeroSource,
} from "@/types/homepage";
import { buildHeroContent, formatDate } from "@/module/home/hero-content";
import HeroView from "@/module/home/components/HeroView";
import { youTubeId } from "@/lib/youtube";
import Input from "@/components/ui/input";
import { ImageUpload } from "./ImageUpload";
import { ToggleSwitch } from "./ToggleSwitch";

type Props = {
  hero: HeroSectionData | null; // null = creating a new hero
  onSuccess: (heroes: HeroSectionData[]) => void;
  onCancel: () => void;
};

// Shared styles
const card = "rounded-2xl bg-white p-5 ring-1 ring-slate-200/70 sm:p-6";
const labelClass =
  "mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-[#14245a]";
const inputClass =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#c49a3c] focus:ring-4 focus:ring-[#c49a3c]/15";
const hintClass = "mt-1 text-xs text-slate-400";

export function HeroForm({ hero, onSuccess, onCancel }: Props) {
  const isEditing = hero !== null;
  const [form, setForm] = useState<HeroFormData>(() => initialForm(hero));
  const [events, setEvents] = useState<HeroEvent[]>([]); // upcoming events
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load the upcoming events once (for the dropdown and the preview)
  useEffect(() => {
    getHeroEvents().then((result) => setEvents(result.events));
  }, []);

  /** Change one field of the form. */
  function update<K extends keyof HeroFormData>(
    field: K,
    value: HeroFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  // Live preview: the same code the homepage uses
  const preview = buildHeroContent({
    hero: form,
    event: events.find((e) => e.id === form.eventId) || null,
    nextEvent: events[0] || null,
  });

  const isEvent = form.source === "EVENT";
  const youtubeIsValid = form.youtubeUrl === "" || !!youTubeId(form.youtubeUrl);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = isEditing
      ? await updateHero(hero.id, form)
      : await createHero(form);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const { heroes } = await getAllHeroes();
    onSuccess(heroes);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ─── Header ─── */}
      <div>
        <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
          Homepage hero
        </p>
        <p className="mt-1 text-2xl font-semibold text-[#14245a]">
          {isEditing ? "Edit hero" : "New hero"}
        </p>
        {!isEditing && (
          <p className="mt-1 text-sm text-slate-500">
            Saving makes this the hero on the homepage.
          </p>
        )}
      </div>

      {/* ─── Live preview ─── */}
      <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
        <p className="flex items-center gap-2 border-b border-slate-100 bg-white px-4 py-2.5 text-xs font-semibold text-slate-500">
          <Eye size={14} className="text-[#c49a3c]" />
          Live preview
        </p>
        {/* `zoom` shrinks the full-width hero to fit here.
            pointer-events-none: clicks in the preview do nothing. */}
        <div className="pointer-events-none bg-white" style={{ zoom: 0.55 }}>
          <div className="flex h-[44rem] flex-col">
            <HeroView content={preview} />
          </div>
        </div>
      </div>

      {/* ─── 1. What to show ─── */}
      <section className={card}>
        <StepTitle number={1} title="What to show" />

        <div className="grid gap-3 sm:grid-cols-2">
          <SourceOption
            value="EVENT"
            selected={isEvent}
            onSelect={(value) => update("source", value)}
            icon={<CalendarDays size={18} />}
            title="An event"
            text="Event name, date and description, with a Get tickets button."
          />
          <SourceOption
            value="CUSTOM"
            selected={!isEvent}
            onSelect={(value) => update("source", value)}
            icon={<Type size={18} />}
            title="Custom text"
            text="Write your own title, text and button."
          />
        </div>

        {/* An event: choose which one */}
        {isEvent && (
          <div className="mt-5">
            <label className={labelClass} htmlFor="hero-event">
              Event
            </label>
            <select
              id="hero-event"
              value={form.eventId}
              onChange={(e) => update("eventId", e.target.value)}
              className={inputClass}
            >
              <option value="">
                Next upcoming event (changes automatically)
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} · {formatDate(event.date)}
                </option>
              ))}
            </select>
            <p className={hintClass}>
              Only active, upcoming events are listed. The text comes from the
              event — edit it in Manage Events.
            </p>
          </div>
        )}

        {/* Custom text: type it in */}
        {!isEvent && (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TextField
                label="Title *"
                value={form.title}
                onChange={(value) => update("title", value)}
                placeholder="e.g. Business summits that move industries forward"
              />
            </div>
            <div className="sm:col-span-2">
              <TextField
                label="Text"
                value={form.subtitle}
                onChange={(value) => update("subtitle", value)}
                placeholder="One or two short sentences."
              />
            </div>
            <TextField
              label="Button text"
              value={form.buttonLabel}
              onChange={(value) => update("buttonLabel", value)}
              placeholder="e.g. Plan your event"
            />
            <TextField
              label="Button link"
              value={form.slug}
              onChange={(value) => update("slug", value)}
              placeholder="e.g. /contact or /events/…"
            />
            <TextField
              label="Countdown to"
              type="datetime-local"
              value={form.eventDate}
              onChange={(value) => update("eventDate", value)}
            />
          </div>
        )}
      </section>

      {/* ─── 2. Background ─── */}
      <section className={card}>
        <StepTitle number={2} title="Background" />
        <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
          <div>
            <p className={labelClass}>Photo</p>
            <ImageUpload
              value={form.desktopImage}
              onChange={(url) => update("desktopImage", url)}
              bucket="event-images"
              folder="hero"
              label="Upload photo"
              aspectRatio="aspect-[16/9]"
              maxSizeMB={5}
            />
            <p className={hintClass}>
              Optional — empty uses{" "}
              {isEvent ? "the event's banner" : "the default photo"}. Wide
              photo, at least 2000 px.
            </p>
          </div>
          <div>
            <p className={labelClass}>Phones</p>
            <ImageUpload
              value={form.mobileImage}
              onChange={(url) => update("mobileImage", url)}
              bucket="event-images"
              folder="hero"
              label="Mobile"
              aspectRatio="aspect-[9/16]"
              maxSizeMB={3}
            />
            <p className={hintClass}>Optional, tall photo.</p>
          </div>
        </div>
      </section>

      {/* ─── 3. Video ─── */}
      <section className={card}>
        <StepTitle number={3} title="“Watch our events” video" />
        <TextField
          label="YouTube link"
          value={form.youtubeUrl}
          onChange={(value) => update("youtubeUrl", value)}
          placeholder="https://www.youtube.com/watch?v=…"
        />
        {youtubeIsValid ? (
          <p className={hintClass}>
            Shows the “Watch our events” button, which plays this video. Empty:
            no button.
          </p>
        ) : (
          <p className="mt-1 text-xs text-red-500">
            That doesn&apos;t look like a YouTube link (youtube.com/watch?v=…,
            youtu.be/…).
          </p>
        )}
      </section>

      {/* ─── 4. Options ─── */}
      <section className={card}>
        <StepTitle number={4} title="Options" />
        <div className="space-y-3">
          <ToggleSwitch
            label="Show the gold button"
            description={
              isEvent
                ? "“Get tickets”, linking to the event"
                : "Needs button text and a link"
            }
            checked={form.showSlugButton}
            onChange={(value) => update("showSlugButton", value)}
          />
          <ToggleSwitch
            label="Show the countdown"
            description="“Starts in 45 days” under the button"
            checked={form.showCountdown}
            onChange={(value) => update("showCountdown", value)}
          />
        </div>
      </section>

      {/* ─── Save ─── */}
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          {error}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:border-slate-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3274] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isEditing ? "Save changes" : "Create & show on homepage"}
        </button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Helpers
// ════════════════════════════════════════════════════════════════════════

/** The form's starting values: the hero being edited, or a new event hero. */
function initialForm(hero: HeroSectionData | null): HeroFormData {
  return {
    source: hero?.source ?? "EVENT",
    eventId: hero?.eventId ?? "",
    title: hero?.source === "CUSTOM" ? hero.title : "",
    subtitle: hero?.subtitle ?? "",
    buttonLabel: hero?.buttonLabel ?? "",
    slug: hero?.slug ?? "",
    desktopImage: hero?.desktopImage ?? "",
    mobileImage: hero?.mobileImage ?? "",
    youtubeUrl: hero?.youtubeUrl ?? "",
    eventDate: toDateTimeInput(hero?.eventDate ?? null),
    showCountdown: hero?.showCountdown ?? true,
    showSlugButton: hero?.showSlugButton ?? true,
  };
}

/** A saved date → the "2026-11-22T15:00" text a datetime-local input needs. */
function toDateTimeInput(date: string | null) {
  if (!date) return "";
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

// ════════════════════════════════════════════════════════════════════════
//  Small pieces
// ════════════════════════════════════════════════════════════════════════

/** A label with a text input under it. */
function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputClass}
      />
    </label>
  );
}

/** "1  What to show" */
function StepTitle({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#c49a3c] text-xs font-semibold text-[#a8852f]">
        {number}
      </span>
      <p className="text-lg font-semibold text-[#14245a]">{title}</p>
    </div>
  );
}

/** One of the two "What to show" cards. */
function SourceOption({
  value,
  selected,
  onSelect,
  icon,
  title,
  text,
}: {
  value: HeroSource;
  selected: boolean;
  onSelect: (value: HeroSource) => void;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`flex cursor-pointer gap-3 rounded-xl p-4 text-left ring-1 transition ${
        selected
          ? "bg-[#faf8f3] ring-2 ring-[#c49a3c]"
          : "bg-white ring-slate-200 hover:ring-slate-300"
      }`}
    >
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          selected
            ? "bg-[#14245a] text-[#dcb45c]"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#14245a]">
          {title}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">{text}</span>
      </span>
    </button>
  );
}

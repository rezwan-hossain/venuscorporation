// module/profile/components/admin/ManageHomepagePanel.tsx
"use client";

import { useState } from "react";
import { HeroForm } from "./HeroForm";
import { AdminFaqEditor } from "./AdminFaqEditor";
import {
  getAllHeroes,
  setHeroActive,
  deleteHero,
} from "@/app/actions/homepage";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Circle,
  Loader2,
  Monitor,
  MousePointerClick,
  Pencil,
  PlayCircle,
  Plus,
  Smartphone,
  Timer,
  Trash2,
} from "lucide-react";
import { HeroSectionData } from "@/types/homepage";

type Props = {
  initialHeroes: HeroSectionData[];
};

type View = "list" | "create" | "edit";

export function ManageHomepagePanel({ initialHeroes }: Props) {
  const [view, setView] = useState<View>("list");
  const [heroes, setHeroes] = useState(initialHeroes);
  const [editingHero, setEditingHero] = useState<HeroSectionData | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSuccess = (updatedHeroes: HeroSectionData[]) => {
    setHeroes(updatedHeroes);
    setView("list");
    setEditingHero(null);
  };

  // Turn a hero on (it shows on the homepage) or off (the homepage shows
  // the next upcoming event instead)
  const handleToggleActive = async (heroId: string, isActive: boolean) => {
    setLoadingId(heroId);
    await setHeroActive(heroId, isActive);
    const { heroes: updated } = await getAllHeroes();
    setHeroes(updated);
    setLoadingId(null);
  };

  const handleDelete = async (heroId: string) => {
    if (!confirm("Delete this hero section?")) return;
    setLoadingId(heroId);
    await deleteHero(heroId);
    const { heroes: updated } = await getAllHeroes();
    setHeroes(updated);
    setLoadingId(null);
  };

  const activeHero = heroes.find((hero) => hero.isActive);
  const startCreate = () => {
    setEditingHero(null);
    setView("create");
  };

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="mb-5 flex items-end justify-between gap-4">
        {view === "list" ? (
          <>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
                Homepage
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#14245a]">
                Hero section
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The big banner at the top of the homepage.
              </p>
            </div>
            <button
              type="button"
              onClick={startCreate}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274]"
            >
              <Plus size={16} />
              New hero
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              setView("list");
              setEditingHero(null);
            }}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#14245a]"
          >
            <ArrowLeft size={16} />
            Back to homepage settings
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          {/* ─── What visitors see right now ─── */}
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-[#faf8f3] px-4 py-3 ring-1 ring-[#c49a3c]/20">
            <span
              className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                activeHero ? "bg-emerald-500" : "bg-[#c49a3c]"
              }`}
            />
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-[#14245a]">
                On the homepage now:
              </span>{" "}
              {activeHero
                ? heroName(activeHero)
                : "the next upcoming event (automatic — no hero is turned on)"}
            </p>
          </div>

          {/* ─── Heroes ─── */}
          {heroes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] p-12 text-center">
              <Monitor className="mx-auto mb-4 h-10 w-10 text-[#c49a3c]" />
              <p className="text-lg font-semibold text-[#14245a]">
                No heroes yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The homepage shows the next upcoming event until you make one.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {heroes.map((hero) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  busy={loadingId === hero.id}
                  onToggle={() => handleToggleActive(hero.id, !hero.isActive)}
                  onEdit={() => {
                    setEditingHero(hero);
                    setView("edit");
                  }}
                  onDelete={() => handleDelete(hero.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-8" />
        </>
      )}

      {/* FAQ (shown with the hero list, not while editing a hero) */}
      {view === "list" && <AdminFaqEditor />}

      {/* Create / Edit */}
      {(view === "create" || view === "edit") && (
        <HeroForm
          hero={editingHero}
          onSuccess={handleSuccess}
          onCancel={() => {
            setView("list");
            setEditingHero(null);
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  One hero in the list
// ════════════════════════════════════════════════════════════════════════

/** What the list calls a hero: its title, or the event it shows. */
function heroName(hero: HeroSectionData) {
  if (hero.source === "CUSTOM") return hero.title;
  return hero.event?.name ?? "Next upcoming event (automatic)";
}

/** A small chip: icon + text. */
function Chip({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#c49a3c]/10 px-2 py-0.5 text-[11px] font-medium text-[#8a6d26]">
      {icon}
      {children}
    </span>
  );
}

function HeroCard({
  hero,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  hero: HeroSectionData;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const name = heroName(hero);
  const isCustom = hero.source === "CUSTOM";
  // A custom hero needs both button text and a link to show its button
  const buttonMissingText =
    isCustom && hero.showSlugButton && hero.slug && !hero.buttonLabel;

  return (
    <div
      className={`overflow-hidden rounded-2xl bg-white ring-1 transition ${
        hero.isActive ? "ring-2 ring-emerald-400/70" : "ring-slate-200/70"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Picture (event heroes without a photo use the event's banner) */}
        <div className="relative h-32 w-full shrink-0 bg-[#14245a] sm:h-auto sm:w-52">
          {hero.desktopImage && (
            <img
              src={hero.desktopImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1840]/85 via-[#0d1840]/20 to-transparent" />
          {!hero.desktopImage && (
            <p className="absolute top-3 left-3 text-[10px] font-semibold tracking-wider text-[#dcb45c] uppercase">
              Uses event banner
            </p>
          )}
          <p className="absolute right-3 bottom-3 left-3 truncate text-sm font-semibold text-white">
            {name}
          </p>
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold tracking-[0.15em] text-[#a8852f] uppercase">
                {isCustom ? "Custom text" : "Event"}
              </p>
              <p className="mt-0.5 truncate text-base font-semibold text-[#14245a]">
                {name}
              </p>
              {isCustom && hero.buttonLabel && hero.slug && (
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  Button “{hero.buttonLabel}” → {hero.slug}
                </p>
              )}
            </div>

            {/* Edit / delete */}
            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={onEdit}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#14245a]"
                title="Edit"
              >
                <Pencil size={15} />
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>

          {/* What it shows */}
          <div className="flex flex-wrap gap-1.5">
            {hero.showSlugButton && (
              <Chip icon={<MousePointerClick size={11} />}>Gold button</Chip>
            )}
            {hero.showCountdown && (
              <Chip icon={<Timer size={11} />}>Countdown</Chip>
            )}
            {hero.youtubeUrl && (
              <Chip icon={<PlayCircle size={11} />}>Video</Chip>
            )}
            {hero.mobileImage && (
              <Chip icon={<Smartphone size={11} />}>Phone photo</Chip>
            )}
            {isCustom && hero.eventDate && (
              <Chip icon={<CalendarDays size={11} />}>
                {new Date(hero.eventDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Chip>
            )}
          </div>

          {buttonMissingText && (
            <p className="flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle size={13} />
              Has a button link but no button text, so no button shows. Edit to
              add it.
            </p>
          )}

          {/* On / off + last change */}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onToggle}
              disabled={busy}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
                hero.isActive
                  ? "bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600"
                  : "bg-white text-[#14245a] ring-1 ring-slate-200 hover:ring-[#c49a3c]"
              }`}
              title={
                hero.isActive
                  ? "Turn off — the homepage then shows the next upcoming event"
                  : "Show this hero on the homepage"
              }
            >
              {busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : hero.isActive ? (
                <CheckCircle size={13} />
              ) : (
                <Circle size={13} />
              )}
              {hero.isActive ? "On the homepage" : "Show on homepage"}
            </button>
            <p className="text-[11px] text-slate-400">
              Updated{" "}
              {new Date(hero.updatedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

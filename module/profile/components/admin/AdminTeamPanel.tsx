// module/profile/components/admin/AdminTeamPanel.tsx
"use client";

// Admin → Manage Team: the people on the About page.
//   • Filter tabs per group (Management, Leadership, Advisors, Organizers)
//   • One card per person: photo, name, role, bio, social links,
//     shown/hidden switch, edit, delete
//   • Add / Edit opens TeamMemberForm
// Order inside a group comes from each person's "sort order" number.

import { useState } from "react";
import {
  deleteTeamMember,
  getAllTeamMembers,
  toggleTeamMemberActive,
} from "@/app/actions/team";

import type { TeamCategory, TeamMember } from "@/types/team";
import {
  ArrowLeft,
  Briefcase,
  Crown,
  Eye,
  EyeOff,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Loader2,
  Pencil,
  Plus,
  Shield,
  Trash2,
  Twitter,
  UserCog,
  Users,
} from "lucide-react";
import Image from "next/image";
import { TeamMemberForm } from "./TeamMemberForm";

type Props = {
  initialMembers: TeamMember[];
};

type View = "list" | "create" | "edit";

// The four groups, in the order they're listed
const CATEGORIES = [
  { value: "MANAGEMENT", label: "Management", icon: Crown },
  { value: "ADMIN", label: "Leadership", icon: Shield },
  { value: "ADVISOR", label: "Advisors", icon: UserCog },
  { value: "ORGANIZER", label: "Organizers", icon: Briefcase },
] as const;

type Filter = "ALL" | TeamCategory;

// Social links shown as small icons on each card
const SOCIALS = [
  { key: "linkedinUrl", label: "LinkedIn", icon: Linkedin },
  { key: "twitterUrl", label: "X / Twitter", icon: Twitter },
  { key: "githubUrl", label: "GitHub", icon: Github },
  { key: "instagramUrl", label: "Instagram", icon: Instagram },
  { key: "facebookUrl", label: "Facebook", icon: Facebook },
] as const;

/** "Sarah Rahman" → "SR" (shown when there's no photo) */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export function AdminTeamPanel({ initialMembers }: Props) {
  const [view, setView] = useState<View>("list");
  const [members, setMembers] = useState(initialMembers);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  const shownCount = members.filter((m) => m.isActive).length;
  const countOf = (category: TeamCategory) =>
    members.filter((m) => m.category === category).length;

  const refreshMembers = async () => {
    const { members: updated } = await getAllTeamMembers();
    setMembers(updated as TeamMember[]);
    return updated as TeamMember[];
  };

  const handleCreate = () => {
    setEditingMember(null);
    setView("create");
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setView("edit");
  };

  const handleBack = () => {
    setView("list");
    setEditingMember(null);
  };

  const handleSuccess = (updatedMembers: TeamMember[]) => {
    setMembers(updatedMembers);
    setView("list");
    setEditingMember(null);
  };

  const handleToggleActive = async (member: TeamMember) => {
    setLoadingId(member.id);
    await toggleTeamMemberActive(member.id);
    await refreshMembers();
    setLoadingId(null);
  };

  const handleDelete = async (member: TeamMember) => {
    if (!confirm(`Delete ${member.name} from the team?`)) return;
    setLoadingId(member.id);
    const result = await deleteTeamMember(member.id);
    if (result.success) {
      await refreshMembers();
    }
    setLoadingId(null);
  };

  // Groups to show: every group for "All", otherwise just the chosen one
  const groups = CATEGORIES.filter(
    (c) => filter === "ALL" || c.value === filter,
  );

  return (
    <div>
      {/* ─── Header ─── */}
      <div className="mb-5 flex items-end justify-between gap-4">
        {view === "list" ? (
          <>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.2em] text-[#a8852f] uppercase">
                About us
              </p>
              <p className="mt-1 text-2xl font-semibold text-[#14245a]">Team</p>
              <p className="mt-1 text-sm text-slate-500">
                {members.length} {members.length === 1 ? "person" : "people"} ·{" "}
                {shownCount} shown on the About page
              </p>
            </div>
            <button
              onClick={handleCreate}
              className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-[#14245a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1d3274]"
            >
              <Plus size={16} />
              Add member
            </button>
          </>
        ) : (
          <button
            onClick={handleBack}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#14245a]"
          >
            <ArrowLeft size={16} />
            Back to team
          </button>
        )}
      </div>

      {view === "list" && (
        <>
          {members.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#c49a3c]/40 bg-[#faf8f3] p-12 text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-[#c49a3c]" />
              <p className="text-lg font-semibold text-[#14245a]">
                No team members yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add the people who should appear on the About page.
              </p>
            </div>
          ) : (
            <>
              {/* ─── Filter tabs ─── */}
              <div className="mb-5 flex flex-wrap gap-1.5">
                {[
                  { value: "ALL" as Filter, label: "All", icon: Users },
                  ...CATEGORIES,
                ].map((tab) => {
                  const active = filter === tab.value;
                  const count =
                    tab.value === "ALL" ? members.length : countOf(tab.value);
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setFilter(tab.value)}
                      className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? "bg-[#14245a] text-white"
                          : "bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
                      }`}
                    >
                      <tab.icon
                        size={13}
                        className={active ? "text-[#dcb45c]" : "text-[#c49a3c]"}
                      />
                      {tab.label}
                      <span
                        className={active ? "text-[#dcb45c]" : "text-slate-400"}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ─── One section per group ─── */}
              {groups.map((group) => {
                const people = members.filter(
                  (m) => m.category === group.value,
                );
                if (people.length === 0) {
                  return filter === "ALL" ? null : (
                    <p
                      key={group.value}
                      className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-200/70"
                    >
                      Nobody in {group.label} yet.
                    </p>
                  );
                }
                return (
                  <section key={group.value} className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                      <group.icon size={14} className="text-[#c49a3c]" />
                      <p className="text-[11px] font-semibold tracking-[0.15em] text-[#a8852f] uppercase">
                        {group.label}
                      </p>
                      <span className="text-xs text-slate-400">
                        {people.length}
                      </span>
                      <span className="h-px flex-1 bg-[#c49a3c]/20" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {people.map((member) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          busy={loadingId === member.id}
                          onToggle={() => handleToggleActive(member)}
                          onEdit={() => handleEdit(member)}
                          onDelete={() => handleDelete(member)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </>
          )}
        </>
      )}

      {(view === "create" || view === "edit") && (
        <TeamMemberForm
          member={editingMember}
          onSuccess={handleSuccess}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  One person
// ════════════════════════════════════════════════════════════════════════

function MemberCard({
  member,
  busy,
  onToggle,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  busy: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const socials = SOCIALS.filter((s) => member[s.key]);

  return (
    <div
      className={`flex flex-col rounded-2xl bg-white p-4 ring-1 ring-slate-200/70 transition hover:shadow-md hover:shadow-[#14245a]/5 ${
        member.isActive ? "" : "bg-slate-50/70"
      }`}
    >
      <div className="flex gap-4">
        {/* Photo (or initials) */}
        <div
          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#14245a] ${
            member.isActive ? "" : "opacity-50 grayscale"
          }`}
        >
          {member.image ? (
            <Image
              src={member.image}
              alt={member.name}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#dcb45c]">
              {initials(member.name)}
            </span>
          )}
        </div>

        {/* Name, role, bio */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-semibold text-[#14245a]">
              {member.name}
            </p>
            <span
              className="shrink-0 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 tabular-nums"
              title="Sort order — lower numbers are listed first"
            >
              #{member.sortOrder}
            </span>
          </div>
          {member.role && (
            <p className="truncate text-xs font-medium text-[#a8852f]">
              {member.role}
            </p>
          )}
          {member.bio && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {member.bio}
            </p>
          )}
          {socials.length > 0 && (
            <div className="mt-2 flex gap-1">
              {socials.map((social) => (
                <a
                  key={social.key}
                  href={member[social.key] ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  aria-label={social.label}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c49a3c]/10 text-[#a8852f] transition hover:bg-[#14245a] hover:text-white"
                >
                  <social.icon size={12} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shown / hidden + edit / delete */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          onClick={onToggle}
          disabled={busy}
          title={
            member.isActive
              ? "Hide from the About page"
              : "Show on the About page"
          }
          className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
            member.isActive
              ? "bg-emerald-50 text-emerald-700 hover:bg-red-50 hover:text-red-600"
              : "bg-white text-slate-500 ring-1 ring-slate-200 hover:ring-[#c49a3c]"
          }`}
        >
          {busy ? (
            <Loader2 size={13} className="animate-spin" />
          ) : member.isActive ? (
            <Eye size={13} />
          ) : (
            <EyeOff size={13} />
          )}
          {member.isActive ? "Shown on site" : "Hidden"}
        </button>
        <div className="flex items-center gap-0.5">
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
            disabled={busy}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

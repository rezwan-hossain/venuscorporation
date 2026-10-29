// module/profile/components/admin/RichTextEditor.tsx
"use client";

// Rich-text box for the event description (admin → Manage Events → event
// form). Built on Tiptap v3. `value` is HTML; `onChange` gets the new HTML.
//
// Layout, top to bottom:
//   Toolbar  — undo/redo · paragraph/headings · bold … colour · align ·
//              lists · quote/line/code · link/image · Visual | HTML switch
//   Link bar — appears under the toolbar when adding a link or image
//   Content  — the editor (or the raw HTML, in HTML mode)
//   Footer   — word and character count
//
// How the text looks while writing: app/globals.css (".tiptap").
//
// Good to know (Tiptap v3):
//   • StarterKit already includes Bold, Italic, Underline, Link, lists,
//     undo/redo … — so only the extras are added below.
//   • `shouldRerenderOnTransaction: true` makes the toolbar update as you
//     type and move the cursor (v3 doesn't by default).

import { useEffect, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Minus,
  Palette,
  Quote,
  Redo,
  Strikethrough,
  Type,
  Underline as UnderlineIcon,
  Undo,
  Unlink,
  X,
  type LucideIcon,
} from "lucide-react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

// Text colours offered in the colour menu (brand first)
const COLORS = [
  { name: "Navy", value: "#14245a" },
  { name: "Gold", value: "#a8852f" },
  { name: "Dark grey", value: "#334155" },
  { name: "Grey", value: "#64748b" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Blue", value: "#2563eb" },
];

// Size and spacing of the writing area. How the text itself looks
// (headings, lists, quotes, links …) is in app/globals.css under ".tiptap".
const CONTENT_CLASS = "min-h-[220px] px-4 py-3";

/** "example.com" → "https://example.com". Links and images need a full address. */
function withProtocol(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:|\/)/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

// ════════════════════════════════════════════════════════════════════════
//  The editor
// ════════════════════════════════════════════════════════════════════════

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your content here...",
}: Props) {
  const [mode, setMode] = useState<"visual" | "html">("visual");

  const editor = useEditor({
    immediatelyRender: false, // avoids a server/browser mismatch in Next.js
    shouldRerenderOnTransaction: true, // keeps the toolbar's active states current
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight,
      Image,
      TextStyle,
      Color,
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value,
    editorProps: { attributes: { class: CONTENT_CLASS } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // When `value` changes from outside (e.g. a different event is loaded, or
  // the HTML was edited), show it in the editor. Skipped in HTML mode — the
  // editor catches up when you switch back.
  useEffect(() => {
    if (!editor || mode === "html") return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor, mode]);

  // Loading (the editor only starts in the browser)
  if (!editor) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="h-11 animate-pulse border-b border-slate-200 bg-slate-50" />
        <div className="h-[220px] animate-pulse bg-white" />
      </div>
    );
  }

  const words = editor.storage.characterCount.words();
  const characters = editor.storage.characterCount.characters();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-[#c49a3c] focus-within:ring-4 focus-within:ring-[#c49a3c]/15">
      {/* ─── Toolbar ─── */}
      <div className="flex items-start gap-2 border-b border-slate-200 bg-[#faf8f3]/70 px-2 py-1.5">
        <div className="min-w-0 flex-1">
          {mode === "visual" ? (
            <Toolbar editor={editor} />
          ) : (
            <p className="px-1.5 py-1.5 text-xs text-slate-500">
              Editing the HTML directly. Switch back to Visual to see the
              result.
            </p>
          )}
        </div>
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>

      {/* ─── Content ─── */}
      {mode === "visual" ? (
        <EditorContent editor={editor} />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="block min-h-[220px] w-full resize-y bg-slate-50 px-4 py-3 font-mono text-xs leading-relaxed text-slate-700 outline-none"
        />
      )}

      {/* ─── Footer ─── */}
      <div className="flex items-center justify-between border-t border-slate-100 px-3 py-1.5 text-[11px] text-slate-400">
        <span className="tabular-nums">
          {words} {words === 1 ? "word" : "words"} · {characters} characters
        </span>
        <span>{mode === "visual" ? "Visual editor" : "HTML"}</span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════
//  Toolbar
// ════════════════════════════════════════════════════════════════════════

/** One toolbar button: an icon, what it does, and whether it's "on". */
type Tool = {
  icon: LucideIcon;
  title: string;
  run: () => void;
  active?: boolean;
  disabled?: boolean;
};

function Toolbar({ editor }: { editor: Editor }) {
  // The little bar for typing a link or image address (null = closed)
  const [urlBar, setUrlBar] = useState<"link" | "image" | null>(null);
  const [showColors, setShowColors] = useState(false);

  // `chain().focus()` puts the cursor back in the text after a click
  const chain = () => editor.chain().focus();

  // Buttons, in groups (a thin line is drawn between groups)
  const groups: Tool[][] = [
    [
      {
        icon: Undo,
        title: "Undo",
        run: () => chain().undo().run(),
        disabled: !editor.can().undo(),
      },
      {
        icon: Redo,
        title: "Redo",
        run: () => chain().redo().run(),
        disabled: !editor.can().redo(),
      },
    ],
    [
      {
        icon: Type,
        title: "Normal text",
        run: () => chain().setParagraph().run(),
        active: editor.isActive("paragraph"),
      },
      {
        icon: Heading1,
        title: "Heading 1",
        run: () => chain().toggleHeading({ level: 1 }).run(),
        active: editor.isActive("heading", { level: 1 }),
      },
      {
        icon: Heading2,
        title: "Heading 2",
        run: () => chain().toggleHeading({ level: 2 }).run(),
        active: editor.isActive("heading", { level: 2 }),
      },
      {
        icon: Heading3,
        title: "Heading 3",
        run: () => chain().toggleHeading({ level: 3 }).run(),
        active: editor.isActive("heading", { level: 3 }),
      },
    ],
    [
      {
        icon: Bold,
        title: "Bold",
        run: () => chain().toggleBold().run(),
        active: editor.isActive("bold"),
      },
      {
        icon: Italic,
        title: "Italic",
        run: () => chain().toggleItalic().run(),
        active: editor.isActive("italic"),
      },
      {
        icon: UnderlineIcon,
        title: "Underline",
        run: () => chain().toggleUnderline().run(),
        active: editor.isActive("underline"),
      },
      {
        icon: Strikethrough,
        title: "Strikethrough",
        run: () => chain().toggleStrike().run(),
        active: editor.isActive("strike"),
      },
      {
        icon: Highlighter,
        title: "Highlight",
        run: () => chain().toggleHighlight().run(),
        active: editor.isActive("highlight"),
      },
      {
        icon: Code,
        title: "Inline code",
        run: () => chain().toggleCode().run(),
        active: editor.isActive("code"),
      },
    ],
    [
      {
        icon: AlignLeft,
        title: "Align left",
        run: () => chain().setTextAlign("left").run(),
        active: editor.isActive({ textAlign: "left" }),
      },
      {
        icon: AlignCenter,
        title: "Align centre",
        run: () => chain().setTextAlign("center").run(),
        active: editor.isActive({ textAlign: "center" }),
      },
      {
        icon: AlignRight,
        title: "Align right",
        run: () => chain().setTextAlign("right").run(),
        active: editor.isActive({ textAlign: "right" }),
      },
    ],
    [
      {
        icon: List,
        title: "Bullet list",
        run: () => chain().toggleBulletList().run(),
        active: editor.isActive("bulletList"),
      },
      {
        icon: ListOrdered,
        title: "Numbered list",
        run: () => chain().toggleOrderedList().run(),
        active: editor.isActive("orderedList"),
      },
      {
        icon: Quote,
        title: "Quote",
        run: () => chain().toggleBlockquote().run(),
        active: editor.isActive("blockquote"),
      },
      {
        icon: Minus,
        title: "Divider line",
        run: () => chain().setHorizontalRule().run(),
      },
      {
        icon: Code2,
        title: "Code block",
        run: () => chain().toggleCodeBlock().run(),
        active: editor.isActive("codeBlock"),
      },
    ],
    [
      {
        icon: LinkIcon,
        title: "Add link",
        run: () => setUrlBar("link"),
        active: editor.isActive("link") || urlBar === "link",
      },
      ...(editor.isActive("link")
        ? [
            {
              icon: Unlink,
              title: "Remove link",
              run: () => chain().extendMarkRange("link").unsetLink().run(),
            },
          ]
        : []),
      {
        icon: ImageIcon,
        title: "Add image",
        run: () => setUrlBar("image"),
        active: urlBar === "image",
      },
    ],
  ];

  const currentColor = editor.getAttributes("textStyle").color as
    string | undefined;

  return (
    <div>
      {/* Buttons wrap onto a second line on narrow screens */}
      <div className="flex flex-wrap items-center gap-0.5">
        {groups.map((group, i) => (
          <div key={i} className="flex items-center gap-0.5">
            {i > 0 && (
              <span className="mx-1 h-5 w-px bg-slate-200" aria-hidden />
            )}
            {group.map((tool) => (
              <ToolButton key={tool.title} tool={tool} />
            ))}
            {/* Text colour sits at the end of the bold/italic group */}
            {i === 2 && (
              <ColorMenu
                open={showColors}
                current={currentColor}
                onToggle={() => setShowColors(!showColors)}
                onPick={(color) => {
                  if (color) chain().setColor(color).run();
                  else chain().unsetColor().run();
                  setShowColors(false);
                }}
              />
            )}
          </div>
        ))}
      </div>

      {urlBar && (
        <UrlBar
          kind={urlBar}
          initial={
            urlBar === "link" ? (editor.getAttributes("link").href ?? "") : ""
          }
          onCancel={() => setUrlBar(null)}
          onSave={(url) => {
            if (urlBar === "link") {
              if (url)
                chain().extendMarkRange("link").setLink({ href: url }).run();
              else chain().extendMarkRange("link").unsetLink().run();
            } else if (url) {
              chain().setImage({ src: url }).run();
            }
            setUrlBar(null);
          }}
        />
      )}
    </div>
  );
}

/** A square icon button. Navy when its format is "on". */
function ToolButton({ tool }: { tool: Tool }) {
  const Icon = tool.icon;
  return (
    <button
      type="button"
      onClick={tool.run}
      disabled={tool.disabled}
      title={tool.title}
      aria-label={tool.title}
      aria-pressed={tool.active}
      className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-30 ${
        tool.active
          ? "bg-[#14245a] text-white"
          : "text-slate-500 hover:bg-white hover:text-[#14245a] hover:shadow-sm"
      }`}
    >
      <Icon size={15} />
    </button>
  );
}

/** Palette button + a small menu of colours. */
function ColorMenu({
  open,
  current,
  onToggle,
  onPick,
}: {
  open: boolean;
  current?: string;
  onToggle: () => void;
  onPick: (color: string | null) => void;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        title="Text colour"
        aria-label="Text colour"
        aria-expanded={open}
        className="flex h-8 w-8 cursor-pointer flex-col items-center justify-center rounded-lg text-slate-500 transition hover:bg-white hover:text-[#14245a] hover:shadow-sm"
      >
        <Palette size={15} />
        {/* A small bar showing the colour at the cursor */}
        <span
          className="mt-0.5 h-0.5 w-4 rounded-full"
          style={{ background: current ?? "transparent" }}
        />
      </button>

      {open && (
        <>
          {/* Click anywhere else to close */}
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute top-full left-0 z-20 mt-1 w-44 rounded-xl bg-white p-2 shadow-lg ring-1 ring-slate-200">
            <div className="grid grid-cols-4 gap-1.5">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onPick(color.value)}
                  title={color.name}
                  aria-label={color.name}
                  className={`h-7 w-7 cursor-pointer rounded-full ring-offset-2 transition hover:scale-110 ${
                    current === color.value ? "ring-2 ring-[#c49a3c]" : ""
                  }`}
                  style={{ background: color.value }}
                />
              ))}
              <button
                type="button"
                onClick={() => onPick(null)}
                title="No colour"
                aria-label="No colour"
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 hover:border-slate-400"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/** The small bar for typing a link or image address. Empty link = remove it. */
function UrlBar({
  kind,
  initial,
  onSave,
  onCancel,
}: {
  kind: "link" | "image";
  initial: string;
  onSave: (url: string) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState(initial);
  const save = () => onSave(withProtocol(url));

  return (
    <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white p-1.5 ring-1 ring-[#c49a3c]/40">
      {kind === "link" ? (
        <LinkIcon size={14} className="ml-1.5 shrink-0 text-[#c49a3c]" />
      ) : (
        <ImageIcon size={14} className="ml-1.5 shrink-0 text-[#c49a3c]" />
      )}
      <input
        autoFocus
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          // Enter saves, Escape closes — and neither submits the event form
          if (e.key === "Enter") {
            e.preventDefault();
            save();
          }
          if (e.key === "Escape") onCancel();
        }}
        placeholder={
          kind === "link"
            ? "Paste a link, e.g. example.com"
            : "Paste an image address (https://…)"
        }
        className="h-8 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
      />
      <button
        type="button"
        onClick={save}
        className="flex h-8 cursor-pointer items-center gap-1 rounded-lg bg-[#14245a] px-3 text-xs font-semibold text-white hover:bg-[#1d3274]"
      >
        <Check size={13} /> {kind === "link" ? "Save link" : "Add image"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        title="Cancel"
        aria-label="Cancel"
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}

/** "Visual | HTML" switch at the end of the toolbar. */
function ModeSwitch({
  mode,
  onChange,
}: {
  mode: "visual" | "html";
  onChange: (mode: "visual" | "html") => void;
}) {
  return (
    <div className="flex shrink-0 rounded-lg bg-white p-0.5 ring-1 ring-slate-200">
      {(["visual", "html"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={mode === option}
          className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-semibold transition ${
            mode === option
              ? "bg-[#14245a] text-white"
              : "text-slate-500 hover:text-[#14245a]"
          }`}
        >
          {option === "visual" ? "Visual" : "HTML"}
        </button>
      ))}
    </div>
  );
}

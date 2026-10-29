// lib/faq-defaults.ts
//
// The built-in FAQ (event management). Used:
//   • by prisma/seed.ts to fill an empty faqs table
//   • on the homepage and Services page only if the database can't be reached
// Normally both pages read the questions from the database, edited in
// admin → Manage Homepage → FAQ.

export const DEFAULT_FAQS: { question: string; answer: string }[] = [
  {
    question: "How early should we book?",
    answer:
      "For weddings and large corporate events, 3–6 months ahead is ideal. Smaller private events can often be arranged in 2–4 weeks — ask us about your date.",
  },
  {
    question: "Can you work with our budget?",
    answer:
      "Yes. We start from your budget, show you clearly where it goes, and suggest options so nothing is spent without your approval.",
  },
  {
    question: "Do you handle venues and vendors?",
    answer:
      "We do — venue booking, catering, décor, sound, lighting, photography and permits, all through partners we trust.",
  },
  {
    question: "Do you organise events outside Dhaka?",
    answer:
      "Yes, across Bangladesh — from Chattogram beach events to Sundarbans trail runs. Travel and logistics are part of our plan.",
  },
  {
    question: "What happens on the event day?",
    answer:
      "A dedicated coordinator and on-site team run the schedule, vendors and guests, so you can simply enjoy the occasion.",
  },
];

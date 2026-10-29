-- Homepage FAQ: swap the old marathon questions for event-management ones.
--
-- Only the original marathon questions are removed (matched by their exact
-- text, so a question an admin has reworded stays). Anything an admin
-- added or changed is kept.

DELETE FROM "faqs" WHERE "question" IN (
  'How do I register for the marathon?',
  'Is there an early bird discount?',
  'Can beginners participate?',
  'What should I bring on race day?',
  'Is baggage storage available?',
  'Is parking available at the venue?',
  'Is there an age limit to participate?',
  'What happens if it rains?'
);

INSERT INTO "faqs" ("id", "question", "answer", "sortOrder", "isActive", "updatedAt") VALUES
  ('faq_venus_1', 'How early should we book?', 'For weddings and large corporate events, 3–6 months ahead is ideal. Smaller private events can often be arranged in 2–4 weeks — ask us about your date.', 1, true, CURRENT_TIMESTAMP),
  ('faq_venus_2', 'Can you work with our budget?', 'Yes. We start from your budget, show you clearly where it goes, and suggest options so nothing is spent without your approval.', 2, true, CURRENT_TIMESTAMP),
  ('faq_venus_3', 'Do you handle venues and vendors?', 'We do — venue booking, catering, décor, sound, lighting, photography and permits, all through partners we trust.', 3, true, CURRENT_TIMESTAMP),
  ('faq_venus_4', 'Do you organise events outside Dhaka?', 'Yes, across Bangladesh — from Chattogram beach events to Sundarbans trail runs. Travel and logistics are part of our plan.', 4, true, CURRENT_TIMESTAMP),
  ('faq_venus_5', 'What happens on the event day?', 'A dedicated coordinator and on-site team run the schedule, vendors and guests, so you can simply enjoy the occasion.', 5, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

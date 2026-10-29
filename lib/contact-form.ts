// lib/contact-form.ts
//
// The contact page enquiry: its fields and the checks on them. Used by the
// form in the browser (module/contact/components/ContactForm.tsx) and again
// on the server before saving (app/actions/contact.ts), so both agree.

export type ContactInput = {
  name: string;
  phone: string;
  email: string; // "" = not given
  eventType: string;
  date: string; // "YYYY-MM-DD", "" = not given
  guests: string; // "" = not given
  message: string;
};

export const MESSAGE_MAX = 800;

const LIMITS = { name: 100, phone: 30, email: 200, eventType: 60, guests: 30 };

/** Problems with the enquiry, per field. Empty object = fine to send. */
export function checkContactForm(
  form: ContactInput,
): Partial<Record<keyof ContactInput, string>> {
  const errors: Partial<Record<keyof ContactInput, string>> = {};

  if (!form.name.trim()) errors.name = "Please tell us your name";
  else if (form.name.length > LIMITS.name)
    errors.name = "That name is too long";

  const digits = form.phone.replace(/\D/g, "");
  if (!form.phone.trim()) errors.phone = "We need a number to call you back";
  else if (digits.length < 8 || form.phone.length > LIMITS.phone)
    errors.phone = "That number doesn't look right";

  if (
    form.email.trim() &&
    (!/^\S+@\S+\.\S+$/.test(form.email) || form.email.length > LIMITS.email)
  )
    errors.email = "That email doesn't look right";

  if (!form.eventType.trim()) errors.eventType = "Choose the kind of event";
  else if (form.eventType.length > LIMITS.eventType)
    errors.eventType = "Choose the kind of event";

  if (form.date && !/^\d{4}-\d{2}-\d{2}$/.test(form.date))
    errors.date = "Pick a date from the calendar";

  if (form.guests.length > LIMITS.guests)
    errors.guests = "Pick a number of guests";

  if (!form.message.trim())
    errors.message = "A few words about your event, please";
  else if (form.message.length > MESSAGE_MAX)
    errors.message = `Keep it under ${MESSAGE_MAX} characters`;

  return errors;
}

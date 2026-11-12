// config/contact.ts
//
// Venus Corporation's contact details — edit them here.
// Used by: the Contact page (/contact), the site footer and the floating
// WhatsApp button. The first phone number is the main one.

export const contactDetails = {
  phones: [
    { label: "+880 1776 684821", href: "tel:+8801776684821" },
    { label: "+880 1960 608000", href: "tel:+8801960608000" },
  ],
  email: "info@venuscorporation.org",
  // WhatsApp chat link: wa.me/<country code + number, digits only>
  whatsapp: { label: "Chat on WhatsApp", href: "https://wa.me/8801776684821" },
  address:
    "House 3, Road 3, Gate 3, Section 3, Pallabi Extension, Mirpur, Dhaka 1216",
  // What Google Maps searches for in the embedded map. Kept to the area:
  // Google often can't find Dhaka house/road numbers and shows the wrong spot.
  mapQuery: "Pallabi Extension, Mirpur, Dhaka 1216, Bangladesh",
  // Social profiles (footer + Contact page). Replace "#" with your real links;
  // remove a line to hide that icon.
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "X", href: "#" },
    { label: "YouTube", href: "#" },
  ],
};

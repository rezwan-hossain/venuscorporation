// module/contact/contact-details.ts
//
// Venus Corporation's contact details, used by the /contact page.
// (The footer and the homepage's closing section have their own copies of
// the main phone number and email — update those too if these change.)

export const contactDetails = {
  phones: [
    { label: "+880 1862 221943", href: "tel:+8801862221943" },
    { label: "+880 1791 161187", href: "tel:+8801791161187" },
    { label: "+880 1670 445151", href: "tel:+8801670445151" },
  ],
  email: "info@venuscorporation.org",
  // WhatsApp chat link: wa.me/<country code + number, digits only>
  whatsapp: { label: "Chat on WhatsApp", href: "https://wa.me/8801862221943" },
  address: "House-32, Road-08, Block-H, Mirpur-2, Dhaka",
  // What Google Maps searches for in the embedded map
  mapQuery: "Mirpur-2, Dhaka, Bangladesh",
  social: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "YouTube", href: "#" },
  ],
};

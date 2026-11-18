// module/legal/components/TermsAndConditionsContent.tsx
//
// The text of /terms-and-conditions, laid out with the shared legal
// building blocks (./legal-ui.tsx — also used by the Privacy Policy):
//
//   large screens:  ┌ Contents (sticky) ┐ ┌ notice · 18 sections · agreement ┐
//   phones:         contents (folded) on top, then the sections
//
// Edit the wording in `sections` below. Each section has either
//   text    — one paragraph, or
//   points  — a bullet list; a point can have `sub` points (an indented list).
// Numbers ("01", "02" …) and the contents list are added automatically.

import { ShieldCheck } from "lucide-react";
import {
  ClosingPanel,
  ContactCard,
  GOLD,
  LegalLayout,
  Notice,
  Points,
  SectionTitle,
  type Point,
} from "./legal-ui";

type Section = { id: string; title: string; text?: string; points?: Point[] };

const sections: Section[] = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    text: "By purchasing a ticket and participating in our marathon event, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not register or participate in the event.",
  },
  {
    id: "registration",
    title: "Event Registration & Ticket Purchase",
    points: [
      "Registration is complete only after successful payment confirmation.",
      "Each ticket is valid for one participant only and is non-transferable unless explicitly permitted by the organizers.",
      "You must provide accurate personal information during registration, including your full name, contact details, date of birth, emergency contact, and medical information.",
      "False or misleading information may result in disqualification without refund.",
    ],
  },
  {
    id: "eligibility",
    title: "Eligibility Requirements",
    points: [
      "You must be in good physical health and capable of completing the registered distance.",
      "We strongly recommend consulting a physician before participating, especially if you have any pre-existing medical conditions.",
      "The organizers reserve the right to request medical clearance certificates.",
    ],
  },
  {
    id: "payment",
    title: "Payment & Pricing",
    points: [
      "All prices are displayed in Bangladeshi Taka (৳) and include applicable taxes.",
      "Payment must be made through our approved payment gateways (ShurjoPay, bKash, Nagad, or card payment).",
      "Tickets are confirmed only after successful payment processing.",
      "Price changes may occur without prior notice for future events.",
    ],
  },
  {
    id: "refunds",
    title: "Refund & Cancellation Policy",
    points: [
      "All ticket purchases are final and non-refundable unless the event is cancelled by the organizers.",
      "If the event is cancelled due to circumstances beyond our control (force majeure), participants may receive a partial refund or credit for future events at the organizers' discretion.",
      "No refunds will be issued for no-shows or failure to complete the race.",
      "Transfer of registration to another participant may be permitted up to 7 days before the event, subject to an administrative fee.",
    ],
  },
  {
    id: "event-day",
    title: "Event Day Requirements",
    points: [
      "You must collect your race kit (BIB number, timing chip, t-shirt) at the designated location and time announced by the organizers.",
      "Valid government-issued photo ID matching your registration details is required for kit collection.",
      "Participants must wear the official BIB number visibly on their chest during the race.",
      "The timing chip must be worn as instructed; failure to do so may result in no official time being recorded.",
    ],
  },
  {
    id: "conduct",
    title: "Race Rules & Conduct",
    points: [
      "All participants must follow the designated race route and instructions from race officials and marshals.",
      "Use of any motorized vehicles, bicycles, skates, or other wheeled equipment is strictly prohibited.",
      "Participants must not accept assistance from non-participants during the race.",
      "Unsportsmanlike conduct, including but not limited to cheating, aggressive behavior, or disrespect towards officials, volunteers, or other participants, will result in immediate disqualification.",
      "Headphones and earbuds are discouraged for safety reasons but are permitted at the participant's own risk.",
    ],
  },
  {
    id: "health",
    title: "Health & Safety",
    points: [
      "Participants take part in the marathon at their own risk.",
      "Medical support will be available along the course and at the finish line.",
      "If you feel unwell at any point during the race, you must stop and seek medical assistance immediately.",
      "The organizers reserve the right to remove any participant from the race for medical or safety reasons.",
      "Participants must disclose any medical conditions during registration.",
    ],
  },
  {
    id: "liability",
    title: "Liability Waiver",
    points: [
      "By registering, you acknowledge that participating in a marathon involves inherent risks, including but not limited to physical injury, illness, or in extreme cases, death.",
      "You agree to release and hold harmless the organizers, sponsors, volunteers, and affiliated parties from any claims, damages, or liabilities arising from your participation.",
      "This waiver extends to personal property loss or damage during the event.",
    ],
  },
  {
    id: "media",
    title: "Media & Photography",
    points: [
      "Official event photographs and videos may be published on our website, social media, and marketing materials.",
      "If you do not wish to be photographed, please notify the organizers before the event.",
    ],
  },
  {
    id: "privacy",
    title: "Personal Data & Privacy",
    points: [
      "Your personal information will be collected, stored, and processed in accordance with our Privacy Policy.",
      "We may share your data with timing companies, medical services, and sponsors as necessary for event operations.",
      "Your contact information may be used to send event-related communications and future event promotions.",
    ],
  },
  {
    id: "modifications",
    title: "Event Modifications",
    points: [
      "The organizers reserve the right to modify the event date, time, route, or format due to weather conditions, safety concerns, or other unforeseen circumstances.",
      "In case of significant changes, registered participants will be notified via email and/or SMS.",
      "No refunds will be issued for event modifications unless the event is completely cancelled.",
    ],
  },
  {
    id: "disqualification",
    title: "Disqualification",
    points: [
      {
        text: "The organizers reserve the right to disqualify any participant who:",
        sub: [
          "Fails to follow the official race route",
          "Receives unauthorized assistance",
          "Exhibits unsportsmanlike conduct",
          "Provides false information during registration",
          "Violates any of these Terms and Conditions",
        ],
      },
      "Disqualified participants will not receive official results or awards.",
    ],
  },
  {
    id: "awards",
    title: "Awards & Prizes",
    points: [
      "Awards and prizes will be distributed to winners as announced for each race category.",
      "Winners must be present at the award ceremony to claim prizes, unless otherwise arranged with the organizers.",
      "Prize decisions made by the organizers are final and binding.",
      "Unclaimed prizes may be forfeited after 30 days from the event date.",
    ],
  },
  {
    id: "merchandise",
    title: "T-Shirt & Merchandise",
    points: [
      "T-shirt sizes selected during registration are final and cannot be exchanged.",
      "T-shirts and other merchandise included in the registration package must be collected during the designated kit collection period.",
      "Uncollected items will not be shipped or held beyond the event day.",
    ],
  },
  {
    id: "force-majeure",
    title: "Force Majeure",
    text: "The organizers shall not be liable for any failure or delay in performing their obligations due to circumstances beyond their reasonable control, including but not limited to natural disasters, pandemics, government actions, civil unrest, or severe weather conditions.",
  },
  {
    id: "governing-law",
    title: "Governing Law",
    text: "These Terms and Conditions shall be governed by and construed in accordance with the laws of Bangladesh. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Bangladesh.",
  },
  {
    id: "contact",
    title: "Contact Information",
    text: "For any questions or concerns regarding these Terms and Conditions, please contact us at:",
  },
];

export default function TermsAndConditionsContent() {
  return (
    <LegalLayout sections={sections}>
      <Notice icon={ShieldCheck} label="Important">
        Please read these Terms and Conditions carefully before purchasing your marathon ticket. By completing your
        registration and payment, you acknowledge that you have read, understood, and agree to be bound by these terms.
      </Notice>

      <ol className="mt-4">
        {sections.map((section, i) => (
          <li
            key={section.id}
            id={section.id}
            className="scroll-mt-28 border-b py-8 last:border-b-0 sm:py-10"
            style={{ borderColor: `${GOLD}26` }}
          >
            <SectionTitle index={i} title={section.title} />
            <div className="mt-4 text-[15px] leading-relaxed text-slate-600 sm:pl-12">
              {section.text && <p>{section.text}</p>}
              {section.points && <Points points={section.points} />}
              {section.id === "contact" && <ContactCard />}
            </div>
          </li>
        ))}
      </ol>

      <ClosingPanel label="Agreement">
        By checking the &ldquo;I agree with terms and conditions&rdquo; checkbox during checkout, you confirm that you have
        read, understood, and accept all the terms and conditions stated above. You also acknowledge that you are
        voluntarily participating in the marathon event at your own risk.
      </ClosingPanel>
    </LegalLayout>
  );
}

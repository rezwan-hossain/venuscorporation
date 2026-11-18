// module/legal/components/PrivacyPolicyContent.tsx
//
// The text of /privacy-policy, laid out with the shared legal building
// blocks (./legal-ui.tsx — same look as Terms & Conditions).
//
// Edit the wording in `sections` below. Each section can have
//   intro   — a paragraph before the list,
//   points  — the bullet list ({ label, text } shows "Label: text"),
//   outro   — a paragraph after the list.
// Numbers and the contents list are added automatically.

import { Cookie, Database, HeartHandshake, Lock, Mail, RefreshCw, Share2, Shield, UserCheck, type LucideIcon } from "lucide-react";
import { ClosingPanel, ContactCard, GOLD, LegalLayout, Notice, Points, SectionTitle, type Point } from "./legal-ui";

type Section = {
  id: string;
  icon: LucideIcon;
  title: string;
  intro?: string;
  points?: Point[];
  outro?: string;
};

const sections: Section[] = [
  {
    id: "information-we-collect",
    icon: Database,
    title: "Information We Collect",
    intro:
      "We collect information to provide better services to our marathon participants. The types of information we collect include:",
    points: [
      {
        label: "Personal Information",
        text: "Name, email address, phone number, date of birth, gender, and emergency contact details provided during registration.",
      },
      {
        label: "Health Information",
        text: "Blood group, medical conditions, and physical fitness information relevant to marathon participation.",
      },
      {
        label: "Payment Information",
        text: "Transaction details processed through our secure payment gateways (ShurjoPay, bKash, Nagad).",
      },
      { label: "Event Data", text: "Race times, participation history, and performance statistics." },
      {
        label: "Usage Data",
        text: "Information about how you interact with our website, including IP address, browser type, and pages visited.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: Shield,
    title: "How We Use Your Information",
    intro: "We use the collected information for the following purposes:",
    points: [
      { label: "Event Management", text: "Processing registrations, assigning BIB numbers, and managing race logistics." },
      {
        label: "Communication",
        text: "Sending event updates, race instructions, and important announcements via email or SMS.",
      },
      {
        label: "Safety & Medical",
        text: "Providing medical support during events and contacting emergency contacts if necessary.",
      },
      { label: "Timing & Results", text: "Recording and publishing race times and results." },
      { label: "Improvement", text: "Analyzing usage patterns to improve our website and event experience." },
      { label: "Marketing", text: "Sending information about future events and promotions (with your consent)." },
    ],
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies & Tracking",
    intro: "We use cookies and similar tracking technologies to enhance your experience:",
    points: [
      { label: "Essential Cookies", text: "Required for website functionality, authentication, and security." },
      {
        label: "Analytics Cookies",
        text: "Help us understand how visitors interact with our website using services like Google Analytics.",
      },
      { label: "Preference Cookies", text: "Remember your settings and preferences for future visits." },
    ],
    outro:
      "You can control cookie settings through your browser. However, disabling certain cookies may affect website functionality.",
  },
  {
    id: "security",
    icon: Lock,
    title: "Data Security",
    intro: "We take the security of your data seriously and implement appropriate measures:",
    points: [
      { label: "Encryption", text: "All sensitive data is encrypted during transmission using SSL/TLS protocols." },
      { label: "Secure Storage", text: "Personal information is stored on secure servers with restricted access." },
      {
        label: "Payment Security",
        text: "We do not store complete payment card details. All transactions are processed through PCI-compliant payment gateways.",
      },
      { label: "Access Control", text: "Only authorized personnel have access to personal data on a need-to-know basis." },
      {
        label: "Regular Audits",
        text: "We conduct periodic security assessments to identify and address vulnerabilities.",
      },
    ],
  },
  {
    id: "third-parties",
    icon: Share2,
    title: "Third-Party Services",
    intro: "We may share your information with trusted third parties for event operations:",
    points: [
      { label: "Payment Processors", text: "ShurjoPay, bKash, and Nagad for secure payment processing." },
      { label: "Timing Companies", text: "Official timing partners for accurate race time recording." },
      { label: "Medical Services", text: "Emergency medical teams for participant safety during events." },
      { label: "Analytics Providers", text: "Google Analytics for website performance analysis." },
      { label: "Email Services", text: "For sending event communications and updates." },
    ],
    outro:
      "We ensure all third parties adhere to appropriate data protection standards and only use your data for specified purposes.",
  },
  {
    id: "your-rights",
    icon: UserCheck,
    title: "Your Rights",
    intro: "You have the following rights regarding your personal data:",
    points: [
      { label: "Access", text: "Request a copy of the personal information we hold about you." },
      { label: "Correction", text: "Request corrections to any inaccurate or incomplete information." },
      { label: "Deletion", text: "Request deletion of your personal data, subject to legal retention requirements." },
      { label: "Opt-Out", text: "Unsubscribe from marketing communications at any time." },
      { label: "Data Portability", text: "Request your data in a portable format." },
      { label: "Withdraw Consent", text: "Withdraw previously given consent for data processing." },
    ],
    outro: "To exercise these rights, please contact us using the information provided below.",
  },
  {
    id: "changes",
    icon: RefreshCw,
    title: "Changes to This Policy",
    intro:
      "We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements:",
    points: [
      { label: "Notification", text: "Significant changes will be communicated via email or website announcement." },
      {
        label: "Effective Date",
        text: 'The "Last Updated" date at the top indicates when the policy was last revised.',
      },
      {
        label: "Continued Use",
        text: "Your continued use of our services after changes constitutes acceptance of the updated policy.",
      },
    ],
    outro: "We encourage you to review this policy regularly to stay informed about how we protect your information.",
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Us",
    intro:
      "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:",
  },
];

export default function PrivacyPolicyContent() {
  return (
    <LegalLayout sections={sections}>
      <Notice icon={HeartHandshake} label="Our Commitment">
        At Venus Corporation, we are committed to protecting your privacy and ensuring the security of your personal
        information. This Privacy Policy explains how we collect, use, store, and protect your data when you use our
        services and participate in our events.
      </Notice>

      <ol className="mt-4">
        {sections.map((section, i) => (
          <li
            key={section.id}
            id={section.id}
            className="scroll-mt-28 border-b py-8 last:border-b-0 sm:py-10"
            style={{ borderColor: `${GOLD}26` }}
          >
            <SectionTitle index={i} title={section.title} icon={section.icon} />
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600 sm:pl-13">
              {section.intro && <p>{section.intro}</p>}
              {section.points && <Points points={section.points} />}
              {section.outro && <p>{section.outro}</p>}
              {section.id === "contact" && <ContactCard />}
            </div>
          </li>
        ))}
      </ol>

      <ClosingPanel label="Your consent">
        By using our website and registering for our marathon events, you consent to the collection and use of your
        information as described in this Privacy Policy. If you do not agree with this policy, please do not use our
        services.
      </ClosingPanel>
    </LegalLayout>
  );
}

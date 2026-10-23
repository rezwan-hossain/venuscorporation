import type { Metadata } from "next";
import ServicesPage from "@/module/services/pages/ServicesPage";

export const metadata: Metadata = {
  title: "Our Services — Venus Corporation Event Management",
  description:
    "Corporate events, sports events, weddings, conferences & seminars, exhibitions & trade shows, and private & social events — planned and delivered by Venus Corporation.",
};

export default function Services() {
  return <ServicesPage />;
}

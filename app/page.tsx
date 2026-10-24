import type { Metadata } from "next";
import BusinessHomepage from "@/module/home/pages/BusinessHomepage";
// The original marathon homepage — to switch back, import it and render it below instead:
// import Homepage from "@/module/home/pages/Homepage";

export const metadata: Metadata = {
  title: "Venus Corporation — Event Management | Business Beyond Boundaries",
  description:
    "Venus Corporation plans and runs corporate events, sports events, weddings, conferences, exhibitions and private celebrations. Your vision, our expertise.",
};

export default function Home() {
  return <BusinessHomepage />;
}

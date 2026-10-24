// app/about/page.tsx
import type { Metadata } from "next";
import AboutPage from "@/module/about/pages/AboutPage";
import { getActiveTeamMembers } from "../actions/team";

export const metadata: Metadata = {
  title: "About Us — Venus Corporation",
  description:
    "Venus Corporation is an event-management company from Dhaka — our story, mission, values, milestones and the team behind every event.",
};

export default async function Page() {
  const { members } = await getActiveTeamMembers();
  return <AboutPage members={members} />;
}

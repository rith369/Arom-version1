import type { Metadata } from "next";
import { ProgressDashboardView } from "./_components/progress-dashboard-view";

export const metadata: Metadata = {
  title: "Progress Dashboard",
};

export default function ProgressPage() {
  return <ProgressDashboardView />;
}

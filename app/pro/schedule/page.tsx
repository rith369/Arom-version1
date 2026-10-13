import type { Metadata } from "next";
import { ScheduleEditorPage } from "../_components/schedule-editor-page";

export const metadata: Metadata = {
  title: "My schedule",
};

export default function ProSchedulePage() {
  return <ScheduleEditorPage />;
}

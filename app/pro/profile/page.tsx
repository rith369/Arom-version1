import type { Metadata } from "next";
import { ProfileEditorPage } from "../_components/profile-editor-page";

export const metadata: Metadata = {
  title: "My profile",
};

export default function ProProfilePage() {
  return <ProfileEditorPage />;
}

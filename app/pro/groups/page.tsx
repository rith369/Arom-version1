import type { Metadata } from "next";
import { ProGroupsView } from "../_components/groups-view";

export const metadata: Metadata = {
  title: "Support groups",
};

export default function ProGroupsPage() {
  return <ProGroupsView />;
}

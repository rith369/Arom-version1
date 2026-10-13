import type { Metadata } from "next";
import { ClientsView } from "../_components/clients-view";

export const metadata: Metadata = {
  title: "My clients",
};

export default function ProClientsPage() {
  return <ClientsView />;
}

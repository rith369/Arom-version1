import type { Metadata } from "next";
import { ProHome } from "./_components/pro-home";

export const metadata: Metadata = {
  title: "Professional area",
};

export default function ProHomePage() {
  return <ProHome />;
}

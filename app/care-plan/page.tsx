import type { Metadata } from "next";
import { UserCarePlan } from "../_components/care/user-care-plan";

export const metadata: Metadata = {
  title: "Care plan",
};

export default function CarePlanPage() {
  return <UserCarePlan />;
}

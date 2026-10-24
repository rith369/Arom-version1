import type { Metadata } from "next";
import { Suspense } from "react";
import { UpStudentView } from "../../_components/up-student/up-student-view";

export const metadata: Metadata = {
  title: "UP Student | AROM",
  description: "University of Puthisastra students verify their UP email for free UP support.",
};

export default function UpStudentPage() {
  return (
    <Suspense>
      <UpStudentView />
    </Suspense>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TwoWeekProgramView } from "../../../_components/two-week/two-week-program-view";
import { PROGRAMS, TWO_WEEK_PROGRAMS, isProgramId } from "../../../_components/two-week/two-week-data";

type ProgramPageProps = {
  params: Promise<{ program: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return TWO_WEEK_PROGRAMS.map((program) => ({ program }));
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { program } = await params;
  if (!isProgramId(program)) return {};
  return { title: PROGRAMS[program].name.en, description: PROGRAMS[program].description.en };
}

export default async function ProgramPage({ params }: ProgramPageProps) {
  const { program } = await params;
  if (!isProgramId(program)) notFound();
  return <TwoWeekProgramView programId={program} />;
}

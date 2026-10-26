"use client";

import { createContext, useContext, type ReactNode } from "react";

export type PickType = "lesson" | "tip" | "practice" | "program";

// When a professional browses MindGuide to give a care task, the normal
// MindGuide screens run in "choose" mode: no app sidebar, and "Add to plan"
// becomes "Choose for <client>". Users never see this (no provider).
type MindGuidePick = {
  clientName: string;
  choose: (type: PickType, id: string) => void;
  goTo: (type: PickType) => void;
  close: () => void;
};

const MindGuidePickContext = createContext<MindGuidePick | null>(null);

export function MindGuidePickProvider({ value, children }: { value: MindGuidePick; children: ReactNode }) {
  return <MindGuidePickContext.Provider value={value}>{children}</MindGuidePickContext.Provider>;
}

export function useMindGuidePick() {
  return useContext(MindGuidePickContext);
}

export function chooseLabel(clientName: string, km: boolean) {
  return km ? `ជ្រើសរើសសម្រាប់ ${clientName}` : `Choose for ${clientName}`;
}

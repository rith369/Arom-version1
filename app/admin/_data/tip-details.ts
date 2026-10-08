import {
  ALL_TIPS,
  type TipItem,
  type TipStep,
} from '../../_components/tips/tips-data';

export type AdminTipStep = TipStep & {
  id: string;
};

export type AdminTipDetails = {
  sourceId: string;
  sourceCitation: string;
  kmSourceCitation: string;
  steps: AdminTipStep[];
  supportCallout: TipItem['supportCallout'];
};

export const initialTipDetails: AdminTipDetails[] = ALL_TIPS.map((tip) => ({
  sourceId: tip.id,
  sourceCitation: tip.sourceCitation,
  kmSourceCitation: tip.kmSourceCitation,
  steps: tip.steps.map((step, index) => ({
    ...structuredClone(step),
    id: `${tip.id}-step-${index + 1}`,
  })),
  supportCallout: structuredClone(tip.supportCallout),
}));

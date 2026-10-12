import { ALL_PRACTICES } from '../../_components/practice/practice-data';

export type PracticeInstruction = {
  id: string;
  title: string;
  kmTitle: string;
  body: string;
  kmBody: string;
};

export type AdminPracticeDetails = {
  sourceId: string;
  instructions: PracticeInstruction[];
  breathing: {
    enabled: boolean;
    inhaleSeconds: number;
    holdSeconds: number;
    exhaleSeconds: number;
    cycles: number;
  };
};

export const initialPracticeDetails: AdminPracticeDetails[] = ALL_PRACTICES.map(
  (practice) => ({
    sourceId: practice.id,

    // Instructions will be entered explicitly by an admin.
    instructions: [],

    breathing: {
      enabled: practice.id === 'interactive-breathing',
      inhaleSeconds: 4,
      holdSeconds: 0,
      exhaleSeconds: 4,
      cycles: 5,
    },
  }),
);

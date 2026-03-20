export type MilestoneType = 'streak' | 'apps15' | 'apps30' | 'apps50' | 'apps70' | 'apps100';

export type TutorialStep = 'welcome' | 'addButton' | 'pipeline' | 'completed';

export interface TutorialState {
  welcomeCompleted: boolean;
  addAppStepCompleted: boolean;
  pipelineStepCompleted: boolean;
  milestonesShown: number[];
  lastStreakToastDate: string;
}

export interface TutorialContextValue {
  isNewUser: boolean;
  currentStep: TutorialStep;
  isTutorialActive: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  showMilestoneToast: (type: MilestoneType, value?: number) => void;
}

export const MILESTONE_VALUES: Record<Exclude<MilestoneType, 'streak'>, number> = {
  apps15: 15,
  apps30: 30,
  apps50: 50,
  apps70: 70,
  apps100: 100,
};

export const DEFAULT_TUTORIAL_STATE: TutorialState = {
  welcomeCompleted: false,
  addAppStepCompleted: false,
  pipelineStepCompleted: false,
  milestonesShown: [],
  lastStreakToastDate: '',
};

export const TUTORIAL_STEPS: TutorialStep[] = ['welcome', 'addButton', 'pipeline', 'completed'];
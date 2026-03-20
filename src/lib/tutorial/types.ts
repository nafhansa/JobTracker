export type TutorialStep = 'welcome' | 'addButton' | 'pipeline' | 'completed';

export interface TutorialState {
  welcomeCompleted: boolean;
  addAppStepCompleted: boolean;
  pipelineStepCompleted: boolean;
}

export interface TutorialContextValue {
  isNewUser: boolean;
  currentStep: TutorialStep;
  isTutorialActive: boolean;
  startTutorial: () => void;
  nextStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
}

export const DEFAULT_TUTORIAL_STATE: TutorialState = {
  welcomeCompleted: false,
  addAppStepCompleted: false,
  pipelineStepCompleted: false,
};

export const TUTORIAL_STEPS: TutorialStep[] = ['welcome', 'addButton', 'pipeline', 'completed'];
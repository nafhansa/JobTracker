"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { User } from "firebase/auth";
import {
  TutorialState,
  TutorialContextValue,
  TutorialStep,
  DEFAULT_TUTORIAL_STATE,
} from "./types";

const TutorialContext = createContext<TutorialContextValue | null>(null);

const STORAGE_KEY = (userId: string) => `jobtracker_tutorial_${userId}`;

interface TutorialProviderProps {
  children: ReactNode;
  user: User | null;
  jobCount: number;
  onTutorialComplete?: () => void;
}

export function TutorialProvider({ children, user, jobCount, onTutorialComplete }: TutorialProviderProps) {
  const [state, setState] = useState<TutorialState>(DEFAULT_TUTORIAL_STATE);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isNewUser = useMemo(() => {
    if (!user) return false;
    return jobCount === 0;
  }, [user, jobCount]);

  useEffect(() => {
    if (user?.uid && mounted) {
      const stored = localStorage.getItem(STORAGE_KEY(user.uid));
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as TutorialState;
          setState(parsed);
          
          if (!parsed.welcomeCompleted) {
            setIsTutorialActive(true);
          }
        } catch {
          setState(DEFAULT_TUTORIAL_STATE);
        }
      } else if (isNewUser) {
        setIsTutorialActive(true);
      }
    }
  }, [user?.uid, mounted, isNewUser]);

  const saveState = useCallback((newState: TutorialState) => {
    if (user?.uid) {
      localStorage.setItem(STORAGE_KEY(user.uid), JSON.stringify(newState));
      setState(newState);
    }
  }, [user?.uid]);

  const currentStep: TutorialStep = useMemo(() => {
    if (state.welcomeCompleted && state.addAppStepCompleted && state.pipelineStepCompleted) {
      return 'completed';
    }
    if (state.welcomeCompleted && state.addAppStepCompleted) {
      return 'pipeline';
    }
    if (state.welcomeCompleted) {
      return 'addButton';
    }
    return 'welcome';
  }, [state]);

  const startTutorial = useCallback(() => {
    setIsTutorialActive(true);
  }, []);

  const nextStep = useCallback(() => {
    const newState: TutorialState = { ...state };

    if (currentStep === 'welcome') {
      newState.welcomeCompleted = true;
    } else if (currentStep === 'addButton') {
      newState.addAppStepCompleted = true;
    } else if (currentStep === 'pipeline') {
      newState.pipelineStepCompleted = true;
      setIsTutorialActive(false);
      onTutorialComplete?.();
    }

    saveState(newState);
  }, [currentStep, state, saveState, onTutorialComplete]);

  const skipTutorial = useCallback(() => {
    const newState: TutorialState = {
      ...state,
      welcomeCompleted: true,
      addAppStepCompleted: true,
      pipelineStepCompleted: true,
    };
    saveState(newState);
    setIsTutorialActive(false);
  }, [state, saveState]);

  const completeTutorial = useCallback(() => {
    const newState: TutorialState = {
      ...state,
      welcomeCompleted: true,
      addAppStepCompleted: true,
      pipelineStepCompleted: true,
    };
    saveState(newState);
    setIsTutorialActive(false);
    onTutorialComplete?.();
  }, [state, saveState, onTutorialComplete]);

  const contextValue: TutorialContextValue = useMemo(() => ({
    isNewUser,
    currentStep,
    isTutorialActive,
    startTutorial,
    nextStep,
    skipTutorial,
    completeTutorial,
  }), [isNewUser, currentStep, isTutorialActive, startTutorial, nextStep, skipTutorial, completeTutorial]);

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial(): TutorialContextValue {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within TutorialProvider");
  }
  return context;
}

export function clearTutorialState(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY(userId));
  }
}
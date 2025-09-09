import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
// FIX: Corrected the import path for types to point to the correct module.
import { AchievementId } from '../types/index';
import { LEVELS, LevelInfo } from '../config/gamification';

interface GamificationState {
  xp: number;
  level: number;
  unlockedAchievements: Set<AchievementId>;
  lastLoginDate: string | null;
}

interface GamificationContextType {
  state: GamificationState;
  addXp: (amount: number) => void;
  unlockAchievement: (id: AchievementId) => void;
  levelInfo: LevelInfo;
  levelUpNotification: LevelInfo | null;
  clearLevelUpNotification: () => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

const getLevelFromXp = (xp: number): number => {
  let currentLevel = 1;
  for (const level of LEVELS) {
    if (xp >= level.xpThreshold) {
      currentLevel = level.level;
    } else {
      break;
    }
  }
  return currentLevel;
};

export const GamificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GamificationState>(() => {
    try {
      const storedState = localStorage.getItem('gamificationState');
      if (storedState) {
        const parsed = JSON.parse(storedState);
        return {
          ...parsed,
          unlockedAchievements: new Set(parsed.unlockedAchievements || []),
        };
      }
    } catch (error) {
      console.error("Failed to load gamification state from localStorage", error);
    }
    return {
      xp: 0,
      level: 1,
      unlockedAchievements: new Set(),
      lastLoginDate: null,
    };
  });

  const [levelUpNotification, setLevelUpNotification] = useState<LevelInfo | null>(null);

  useEffect(() => {
    // Daily Login Bonus
    const today = new Date().toISOString().split('T')[0];
    if (state.lastLoginDate !== today) {
        console.log('Granting daily login bonus!');
        addXp(10, true); // Don't trigger achievement on login
        unlockAchievement('firstLogin');
        // TODO: Could add logic for login streaks here
        setState(prevState => ({...prevState, lastLoginDate: today}));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on app load

  useEffect(() => {
    const serializedState = {
      ...state,
      unlockedAchievements: Array.from(state.unlockedAchievements),
    };
    localStorage.setItem('gamificationState', JSON.stringify(serializedState));
  }, [state]);

  const addXp = useCallback((amount: number, silent: boolean = false) => {
    setState(prevState => {
      const newXp = prevState.xp + amount;
      const newLevel = getLevelFromXp(newXp);
      if (newLevel > prevState.level && !silent) {
        const newLevelInfo = LEVELS.find(l => l.level === newLevel);
        if (newLevelInfo) {
          setLevelUpNotification(newLevelInfo);
        }
      }
      return { ...prevState, xp: newXp, level: newLevel };
    });
  }, []);

  const unlockAchievement = useCallback((id: AchievementId) => {
    setState(prevState => {
      if (prevState.unlockedAchievements.has(id)) {
        return prevState;
      }
      const newAchievements = new Set(prevState.unlockedAchievements);
      newAchievements.add(id);
      return { ...prevState, unlockedAchievements: newAchievements };
    });
  }, []);
  
  const clearLevelUpNotification = () => {
    setLevelUpNotification(null);
  };

  const levelInfo = LEVELS.find(l => l.level === state.level) || LEVELS[0];

  return (
    <GamificationContext.Provider value={{ state, addXp, unlockAchievement, levelInfo, levelUpNotification, clearLevelUpNotification }}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
};
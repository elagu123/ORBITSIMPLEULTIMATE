import React from 'react';
// FIX: Corrected the import path for types to point to the correct module.
import { AchievementId } from '../types/index';
import { Sparkles, Users, Award, FileText, CalendarDays, CheckCircle, Trophy } from '../components/ui/Icons';

export interface LevelInfo {
  level: number;
  name: string;
  xpThreshold: number;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, name: 'Marketing Starter', xpThreshold: 0 },
  { level: 2, name: 'Content Creator', xpThreshold: 100 },
  { level: 3, name: 'Engagement Expert', xpThreshold: 250 },
  { level: 4, name: 'Growth Hacker', xpThreshold: 500 },
  { level: 5, name: 'Marketing Pro', xpThreshold: 1000 },
];

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: React.ElementType;
}

export const ACHIEVEMENTS: Record<AchievementId, Achievement> = {
  firstLogin: {
    id: 'firstLogin',
    name: 'First Step',
    description: 'Log in for the first time.',
    icon: Award,
  },
  firstContent: {
    id: 'firstContent',
    name: 'First Post',
    description: 'Generate your first piece of content with AI.',
    icon: FileText,
  },
  firstCustomer: {
    id: 'firstCustomer',
    name: 'Welcome Wagon',
    description: 'Add your first customer.',
    icon: Users,
  },
  firstSchedule: {
    id: 'firstSchedule',
    name: 'Planner',
    description: 'Schedule your first post on the calendar.',
    icon: CalendarDays,
  },
  firstTask: {
    id: 'firstTask',
    name: 'Task Master',
    description: 'Complete your first AI-suggested task.',
    icon: CheckCircle,
  },
  contentCreator: {
    id: 'contentCreator',
    name: 'Content Creator',
    description: 'Generate 5 pieces of content.',
    icon: Sparkles,
  },
  customerChampion: {
    id: 'customerChampion',
    name: 'Customer Champion',
    description: 'Manage 10 customers.',
    icon: Users,
  },
  plannerPro: {
    id: 'plannerPro',
    name: 'Planner Pro',
    description: 'Schedule 5 posts.',
    icon: CalendarDays,
  },
  busyBee: {
    id: 'busyBee',
    name: 'Busy Bee',
    description: 'Complete 10 tasks.',
    icon: Trophy,
  },
  loginStreak: {
    id: 'loginStreak',
    name: 'Consistent Commander',
    description: 'Log in for 3 consecutive days.',
    icon: Trophy,
  },
};
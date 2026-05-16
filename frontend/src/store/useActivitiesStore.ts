import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Activity {
  id: string;
  title: string;
  category: string;
  time: string;
  duration: string;
  durationMinutes: number; // For math
  date: string;
  notes?: string;
}

export interface ActiveSession {
  startTime: number; // timestamp
  title: string;
  category: string;
  isRunning: boolean;
  pausedTime: number; // Total seconds paused
  lastPauseTimestamp: number | null;
}

interface ActivitiesState {
  activities: Activity[];
  activeSession: ActiveSession | null;
  setActivities: (activities: Activity[]) => void;
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, activity: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  startSession: (title: string, category: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
}

// Dummy initial state to make the dashboard look good on first load
const initialActivities: Activity[] = [
  { id: '1', title: 'Internship Work', category: 'Work', time: '09:00 - 17:30', duration: '8h 30m', durationMinutes: 510, date: new Date().toISOString() },
  { id: '2', title: 'Gym Session', category: 'Health', time: '18:30 - 19:15', duration: '45m', durationMinutes: 45, date: new Date().toISOString() },
];

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set) => ({
      activities: initialActivities,
      activeSession: null,
      setActivities: (activities) => set({ activities }),
      addActivity: (activity) => 
        set((state) => ({ 
          activities: [activity, ...state.activities] 
        })),
      updateActivity: (id, updatedActivity) =>
        set((state) => ({
          activities: state.activities.map((a) => (a.id === id ? { ...a, ...updatedActivity } : a))
        })),
      deleteActivity: (id) => 
        set((state) => ({ 
          activities: state.activities.filter((a) => a.id !== id) 
        })),
      startSession: (title, category) => set({
        activeSession: {
          startTime: Date.now(),
          title,
          category,
          isRunning: true,
          pausedTime: 0,
          lastPauseTimestamp: null
        }
      }),
      pauseSession: () => set((state) => {
        if (!state.activeSession || !state.activeSession.isRunning) return state;
        return {
          activeSession: {
            ...state.activeSession,
            isRunning: false,
            lastPauseTimestamp: Date.now()
          }
        };
      }),
      resumeSession: () => set((state) => {
        if (!state.activeSession || state.activeSession.isRunning || !state.activeSession.lastPauseTimestamp) return state;
        const extraPaused = Math.floor((Date.now() - state.activeSession.lastPauseTimestamp) / 1000);
        return {
          activeSession: {
            ...state.activeSession,
            isRunning: true,
            pausedTime: state.activeSession.pausedTime + extraPaused,
            lastPauseTimestamp: null
          }
        };
      }),
      stopSession: () => set({ activeSession: null }),
    }),
    {
      name: 'dailytracker-activities',
    }
  )
);

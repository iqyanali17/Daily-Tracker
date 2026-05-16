// import apiClient from '../utils/apiClient';
import type { Activity } from '../store/useActivitiesStore';

const STORAGE_KEY = 'dailytracker-mock-db';

const getMockDb = (): Activity[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [
    { id: '1', title: 'Internship Work', category: 'Work', time: '09:00 - 17:30', duration: '8h 30m', durationMinutes: 510, date: new Date().toISOString() },
    { id: '2', title: 'Gym Session', category: 'Health', time: '18:30 - 19:15', duration: '45m', durationMinutes: 45, date: new Date().toISOString() },
  ];
};

const saveMockDb = (activities: Activity[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
};

export const activityService = {
  /**
   * Get all activities for the logged-in user
   */
  getAll: async (): Promise<Activity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockDb());
      }, 500);
    });
  },

  /**
   * Get activities by specific date
   */
  getByDate: async (date: string): Promise<Activity[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getMockDb();
        const filtered = db.filter(a => a.date.startsWith(date));
        resolve(filtered);
      }, 300);
    });
  },

  /**
   * Create a new activity
   */
  create: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newActivity = {
          ...activity,
          id: crypto.randomUUID()
        };
        const db = getMockDb();
        saveMockDb([newActivity, ...db]);
        resolve(newActivity);
      }, 400);
    });
  },

  /**
   * Update an activity
   */
  update: async (id: string, data: Partial<Activity>): Promise<Activity> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getMockDb();
        const index = db.findIndex(a => a.id === id);
        if (index === -1) throw new Error("Activity not found");
        
        const updated = { ...db[index], ...data };
        db[index] = updated;
        saveMockDb(db);
        resolve(updated);
      }, 300);
    });
  },

  /**
   * Delete an activity
   */
  delete: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const db = getMockDb();
        const filtered = db.filter(a => a.id !== id);
        saveMockDb(filtered);
        resolve();
      }, 300);
    });
  }
};

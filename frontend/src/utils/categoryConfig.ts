
import { Briefcase, Dumbbell, MonitorPlay, BookOpen, Clock, Activity, type ElementType } from 'lucide-react';

export const categoryConfig: Record<string, { icon: ElementType; color: string; bg: string; border: string; hex: string }> = {
  Work: { icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100/80', border: 'border-indigo-200', hex: '#4f46e5' },
  Health: { icon: Dumbbell, color: 'text-emerald-600', bg: 'bg-emerald-100/80', border: 'border-emerald-200', hex: '#10b981' },
  Entertainment: { icon: MonitorPlay, color: 'text-amber-600', bg: 'bg-amber-100/80', border: 'border-amber-200', hex: '#f59e0b' },
  Study: { icon: BookOpen, color: 'text-rose-600', bg: 'bg-rose-100/80', border: 'border-rose-200', hex: '#e11d48' },
  Sleep: { icon: Clock, color: 'text-slate-600', bg: 'bg-slate-100/80', border: 'border-slate-200', hex: '#475569' },
  Personal: { icon: Activity, color: 'text-pink-600', bg: 'bg-pink-100/80', border: 'border-pink-200', hex: '#db2777' },
};

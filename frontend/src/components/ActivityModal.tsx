
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Square, AlignLeft } from 'lucide-react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ShimmerButton } from './magicui/ShimmerButton';
import { useActivitiesStore } from '../store/useActivitiesStore';
import { activityService } from '../services/activityService';

import type { Activity } from '../store/useActivitiesStore';

export const ActivityModal = ({ 
  isOpen, 
  onClose, 
  activityToEdit,
  defaultDate
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  activityToEdit?: Activity | null;
  defaultDate?: string;
}) => {
  const { addActivity, updateActivity, activeSession, startSession, pauseSession, resumeSession, stopSession } = useActivitiesStore();
  const [isSaving, setIsSaving] = useState(false);

  const [tab, setTab] = useState<'manual' | 'stopwatch'>('manual');
  
  // Forms state
  const [title, setTitle] = useState(activityToEdit?.title || '');
  const [category, setCategory] = useState(activityToEdit?.category || 'Work');
  const [startTime, setStartTime] = useState(() => {
    if (activityToEdit?.time.includes(' - ')) {
      return activityToEdit.time.split(' - ')[0];
    }
    return '';
  });
  const [endTime, setEndTime] = useState(() => {
    if (activityToEdit?.time.includes(' - ')) {
      return activityToEdit.time.split(' - ')[1];
    }
    return '';
  });
  const [notes, setNotes] = useState(activityToEdit?.notes || '');
  
  // Stopwatch state (local for temporary use)
  const [isRunningLocal, setIsRunningLocal] = useState(false);
  const [elapsedLocal, setElapsedLocal] = useState(0);

  // Effect for local stopwatch
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunningLocal) {
      interval = setInterval(() => setElapsedLocal(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunningLocal]);

  // Effect for global session elapsed time
  const [elapsedGlobal, setElapsedGlobal] = useState(0);
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeSession && activeSession.isRunning) {
      const update = () => {
        const current = Math.floor((Date.now() - activeSession.startTime) / 1000) - activeSession.pausedTime;
        setElapsedGlobal(current);
      };
      update();
      interval = setInterval(update, 1000);
    } else if (activeSession && !activeSession.isRunning && activeSession.lastPauseTimestamp) {
      const current = Math.floor((activeSession.lastPauseTimestamp - activeSession.startTime) / 1000) - activeSession.pausedTime;
      setElapsedGlobal(current);
    }
    return () => clearInterval(interval);
  }, [activeSession]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSave = async () => {
    let finalDurationMin: number;
    let finalTimeStr: string;

    if (tab === 'manual') {
      if (!startTime || !endTime) {
        alert("Please enter both start and end times.");
        return;
      }
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      finalDurationMin = endMin >= startMin ? endMin - startMin : (24 * 60 - startMin) + endMin;
      
      finalTimeStr = `${startTime} - ${endTime}`;
    } else {
      // If we are stopping a global session
      if (activeSession) {
        finalDurationMin = Math.ceil(elapsedGlobal / 60);
        const start = new Date(activeSession.startTime);
        const now = new Date();
        finalTimeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        stopSession();
      } else {
        // Fallback to local stopwatch
        if (elapsedLocal === 0) {
          alert("Timer is at 0.");
          return;
        }
        finalDurationMin = Math.ceil(elapsedLocal / 60);
        const now = new Date();
        finalTimeStr = `Ended at ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      }
    }

    const h = Math.floor(finalDurationMin / 60);
    const m = finalDurationMin % 60;
    const durationStr = h > 0 ? `${h}h ${m}m` : `${m}m`;

    setIsSaving(true);
    try {
      const activityData = {
        title: title || 'Untitled Activity',
        category,
        time: finalTimeStr,
        duration: durationStr,
        durationMinutes: finalDurationMin,
        date: activityToEdit?.date || defaultDate || new Date().toISOString(),
        notes
      };

      if (activityToEdit) {
        const updated = await activityService.update(activityToEdit.id, activityData);
        updateActivity(activityToEdit.id, updated);
      } else {
        const newActivity = await activityService.create(activityData);
        addActivity(newActivity);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save activity', error);
      alert('Failed to save activity. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-[4px] z-[100]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto border border-gray-100 dark:border-gray-800 flex flex-col relative"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 relative z-10">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                  {activityToEdit ? 'Edit Activity' : 'Log Activity'}
                </h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                  <X size={20} className="text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
                </button>
              </div>

              {/* Body */}
              <div className="p-8 bg-[#FDFDFE] dark:bg-gray-900/50">
                {/* Tabs */}
                <div className="flex bg-gray-100/80 dark:bg-gray-800 p-1.5 rounded-[1.25rem] mb-6">
                  <button onClick={() => setTab('manual')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'manual' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Manual Entry</button>
                  <button onClick={() => setTab('stopwatch')} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${tab === 'stopwatch' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>Stopwatch</button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input label="Activity Title" placeholder="e.g. Code Review" value={title} onChange={e => setTitle(e.target.value)} />
                    <div className="flex flex-col gap-1.5 w-full">
                      <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white transition-all focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 cursor-pointer appearance-none"
                      >
                        <option value="Work">Work</option>
                        <option value="Health">Health</option>
                        <option value="Study">Study</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Sleep">Sleep</option>
                        <option value="Personal">Personal</option>
                      </select>
                    </div>
                  </div>

                  {tab === 'manual' ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-5">
                      <Input type="time" label="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                      <Input type="time" label="End Time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-50 dark:bg-gray-800/50 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-700 text-center shadow-inner relative overflow-hidden">
                      {activeSession ? (
                        <>
                          <div className="text-xs font-bold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-widest">Live Session: {activeSession.title}</div>
                          <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 font-mono">
                            {formatTime(elapsedGlobal)}
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            {!activeSession.isRunning ? (
                              <Button onClick={resumeSession} className="rounded-full bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 !px-8 shadow-md">
                                <Play size={18} fill="currentColor" /> Resume
                              </Button>
                            ) : (
                              <Button onClick={pauseSession} className="rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 !px-8">
                                <Square size={18} fill="currentColor" /> Pause
                              </Button>
                            )}
                            <Button variant="ghost" className="rounded-full font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={stopSession}>Discard</Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter mb-6 font-mono">
                            {formatTime(elapsedLocal)}
                          </div>
                          <div className="flex items-center justify-center gap-3">
                            {!isRunningLocal ? (
                              <Button onClick={() => setIsRunningLocal(true)} className="rounded-full bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 !px-8 shadow-md">
                                <Play size={18} fill="currentColor" /> Start Local
                              </Button>
                            ) : (
                              <Button onClick={() => setIsRunningLocal(false)} className="rounded-full bg-red-500 hover:bg-red-600 text-white !px-8 shadow-md">
                                <Square size={18} fill="currentColor" /> Pause
                              </Button>
                            )}
                            <Button 
                              className="rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold px-6"
                              onClick={() => startSession(title || 'Untitled', category)}
                            >
                              Go Live
                            </Button>
                            <Button variant="ghost" className="rounded-full font-bold text-gray-500" onClick={() => { setIsRunningLocal(false); setElapsedLocal(0); }}>Reset</Button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-1.5 w-full">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-1.5"><AlignLeft size={16} className="text-gray-400"/> Notes (Optional)</label>
                    <textarea 
                      rows={3} 
                      className="w-full rounded-[1rem] border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-900 dark:text-white transition-all placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/10 resize-none"
                      placeholder="What did you accomplish?"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3 relative z-10">
                <Button variant="ghost" onClick={onClose} disabled={isSaving} className="!px-6 rounded-xl font-bold dark:text-gray-400 dark:hover:bg-gray-800">Cancel</Button>
                <ShimmerButton onClick={handleSave} disabled={isSaving} className="!py-3 !px-8 text-sm !shadow-none">
                  {isSaving ? 'Saving...' : 'Save Activity'}
                </ShimmerButton>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

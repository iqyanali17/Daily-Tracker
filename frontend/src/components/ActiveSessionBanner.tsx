
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Clock, X } from 'lucide-react';
import { useActivitiesStore } from '../store/useActivitiesStore';
import { Button } from './ui/Button';

export const ActiveSessionBanner = () => {
  const { activeSession, pauseSession, resumeSession, stopSession } = useActivitiesStore();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (activeSession && activeSession.isRunning) {
      // Calculate initial elapsed
      const initial = Math.floor((Date.now() - activeSession.startTime) / 1000) - activeSession.pausedTime;
      setElapsed(initial);
      
      interval = setInterval(() => {
        const current = Math.floor((Date.now() - activeSession.startTime) / 1000) - activeSession.pausedTime;
        setElapsed(current);
      }, 1000);
    } else if (activeSession && !activeSession.isRunning && activeSession.lastPauseTimestamp) {
        const current = Math.floor((activeSession.lastPauseTimestamp - activeSession.startTime) / 1000) - activeSession.pausedTime;
        setElapsed(current);
    }
    
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-xl"
      >
        <div className="bg-gray-900 text-white rounded-[2rem] p-4 shadow-2xl flex items-center justify-between border border-white/10 backdrop-blur-xl">
          <div className="flex items-center gap-4 pl-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center animate-pulse">
              <Clock size={18} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 leading-none mb-1">Active: {activeSession.title}</p>
              <h4 className="text-xl font-black tracking-tighter tabular-nums leading-none">
                {formatTime(elapsed)}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!activeSession.isRunning ? (
              <Button 
                onClick={resumeSession}
                className="rounded-full bg-white text-gray-900 hover:bg-gray-100 p-2 h-10 w-10 flex items-center justify-center"
              >
                <Play size={16} fill="currentColor" />
              </Button>
            ) : (
              <Button 
                onClick={pauseSession}
                className="rounded-full bg-white/10 text-white hover:bg-white/20 p-2 h-10 w-10 flex items-center justify-center"
              >
                <Square size={14} fill="currentColor" />
              </Button>
            )}
            <Button 
              variant="ghost" 
              onClick={stopSession}
              className="rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 h-10 w-10 flex items-center justify-center"
            >
              <X size={18} />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

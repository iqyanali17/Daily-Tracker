
import { useState, useMemo, useEffect, type MouseEvent, type ElementType } from 'react';
import { motion, type Variants, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { useActivitiesStore } from '../store/useActivitiesStore';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { LogOut, Calendar as CalendarIcon, Clock, Plus, Activity, Sparkles, TrendingUp, ChevronLeft, ChevronRight, Edit3, Trash2 } from 'lucide-react';
import { Meteors } from '../components/magicui/Meteors';
import NumberTicker from '../components/magicui/NumberTicker';
import { ShimmerButton } from '../components/magicui/ShimmerButton';
import { SpotlightCard } from '../components/magicui/SpotlightCard';
import { ActivityModal } from '../components/ActivityModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ThemeToggle } from '../components/ThemeToggle';
import { authService } from '../services/authService';
import { activityService } from '../services/activityService';
import { categoryConfig } from '../utils/categoryConfig';
import type { Activity as ActivityType } from '../store/useActivitiesStore';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 20 
    } 
  }
};

export const HomePage = () => {
  const { user, logout } = useAuthStore();
  const { activities, setActivities, deleteActivity } = useActivitiesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityToEdit, setActivityToEdit] = useState<ActivityType | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<ActivityType | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const dateStr = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
        const data = await activityService.getByDate(dateStr);
        setActivities(data);
      } catch (error) {
        console.error('Failed to fetch activities', error);
      }
    };
    fetchActivities();
  }, [setActivities, selectedDate]);

  const handleLogout = async () => {
    await authService.logout();
    logout();
  };

  const handleDeleteClick = (activity: ActivityType, e: MouseEvent) => {
    e.stopPropagation();
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (activityToDelete) {
      try {
        await activityService.delete(activityToDelete.id);
        deleteActivity(activityToDelete.id);
        setIsDeleteModalOpen(false);
        setActivityToDelete(null);
      } catch (error) {
        console.error('Failed to delete activity', error);
      }
    }
  };

  const handleEdit = (activity: ActivityType, e: MouseEvent) => {
    e.stopPropagation();
    setActivityToEdit(activity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setActivityToEdit(null);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setSelectedDate(newDate);
  };

  const setMonth = (m: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(m);
    setSelectedDate(newDate);
    setIsMonthPickerOpen(false);
  };

  const setYear = (y: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(y);
    setSelectedDate(newDate);
    setIsYearPickerOpen(false);
  };

  // Dynamic computations for the Dashboard Overview
  const { totalHours, totalMinutes, topCategory } = useMemo(() => {
    const totalMin = activities.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const categoryCounts = activities.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.durationMinutes;
      return acc;
    }, {} as Record<string, number>);
    
    let topCat = 'None';
    let maxMin = 0;
    Object.entries(categoryCounts).forEach(([cat, mins]) => {
      if (mins > maxMin) {
        maxMin = mins;
        topCat = cat;
      }
    });

    return {
      totalHours: Math.floor(totalMin / 60),
      totalMinutes: totalMin % 60,
      topCategory: topCat
    };
  }, [activities]);

  const dateStrForModal = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-[#F5F5F9] dark:bg-[#030712] font-sans text-gray-800 dark:text-gray-100 pb-16 relative overflow-x-hidden selection:bg-purple-200">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-8 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto pointer-events-auto">
          <nav className="flex items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-500">
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg shadow-gray-900/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Sparkles size={18} className="text-pink-400" />
              </div>
              <div>
                <p className="text-[11px] font-black tracking-tighter text-gray-900 dark:text-white leading-none">DailyTracker</p>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 dark:text-gray-400 font-bold mt-1">Activity Tracking</p>
              </div>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <ThemeToggle />
              <Link to="/stats" className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors bg-gray-50/50 dark:bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-100/50 dark:border-gray-700/50 flex items-center gap-2">
                <TrendingUp size={14} className="text-purple-500" /> Stats
              </Link>
              <div className="hidden sm:block text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50">
                {user?.name || 'User'}
              </div>
              <Button variant="ghost" className="p-2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-950 hover:text-red-600 transition-all" onClick={handleLogout}>
                <LogOut size={16} />
              </Button>
            </div>
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-28 relative z-10">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Calendar & Quick Stats */}
          <div className="lg:col-span-4 space-y-8">
            
            <motion.div variants={itemVariants} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-white dark:border-gray-800 transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 dark:bg-purple-900/10 rounded-full blur-3xl -z-10"></div>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 flex items-center justify-center border border-purple-100/50 dark:border-purple-800/30 shadow-inner">
                    <CalendarIcon size={20} className="text-purple-600 dark:text-purple-400"/>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setIsMonthPickerOpen(!isMonthPickerOpen); setIsYearPickerOpen(false); }} className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                        {selectedDate.toLocaleString('default', { month: 'long' })}
                      </button>
                      <button onClick={() => { setIsYearPickerOpen(!isYearPickerOpen); setIsMonthPickerOpen(false); }} className="font-light text-xl text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 transition-colors">
                        {selectedDate.getFullYear()}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] mt-1.5">Selected Period</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-1">Today</button>
                  <button onClick={() => changeMonth(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><ChevronLeft size={18} /></button>
                  <button onClick={() => changeMonth(1)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><ChevronRight size={18} /></button>
                </div>
              </div>

              {/* Pickers Popups */}
              <AnimatePresence>
                {isMonthPickerOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute inset-x-8 top-32 bottom-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-[20] rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 overflow-y-auto grid grid-cols-2 gap-2">
                    {months.map((m, idx) => (
                      <button key={m} onClick={() => setMonth(idx)} className={`py-3 rounded-xl font-bold text-sm transition-all ${selectedDate.getMonth() === idx ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'}`}>
                        {m}
                      </button>
                    ))}
                  </motion.div>
                )}
                {isYearPickerOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute inset-x-8 top-32 bottom-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl z-[20] rounded-[2rem] p-6 shadow-xl border border-gray-100 dark:border-gray-800 overflow-y-auto grid grid-cols-3 gap-2">
                    {years.map((y) => (
                      <button key={y} onClick={() => setYear(y)} className={`py-3 rounded-xl font-bold text-sm transition-all ${selectedDate.getFullYear() === y ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'hover:bg-purple-50 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300'}`}>
                        {y}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-7 gap-y-6 gap-x-2 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={`${d}-${i}`} className="text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest">{d}</div>)}
                {[...Array(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate())].map((_, i) => {
                  const day = i + 1;
                  const isToday = day === new Date().getDate() && selectedDate.getMonth() === new Date().getMonth() && selectedDate.getFullYear() === new Date().getFullYear();
                  const isSelected = day === selectedDate.getDate();
                  return (
                    <div key={i} className="flex justify-center">
                      <div onClick={() => { const newDate = new Date(selectedDate); newDate.setDate(day); setSelectedDate(newDate); }} className={`h-9 w-9 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300 font-bold text-xs ${isSelected ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg scale-110 -rotate-3' : isToday ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 'hover:bg-purple-100/50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 text-gray-600 dark:text-gray-400'}`}>
                        {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-[#0A0D14] rounded-[2.5rem] p-8 shadow-2xl shadow-gray-900/20 text-white relative overflow-hidden border border-gray-800/50 group">
              <Meteors number={15} />
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-600/20 rounded-full blur-[50px] z-0 group-hover:bg-purple-500/30 transition-colors duration-700"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-gray-400 font-bold text-[11px] uppercase tracking-[0.2em]">Today's Yield</h3>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10"><Activity size={14} className="text-purple-300" /></div>
                </div>
                <div className="text-5xl font-black mb-8 tracking-tighter flex items-baseline gap-1">
                  <span>{totalHours}</span><span className="text-xl text-gray-500 font-medium mr-2">h</span>
                  <NumberTicker value={totalMinutes} className="text-white" /><span className="text-xl text-gray-500 font-medium">m</span>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 backdrop-blur-xl border border-white/[0.05]">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Logs</div>
                    <div className="font-bold text-xl"><NumberTicker value={activities.length} className="text-white" /></div>
                  </div>
                  <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 backdrop-blur-xl border border-white/[0.05]">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">Top Focus</div>
                    <div className="font-bold text-lg text-purple-300 mt-0.5">{topCategory}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Activities Timeline */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-purple-200 dark:shadow-none rotate-3">
                  <div className="text-center">
                    <p className="text-[10px] font-black uppercase leading-none mb-1 opacity-70">{selectedDate.toLocaleString('default', { month: 'short' })}</p>
                    <p className="text-2xl font-black leading-none">{selectedDate.getDate()}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Activity Timeline</h3>
                  <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    {activities.length} logs for this day
                  </p>
                </div>
              </div>
              <ShimmerButton onClick={() => setIsModalOpen(true)} className="!py-4 !px-8 text-sm group">
                <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform duration-300" /> Log Activity
              </ShimmerButton>
            </motion.div>

            <div className="space-y-6">
              {activities.length === 0 ? (
                <motion.div variants={itemVariants} className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-[2.5rem] p-16 border-2 border-dashed border-gray-100 dark:border-gray-800 text-center">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-gray-700">
                    <CalendarIcon size={24} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No activities logged yet</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Time to start your day! Click the button above to log your first activity.</p>
                </motion.div>
              ) : (
                activities.map((activity, index) => {
                  const config = categoryConfig[activity.category] || categoryConfig.Work;
                  const Icon = config.icon;
                  return (
                    <motion.div 
                      key={activity.id}
                      variants={itemVariants}
                      className="group relative flex gap-6 pb-10 last:pb-0"
                    >
                      {index !== activities.length - 1 && (
                        <div className="absolute left-6 top-12 bottom-0 w-[2px] bg-gray-100 dark:bg-gray-800 group-last:hidden"></div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-2xl ${config.bg} dark:bg-gray-800 flex items-center justify-center shrink-0 z-10 border-2 border-white dark:border-gray-900 shadow-sm transition-all group-hover:scale-110 group-hover:rotate-6`}>
                        <Icon size={20} className={config.color} />
                      </div>
                      
                      <SpotlightCard className="flex-1 bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl dark:hover:border-gray-700 transition-all group-hover:-translate-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${config.bg} ${config.color} border ${config.border} dark:border-opacity-20`}>
                                {activity.category}
                              </span>
                              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                                <Clock size={12}/> {activity.time}
                              </span>
                            </div>
                            <h4 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">{activity.title}</h4>
                            {activity.notes && (
                              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                "{activity.notes}"
                              </p>
                            )}
                          </div>
                          
                          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:border-l sm:border-gray-50 dark:sm:border-gray-800 sm:pl-6">
                            <div className="text-right">
                              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest leading-none mb-1">Duration</p>
                              <p className="text-lg font-black text-gray-900 dark:text-white leading-none">{activity.duration}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => handleEdit(activity, e)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                <Edit3 size={16} />
                              </button>
                              <button onClick={(e) => handleDeleteClick(activity, e)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/50">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </SpotlightCard>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Modals */}
      <ActivityModal 
        key={activityToEdit?.id || 'new-activity'}
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        activityToEdit={activityToEdit} 
        defaultDate={dateStrForModal}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={activityToDelete?.title || ''}
      />
    </div>
  );
};

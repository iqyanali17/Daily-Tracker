
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useActivitiesStore } from '../store/useActivitiesStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ArrowLeft, TrendingUp, Calendar, Clock, Activity as ActivityIcon, Sparkles, Zap, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SpotlightCard } from '../components/magicui/SpotlightCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { categoryConfig } from '../utils/categoryConfig';

export const StatsPage = () => {
  const { activities } = useActivitiesStore();

  // 1. Data for Bar Chart: Minutes per day (last 7 days)
  const barData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, minutes: 0 }));
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const dayIndex = date.getDay();
      data[dayIndex].minutes += activity.durationMinutes;
    });
    
    return data.map(item => ({ ...item, hours: parseFloat((item.minutes / 60).toFixed(1)) }));
  }, [activities]);

  // 2. Data for Pie Chart: Minutes per category
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    activities.forEach(activity => {
      categories[activity.category] = (categories[activity.category] || 0) + activity.durationMinutes;
    });
    
    return Object.entries(categories).map(([name, value]) => ({ 
      name, 
      value,
      color: categoryConfig[name]?.hex || '#8b5cf6'
    }));
  }, [activities]);

  const stats = useMemo(() => {
    const totalMin = activities.reduce((acc, curr) => acc + curr.durationMinutes, 0);
    const topCat = pieData.length > 0 ? [...pieData].sort((a, b) => b.value - a.value)[0] : null;
    
    // Insights logic
    const insights = [];
    if (totalMin > 0) {
      if (topCat) {
        insights.push({
          icon: Brain,
          text: `You spent ${Math.round(topCat.value / 60)}h on ${topCat.name} recently. This is your primary focus.`,
          color: 'text-indigo-500',
          bg: 'bg-indigo-50'
        });
      }
      
      const maxDay = [...barData].sort((a, b) => b.hours - a.hours)[0];
      if (maxDay.hours > 0) {
        insights.push({
          icon: Zap,
          text: `${maxDay.name} was your most productive day with ${maxDay.hours}h logged.`,
          color: 'text-amber-500',
          bg: 'bg-amber-50'
        });
      }

      const studyMin = activities.filter(a => a.category === 'Study').reduce((acc, curr) => acc + curr.durationMinutes, 0);
      if (studyMin > 120) {
          insights.push({
            icon: Sparkles,
            text: "Great job! You've maintained a solid study streak this week.",
            color: 'text-emerald-500',
            bg: 'bg-emerald-50'
          });
      }
    }

    return {
      totalHours: (totalMin / 60).toFixed(1),
      avgPerDay: activities.length > 0 ? (totalMin / 60 / 7).toFixed(1) : '0',
      totalLogs: activities.length,
      topCategory: topCat ? topCat.name : 'None',
      insights
    };
  }, [activities, pieData, barData]);

  return (
    <div className="min-h-screen bg-[#F5F5F9] dark:bg-[#030712] font-sans text-gray-800 dark:text-gray-100 pb-16 relative overflow-x-hidden selection:bg-purple-200">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 pointer-events-none">
        <nav className="max-w-7xl mx-auto flex items-center justify-between relative z-10 pointer-events-auto bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl px-6 py-4 rounded-[2rem] border border-white dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all duration-500">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors font-bold text-sm bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700">
              <ArrowLeft size={18} /> Back
            </Link>
            <Link 
              to="/" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <Sparkles size={16} className="text-pink-400" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black tracking-tighter text-gray-900 dark:text-white leading-none">DailyTracker</p>
              </div>
            </Link>
          </div>
          <h1 className="text-lg font-black text-gray-900 dark:text-white tracking-tight hidden md:block">Analytics Dashboard</h1>
          <div className="flex items-center gap-3">
             <ThemeToggle />
             <div className="w-10"></div>
          </div>
        </nav>
      </div>

      <main className="max-w-7xl mx-auto px-6 pt-28 relative z-10">
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Hours', value: stats.totalHours, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-100' },
            { label: 'Daily Avg (Hrs)', value: stats.avgPerDay, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Total Logs', value: stats.totalLogs, icon: ActivityIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Top Focus', value: stats.topCategory, icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-100' },
          ].map((item, i) => (
            <SpotlightCard key={i} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white dark:border-gray-800 p-6 rounded-3xl shadow-sm">
              <div className={`w-12 h-12 ${item.bg} dark:bg-opacity-20 ${item.color} rounded-2xl flex items-center justify-center mb-4 border border-white/50 dark:border-gray-700/50 shadow-inner`}>
                <item.icon size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">{item.label}</p>
              <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{item.value}</h3>
            </SpotlightCard>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Weekly Activity Chart */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] shadow-sm"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-500" /> Weekly Activity Distribution
              </h3>
              <div className="h-[350px] w-full min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Bar 
                      dataKey="hours" 
                      fill="#8b5cf6" 
                      radius={[8, 8, 0, 0]} 
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Insights Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#0A0D14] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group border border-gray-800"
            >
               <div className="absolute -right-10 -top-10 w-48 h-48 bg-purple-600/20 rounded-full blur-[50px] transition-colors duration-700"></div>
               <h3 className="text-xl font-black mb-6 flex items-center gap-2 relative z-10">
                 <Sparkles size={20} className="text-purple-400" /> Smart Insights
               </h3>
               <div className="space-y-4 relative z-10">
                 {stats.insights.length > 0 ? stats.insights.map((insight, i) => (
                   <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                     <div className={`w-10 h-10 rounded-xl ${insight.bg} ${insight.color} flex items-center justify-center shrink-0`}>
                       <insight.icon size={20} />
                     </div>
                     <p className="text-sm font-medium text-gray-300 leading-relaxed pt-1">
                       {insight.text}
                     </p>
                   </div>
                 )) : (
                   <div className="text-gray-500 text-sm font-medium italic">Log more activities to see personalized insights!</div>
                 )}
               </div>
            </motion.div>
          </div>

          {/* Category Breakdown */}
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-white dark:border-gray-800 p-8 rounded-[2.5rem] shadow-sm h-full"
            >
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-4">Category Focus</h3>
              <div className="h-[300px] w-full min-h-[300px] relative">
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                    />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 space-y-4">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-400">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{Math.round((item.value / parseFloat(stats.totalHours) / 60) * 100) || 0}%</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title }: DeleteConfirmModalProps) => {
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
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-md z-[200]"
          />
          
          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[201] p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden pointer-events-auto border border-white dark:border-gray-800 relative p-8 text-center"
            >
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center mx-auto mb-6 border border-red-100 dark:border-red-900/30 shadow-sm">
                <AlertCircle size={32} />
              </div>

              <h3 className="text-xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Delete Activity?</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                Are you sure you want to delete <span className="text-gray-900 dark:text-white font-bold">"{title}"</span>? This action cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <Button 
                  onClick={onConfirm}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-red-500/20 border-none transition-all active:scale-95"
                >
                  Delete Activity
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onClose}
                  className="w-full py-3.5 font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Keep it
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

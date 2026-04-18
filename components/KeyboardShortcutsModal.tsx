"use client";

import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { getShortcutDisplay, type KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts';
import { motion, AnimatePresence } from 'framer-motion';

interface KeyboardShortcutsModalProps {
  shortcuts: KeyboardShortcut[];
}

export default function KeyboardShortcutsModal({ shortcuts }: KeyboardShortcutsModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShowModal = () => setIsOpen(true);
    const handleCloseModal = () => setIsOpen(false);

    window.addEventListener('show-shortcuts-modal', handleShowModal);
    window.addEventListener('close-modal', handleCloseModal);

    return () => {
      window.removeEventListener('show-shortcuts-modal', handleShowModal);
      window.removeEventListener('close-modal', handleCloseModal);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    search: 'Search',
    map: 'Map Controls',
    general: 'General',
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
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90]"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-modal-title"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="glass-card border-white/10 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Keyboard size={24} className="text-primary" aria-hidden="true" />
                  </div>
                  <h2 
                    id="shortcuts-modal-title"
                    className="text-2xl font-black tracking-tight"
                  >
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Close keyboard shortcuts modal"
                >
                  <X size={24} aria-hidden="true" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-8">
                {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                  <div key={category}>
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 opacity-50">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="space-y-3">
                      {categoryShortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <span className="text-sm font-medium">
                            {shortcut.description}
                          </span>
                          <kbd className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-mono font-bold text-primary">
                            {getShortcutDisplay(shortcut)}
                          </kbd>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-text-muted text-center">
                  Press <kbd className="px-2 py-1 bg-surface border border-border rounded text-primary font-mono">Shift + ?</kbd> to toggle this help
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Keyboard Shortcuts Hook
 * Provides global keyboard shortcuts for the application
 */

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  category: 'navigation' | 'search' | 'map' | 'general';
}

/**
 * Check if the event target is an input element where shortcuts should be disabled
 */
function isInputElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  
  const tagName = element.tagName.toLowerCase();
  const isContentEditable = element.isContentEditable;
  
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isContentEditable
  );
}

/**
 * Check if the shortcut matches the keyboard event
 */
function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const key = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();
  
  if (key !== shortcutKey) return false;
  
  if (shortcut.ctrl && !event.ctrlKey) return false;
  if (shortcut.meta && !event.metaKey) return false;
  if (shortcut.shift && !event.shiftKey) return false;
  if (shortcut.alt && !event.altKey) return false;
  
  // If shortcut doesn't require modifiers, ensure no modifiers are pressed
  if (!shortcut.ctrl && !shortcut.meta && !shortcut.shift && !shortcut.alt) {
    if (event.ctrlKey || event.metaKey || event.altKey) return false;
  }
  
  return true;
}

/**
 * Hook to register global keyboard shortcuts
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    if (isInputElement(event.target)) {
      return;
    }
    
    for (const shortcut of shortcuts) {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Default keyboard shortcuts for the application
 */
export function useDefaultKeyboardShortcuts() {
  const router = useRouter();
  
  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'm',
      ctrl: true,
      description: 'Go to Map',
      category: 'navigation',
      action: () => router.push('/map'),
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Go to Home',
      category: 'navigation',
      action: () => router.push('/main'),
    },
    {
      key: 's',
      ctrl: true,
      description: 'Go to Services',
      category: 'navigation',
      action: () => router.push('/services'),
    },
    {
      key: 'p',
      ctrl: true,
      description: 'Go to Profile',
      category: 'navigation',
      action: () => router.push('/profile'),
    },
    {
      key: 'o',
      ctrl: true,
      description: 'Go to Operations',
      category: 'navigation',
      action: () => router.push('/ops'),
    },
    // Search shortcut
    {
      key: '/',
      description: 'Focus Search',
      category: 'search',
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="Search"]');
        if (searchInput) {
          searchInput.focus();
        }
      },
    },
    // Help shortcut
    {
      key: '?',
      shift: true,
      description: 'Show Keyboard Shortcuts',
      category: 'general',
      action: () => {
        const event = new CustomEvent('show-shortcuts-modal');
        window.dispatchEvent(event);
      },
    },
    // Escape to close modals
    {
      key: 'Escape',
      description: 'Close Modal/Dialog',
      category: 'general',
      action: () => {
        const event = new CustomEvent('close-modal');
        window.dispatchEvent(event);
      },
    },
  ];
  
  useKeyboardShortcuts(shortcuts);
  
  return shortcuts;
}

/**
 * Get keyboard shortcut display string
 */
export function getShortcutDisplay(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  
  // Detect OS for proper modifier key display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.meta) parts.push('⌘');
  if (shortcut.shift) parts.push('⇧');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  
  parts.push(shortcut.key.toUpperCase());
  
  return parts.join(' + ');
}

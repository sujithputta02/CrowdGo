"use client";

import { useDefaultKeyboardShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

export default function KeyboardShortcutsWrapper() {
  const shortcuts = useDefaultKeyboardShortcuts();

  return <KeyboardShortcutsModal shortcuts={shortcuts} />;
}

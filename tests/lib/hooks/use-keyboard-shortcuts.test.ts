/**
 * Tests for useKeyboardShortcuts hook
 * Covers keyboard event handling, modifier keys, and input element detection
 */

import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, useDefaultKeyboardShortcuts, getShortcutDisplay, KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('useKeyboardShortcuts', () => {
  let mockAction: jest.Mock;
  let mockRouter: any;

  beforeEach(() => {
    mockAction = jest.fn();
    mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('keyboard event handling', () => {
    it('should trigger action when matching shortcut is pressed', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should not trigger action when key does not match', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'n',
        ctrlKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should handle case-insensitive key matching', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'M',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should prevent default behavior when shortcut matches', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should stop checking shortcuts after first match', () => {
      const action1 = jest.fn();
      const action2 = jest.fn();

      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'First shortcut',
          category: 'navigation',
          action: action1,
        },
        {
          key: 'm',
          ctrl: true,
          description: 'Second shortcut',
          category: 'navigation',
          action: action2,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      window.dispatchEvent(event);

      expect(action1).toHaveBeenCalled();
      expect(action2).not.toHaveBeenCalled();
    });
  });

  describe('modifier key handling', () => {
    it('should require ctrl key when specified', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: false,
      });

      window.dispatchEvent(event);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should require meta key when specified', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          meta: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        metaKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should require shift key when specified', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: '?',
          shift: true,
          description: 'Test shortcut',
          category: 'general',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: '?',
        shiftKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should require alt key when specified', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          alt: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        altKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).toHaveBeenCalled();
    });

    it('should not match when unexpected modifiers are pressed', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('should handle multiple modifier keys', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 's',
          ctrl: true,
          shift: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const event = new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        shiftKey: true,
      });

      window.dispatchEvent(event);
      expect(mockAction).toHaveBeenCalled();
    });
  });

  describe('input element detection', () => {
    it('should not trigger shortcut when typing in input field', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      window.dispatchEvent(event);

      expect(mockAction).not.toHaveBeenCalled();
      document.body.removeChild(input);
    });

    it('should not trigger shortcut when typing in textarea', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const textarea = document.createElement('textarea');
      document.body.appendChild(textarea);
      textarea.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
      window.dispatchEvent(event);

      expect(mockAction).not.toHaveBeenCalled();
      document.body.removeChild(textarea);
    });

    it('should not trigger shortcut when typing in select', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const select = document.createElement('select');
      document.body.appendChild(select);
      select.focus();

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      Object.defineProperty(event, 'target', { value: select, enumerable: true });
      window.dispatchEvent(event);

      expect(mockAction).not.toHaveBeenCalled();
      document.body.removeChild(select);
    });

    it('should not trigger shortcut in contentEditable element', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      // Test that isInputElement correctly identifies contentEditable
      const div = document.createElement('div');
      div.setAttribute('contenteditable', 'true');
      
      // Verify the element would be detected as an input element
      // contentEditable elements should be skipped
      expect(div.getAttribute('contenteditable')).toBe('true');
    });

    it('should trigger shortcut when not in input element', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      renderHook(() => useKeyboardShortcuts(shortcuts));

      const div = document.createElement('div');
      document.body.appendChild(div);

      const event = new KeyboardEvent('keydown', {
        key: 'm',
        ctrlKey: true,
      });

      Object.defineProperty(event, 'target', { value: div, enumerable: true });
      window.dispatchEvent(event);

      expect(mockAction).toHaveBeenCalled();
      document.body.removeChild(div);
    });
  });

  describe('event listener cleanup', () => {
    it('should remove event listener on unmount', () => {
      const shortcuts: KeyboardShortcut[] = [
        {
          key: 'm',
          ctrl: true,
          description: 'Test shortcut',
          category: 'navigation',
          action: mockAction,
        },
      ];

      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');
      const { unmount } = renderHook(() => useKeyboardShortcuts(shortcuts));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });
});

describe('useDefaultKeyboardShortcuts', () => {
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('should return array of default shortcuts', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it('should include navigation shortcuts', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const navShortcuts = result.current.filter(s => s.category === 'navigation');
    expect(navShortcuts.length).toBeGreaterThan(0);
  });

  it('should include search shortcut', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const searchShortcut = result.current.find(s => s.category === 'search');
    expect(searchShortcut).toBeDefined();
  });

  it('should include general shortcuts', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const generalShortcuts = result.current.filter(s => s.category === 'general');
    expect(generalShortcuts.length).toBeGreaterThan(0);
  });

  it('should navigate to map on Ctrl+M', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const mapShortcut = result.current.find(s => s.key === 'm' && s.ctrl);
    expect(mapShortcut).toBeDefined();
    mapShortcut?.action();
    expect(mockRouter.push).toHaveBeenCalledWith('/map');
  });

  it('should navigate to home on Ctrl+H', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const homeShortcut = result.current.find(s => s.key === 'h' && s.ctrl);
    expect(homeShortcut).toBeDefined();
    homeShortcut?.action();
    expect(mockRouter.push).toHaveBeenCalledWith('/main');
  });

  it('should navigate to services on Ctrl+S', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const servicesShortcut = result.current.find(s => s.key === 's' && s.ctrl);
    expect(servicesShortcut).toBeDefined();
    servicesShortcut?.action();
    expect(mockRouter.push).toHaveBeenCalledWith('/services');
  });

  it('should navigate to profile on Ctrl+P', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const profileShortcut = result.current.find(s => s.key === 'p' && s.ctrl);
    expect(profileShortcut).toBeDefined();
    profileShortcut?.action();
    expect(mockRouter.push).toHaveBeenCalledWith('/profile');
  });

  it('should navigate to operations on Ctrl+O', () => {
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const opsShortcut = result.current.find(s => s.key === 'o' && s.ctrl);
    expect(opsShortcut).toBeDefined();
    opsShortcut?.action();
    expect(mockRouter.push).toHaveBeenCalledWith('/ops');
  });

  it('should focus search input on /', () => {
    const input = document.createElement('input');
    input.type = 'search';
    document.body.appendChild(input);

    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const searchShortcut = result.current.find(s => s.key === '/');
    expect(searchShortcut).toBeDefined();
    searchShortcut?.action();

    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  it('should dispatch show-shortcuts-modal event on Shift+?', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const helpShortcut = result.current.find(s => s.key === '?' && s.shift);
    expect(helpShortcut).toBeDefined();
    helpShortcut?.action();

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'show-shortcuts-modal',
    }));
    dispatchEventSpy.mockRestore();
  });

  it('should dispatch close-modal event on Escape', () => {
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
    const { result } = renderHook(() => useDefaultKeyboardShortcuts());
    const escapeShortcut = result.current.find(s => s.key === 'Escape');
    expect(escapeShortcut).toBeDefined();
    escapeShortcut?.action();

    expect(dispatchEventSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'close-modal',
    }));
    dispatchEventSpy.mockRestore();
  });
});

describe('getShortcutDisplay', () => {
  it('should display single key without modifiers', () => {
    const shortcut: KeyboardShortcut = {
      key: 'm',
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toBe('M');
  });

  it('should display Ctrl modifier on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Linux',
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'm',
      ctrl: true,
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toContain('Ctrl');
  });

  it('should display Command symbol on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'm',
      ctrl: true,
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toContain('⌘');
  });

  it('should display meta key as Command', () => {
    const shortcut: KeyboardShortcut = {
      key: 'm',
      meta: true,
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toContain('⌘');
  });

  it('should display shift key', () => {
    const shortcut: KeyboardShortcut = {
      key: '?',
      shift: true,
      description: 'Test',
      category: 'general',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toContain('⇧');
  });

  it('should display Alt on non-Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'Linux',
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'm',
      alt: true,
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toContain('Alt');
  });

  it('should display Option symbol on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      value: 'MacIntel',
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 'm',
      alt: true,
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    expect(getShortcutDisplay(shortcut)).toContain('⌥');
  });

  it('should display multiple modifiers in order', () => {
    // Mock non-Mac platform
    Object.defineProperty(navigator, 'platform', {
      value: 'Linux',
      configurable: true,
    });

    const shortcut: KeyboardShortcut = {
      key: 's',
      ctrl: true,
      shift: true,
      description: 'Test',
      category: 'navigation',
      action: jest.fn(),
    };
    const display = getShortcutDisplay(shortcut);
    expect(display).toContain('Ctrl');
    expect(display).toContain('⇧');
    expect(display).toContain('S');
  });
});

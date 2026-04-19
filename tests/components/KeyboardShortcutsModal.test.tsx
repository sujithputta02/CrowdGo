/**
 * Tests for KeyboardShortcutsModal component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import { KeyboardShortcut } from '@/lib/hooks/use-keyboard-shortcuts';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => (
      <div onClick={onClick} {...props}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock getShortcutDisplay
jest.mock('@/lib/hooks/use-keyboard-shortcuts', () => ({
  getShortcutDisplay: (shortcut: any) => {
    if (shortcut.key === 'Shift' && shortcut.code === '?') {
      return 'Shift + ?';
    }
    return shortcut.key;
  },
}));

describe('KeyboardShortcutsModal', () => {
  const mockShortcuts: KeyboardShortcut[] = [
    {
      key: 'Shift',
      code: '?',
      description: 'Show keyboard shortcuts',
      category: 'general',
    },
    {
      key: 'ArrowUp',
      code: 'ArrowUp',
      description: 'Navigate up',
      category: 'navigation',
    },
    {
      key: 'ArrowDown',
      code: 'ArrowDown',
      description: 'Navigate down',
      category: 'navigation',
    },
  ];

  it('should not render modal when closed', () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should open modal when show-shortcuts-modal event is fired', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  it('should display keyboard shortcuts in modal', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Show keyboard shortcuts')).toBeInTheDocument();
      expect(screen.getByText('Navigate up')).toBeInTheDocument();
      expect(screen.getByText('Navigate down')).toBeInTheDocument();
    });
  });

  it('should close modal when close button is clicked', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('Close keyboard shortcuts modal');
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close modal when backdrop is clicked', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Find and click the backdrop
    const backdrop = screen.getByRole('dialog').parentElement?.querySelector('[aria-hidden="true"]');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close modal when close-modal event is fired', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const showEvent = new Event('show-shortcuts-modal');
    window.dispatchEvent(showEvent);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeEvent = new Event('close-modal');
    window.dispatchEvent(closeEvent);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should have proper ARIA attributes', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'shortcuts-modal-title');
    });
  });

  it('should have accessible title', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      const title = screen.getByText('Keyboard Shortcuts');
      expect(title).toHaveAttribute('id', 'shortcuts-modal-title');
    });
  });

  it('should group shortcuts by category', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByText('Navigation')).toBeInTheDocument();
      expect(screen.getByText('General')).toBeInTheDocument();
    });
  });

  it('should display shortcut keys', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      const shortcutElements = screen.getAllByText('Shift + ?');
      expect(shortcutElements.length).toBeGreaterThan(0);
      expect(screen.getByText('ArrowUp')).toBeInTheDocument();
      expect(screen.getByText('ArrowDown')).toBeInTheDocument();
    });
  });

  it('should prevent body scroll when modal is open', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });
  });

  it('should restore body scroll when modal is closed', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const showEvent = new Event('show-shortcuts-modal');
    window.dispatchEvent(showEvent);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('hidden');
    });

    const closeEvent = new Event('close-modal');
    window.dispatchEvent(closeEvent);

    await waitFor(() => {
      expect(document.body.style.overflow).toBe('');
    });
  });

  it('should have accessible close button', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      const closeButton = screen.getByLabelText('Close keyboard shortcuts modal');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveAttribute('aria-label');
    });
  });

  it('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('show-shortcuts-modal', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('close-modal', expect.any(Function));

    removeEventListenerSpy.mockRestore();
  });

  it('should handle empty shortcuts array', async () => {
    render(<KeyboardShortcutsModal shortcuts={[]} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
    });
  });

  it('should display help text with shortcut hint', async () => {
    render(<KeyboardShortcutsModal shortcuts={mockShortcuts} />);

    const event = new Event('show-shortcuts-modal');
    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByText(/Press.*to toggle this help/i)).toBeInTheDocument();
    });
  });
});

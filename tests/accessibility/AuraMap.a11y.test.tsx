/**
 * Accessibility tests for AuraMap component
 * Tests WCAG 2.1 compliance using jest-axe
 */

import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AuraMap from '@/components/AuraMap';

expect.extend(toHaveNoViolations);

// Mock Google Maps
jest.mock('@googlemaps/js-api-loader', () => ({
  setOptions: jest.fn(),
  importLibrary: jest.fn(),
}));

describe('AuraMap Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<AuraMap />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper ARIA role', () => {
    const { container } = render(<AuraMap />);
    const mapContainer = container.querySelector('[role="application"]');
    expect(mapContainer).toBeInTheDocument();
  });

  it('should have descriptive ARIA label', () => {
    const { container } = render(<AuraMap />);
    const mapContainer = container.querySelector('[role="application"]');
    expect(mapContainer).toHaveAttribute('aria-label', expect.stringContaining('Stadium Map'));
  });

  it('should have live region for updates', () => {
    const { container } = render(<AuraMap />);
    const liveRegion = container.querySelector('[role="status"][aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });

  it('should announce category changes to screen readers', () => {
    const { container, rerender } = render(<AuraMap activeCategory="all" />);
    const liveRegion = container.querySelector('[role="status"]');
    expect(liveRegion).toHaveTextContent('Showing all stadium points of interest');

    rerender(<AuraMap activeCategory="food" />);
    expect(liveRegion).toHaveTextContent('Filtering map by food');
  });
});

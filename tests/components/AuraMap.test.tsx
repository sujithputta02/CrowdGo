import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import AuraMap from '@/components/AuraMap';

// Mock Google Maps classes
const mockMap = {
  setOptions: jest.fn(),
  fitBounds: jest.fn(),
};

const mockMarker = {
  addListener: jest.fn(),
  map: null,
  auraCategory: '',
  setMap: jest.fn(),
};

const mockPinElement = jest.fn().mockImplementation(() => ({}));
const mockAdvancedMarkerElement = jest.fn().mockImplementation((options) => {
  const marker = { ...mockMarker, ...options };
  return marker;
});

const mockPlace = {
  searchNearby: jest.fn().mockResolvedValue({
    places: [
      {
        displayName: 'Test Restaurant',
        location: {
          lat: () => 18.9389,
          lng: () => 72.8258,
        },
        businessStatus: 'OPERATIONAL',
        types: ['restaurant'],
      },
      {
        displayName: 'Test Cafe',
        location: {
          lat: () => 18.9390,
          lng: () => 72.8259,
        },
        businessStatus: 'OPERATIONAL',
        types: ['cafe'],
      },
    ],
  }),
};

const mockPolyline = {
  setMap: jest.fn(),
};

const mockLatLngBounds = {
  extend: jest.fn(),
  getCenter: jest.fn().mockReturnValue({ lat: 18.9389, lng: 72.8258 }),
};

const mockLatLng = jest.fn().mockImplementation((lat, lng) => ({ lat, lng }));

// Mock Google Maps API
jest.mock('@googlemaps/js-api-loader', () => ({
  setOptions: jest.fn(),
  importLibrary: jest.fn().mockImplementation((library) => {
    if (library === 'maps') {
      return Promise.resolve({
        Map: jest.fn().mockImplementation(() => mockMap),
        InfoWindow: jest.fn(),
      });
    }
    if (library === 'marker') {
      return Promise.resolve({
        AdvancedMarkerElement: mockAdvancedMarkerElement,
        PinElement: mockPinElement,
      });
    }
    if (library === 'places') {
      return Promise.resolve({
        Place: mockPlace,
        SearchNearbyRequest: jest.fn(),
      });
    }
    if (library === 'geometry') {
      return Promise.resolve({});
    }
    return Promise.resolve({});
  }),
}));

jest.mock('@/lib/services/maps.service', () => ({
  MapsService: {
    WANKHEDE: { lat: 18.9389, lng: 72.8258 },
    getWalkRoute: jest.fn(),
  },
}));

// Mock window.google
(global as any).window = {
  google: {
    maps: {
      geometry: {
        encoding: {
          decodePath: jest.fn().mockReturnValue([
            { lat: 18.9389, lng: 72.8258 },
            { lat: 18.9390, lng: 72.8259 },
          ]),
        },
        spherical: {
          computeDistanceBetween: jest.fn().mockReturnValue(100), // 100 meters
        },
      },
      Polyline: jest.fn().mockImplementation(() => mockPolyline),
      LatLngBounds: jest.fn().mockImplementation(() => mockLatLngBounds),
      LatLng: mockLatLng,
    },
  },
  _AURA_MAP_INITIALIZED: false,
};

describe('AuraMap Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMap.fitBounds.mockClear();
    mockPolyline.setMap.mockClear();
    mockMarker.addListener.mockClear();
    mockPlace.searchNearby.mockClear();
    (global as any).window._AURA_MAP_INITIALIZED = false;
  });

  it('should render without crashing', () => {
    const { container } = render(<AuraMap />);
    expect(container).toBeInTheDocument();
  });

  it('should show loading state initially', () => {
    render(<AuraMap />);
    expect(screen.getByText(/Syncing Aura/i)).toBeInTheDocument();
  });

  it('should accept custom center prop', () => {
    const customCenter = { lat: 18.9400, lng: 72.8265 };
    const { container } = render(<AuraMap center={customCenter} />);
    expect(container).toBeInTheDocument();
  });

  it('should accept zoom level prop', () => {
    const { container } = render(<AuraMap zoom={15} />);
    expect(container).toBeInTheDocument();
  });

  it('should support different map types', () => {
    const { container } = render(<AuraMap mapType="satellite" />);
    expect(container).toBeInTheDocument();
  });

  it('should have accessibility attributes', () => {
    render(<AuraMap />);
    const mapContainer = screen.getByRole('application');
    expect(mapContainer).toHaveAttribute('aria-label', expect.stringContaining('Stadium Map'));
  });

  it('should announce category changes to screen readers', () => {
    const { rerender } = render(<AuraMap activeCategory="all" />);
    
    const liveRegion = screen.getByRole('status');
    expect(liveRegion).toHaveTextContent('Showing all stadium points of interest');
    
    rerender(<AuraMap activeCategory="food" />);
    expect(liveRegion).toHaveTextContent('Filtering map by food');
  });

  it('should accept polyline prop', () => {
    const { container } = render(<AuraMap polyline="encodedPolylineString" />);
    expect(container).toBeInTheDocument();
  });

  it('should accept onPoiClick callback', () => {
    const onPoiClick = jest.fn();
    const { container } = render(<AuraMap onPoiClick={onPoiClick} />);
    expect(container).toBeInTheDocument();
  });

  it('should accept isNightMode prop', () => {
    const { container } = render(<AuraMap isNightMode={true} />);
    expect(container).toBeInTheDocument();
  });

  it('should accept activeCategory prop', () => {
    const { container } = render(<AuraMap activeCategory="food" />);
    expect(container).toBeInTheDocument();
  });

  it('should handle category filter changes', () => {
    const { rerender } = render(<AuraMap activeCategory="all" />);
    expect(screen.getByRole('status')).toHaveTextContent('Showing all stadium points of interest');
    
    rerender(<AuraMap activeCategory="restroom" />);
    expect(screen.getByRole('status')).toHaveTextContent('Filtering map by restroom');
  });
});

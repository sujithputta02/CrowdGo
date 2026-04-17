export interface RouteStep {
  instruction: string;
  landmark?: string;
  distance: number; // in meters
}

export interface VenueRoute {
  destination: string;
  totalDistance: number;
  estimatedTime: number; // in minutes
  steps: RouteStep[];
}

export const GuidanceService = {
  getRouteToFacility: (facilityId: string, currentSection: string): VenueRoute => {
    // In a real app, this would use a graph of the venue layout.
    // For the demo, we simulate a simple route.
    return {
      destination: facilityId,
      totalDistance: 240,
      estimatedTime: 4,
      steps: [
        { instruction: "Exit Section " + currentSection + " via tunnel 4", landmark: "Wankhede Pavilion Store", distance: 40 },
        { instruction: "Turn right at the North Stand concourse", landmark: "Gate 1 Bar", distance: 120 },
        { instruction: "The destination is on your left", distance: 80 }
      ]
    };
  }
};

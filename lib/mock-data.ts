export const MOCK_VENUE_STATE = {
  activeMatch: {
    home: "Mumbai Indians",
    away: "Gujarat Titans",
    score: "0 - 0",
    time: "34'",
    nextBreak: "11:20",
    momentum: "high",
  },
  userTicket: {
    gate: "A",
    section: "104",
    row: "K",
    seat: "12",
  },
  services: [
    {
      id: "food-1",
      name: "Snack Hub C",
      type: "food",
      wait: 2,
      walk: 4,
      status: "optimal",
      reason: "7 mins faster than nearest",
      range: "1-3 mins",
    },
    {
      id: "rest-1",
      name: "North Terrace Restrooms",
      type: "restroom",
      wait: 0,
      walk: 2,
      status: "locked-in",
      reason: "No queue reported",
      range: "0-1 mins",
    },
    {
      id: "food-2",
      name: "Gourmet Goal",
      type: "food",
      wait: 12,
      walk: 6,
      status: "busy",
      reason: "Peak halftime demand",
      range: "10-15 mins",
    },
    {
      id: "drink-1",
      name: "The Taproom",
      type: "drink",
      wait: 5,
      walk: 3,
      status: "optimal",
      reason: "New counter opened",
      range: "4-6 mins",
    },
  ],
  notifications: [
    {
      id: "n-1",
      title: "Vibe Check",
      message: "Gate 1 ingress is clear. 0 min wait.",
      type: "info",
    }
  ],
  userSettings: {
    accessibility: {
      stepFree: false,
      highContrast: false,
      lowMotion: false,
    },
    language: "English",
    notifications: true,
  }
};

export type VenueState = typeof MOCK_VENUE_STATE;

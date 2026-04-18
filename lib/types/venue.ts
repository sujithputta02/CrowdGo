import { Location } from './common';
import { Notification } from './monitoring';

export interface VenueService {
  id: string;
  name: string;
  type: 'gate' | 'food' | 'restroom' | 'info';
  status: 'optimal' | 'locked-in' | 'busy';
  wait: number;
  walk: number;
  reason: string;
  range: string;
  location?: Location; // Made optional if we use predefined LOCATIONS
  capacity?: number;
  currentCount?: number;
}

export interface MatchState {
  home: string;
  away: string;
  score: string;
  time: string;
  nextBreak: string;
  nextSafeWindowIn: number;
  momentum: 'low' | 'medium' | 'high';
}

export interface VenueState {
  id: string;
  name: string;
  location: Location;
  services: VenueService[];
  totalCapacity: number;
  currentOccupancy: number;
  lastUpdated: number;
  activeMatch?: MatchState;
  notifications?: Notification[];
}

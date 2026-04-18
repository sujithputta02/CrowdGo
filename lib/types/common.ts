export interface Location {
  lat: number;
  lng: number;
}

export interface LocationBounds {
  northeast: Location;
  southwest: Location;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

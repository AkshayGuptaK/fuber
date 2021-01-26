export interface Coordinate {
  x: number;
  y: number;
}

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export type Preferences = Record<string, string | number | boolean>;

export const carTypes = ['auto', 'sedan', 'limo'] as const;

export interface Car {
  readonly type: typeof carTypes[number];
  licensePlate: string;
}

export interface Trip {
  origination: GeoCoordinate;
  destination: GeoCoordinate;
  timeBegun: number;
  timeCompleted: number;
  taxi: Car;
}

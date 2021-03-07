export type Coordinate = [number, number];

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export type Preferences<T extends string = string> = Record<
  T,
  string | number | boolean
>;

export const carTypes = ['auto', 'sedan', 'limo'] as const;

export interface Car {
  readonly type: typeof carTypes[number];
  licensePlate: string;
}

export interface Trip {
  origination: Coordinate;
  destination: Coordinate;
  timeBegun: number;
  timeCompleted: number | null;
  taxi: Car;
}

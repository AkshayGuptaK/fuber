export type Coordinate = [number, number];

export interface GeoCoordinate {
  latitude: number;
  longitude: number;
}

export type Preferences<T extends string = string> = Record<
  T,
  string | number | boolean
>;

export const carTypeCosts = {
  auto: 1,
  sedan: 2,
  limo: 3,
} as const;

export interface Car {
  readonly type: keyof typeof carTypeCosts;
  licensePlate: string;
}

export interface Trip {
  origination: Coordinate;
  destination: Coordinate;
  timeBegun: number;
  timeCompleted: number | null;
  taxi: Car;
}

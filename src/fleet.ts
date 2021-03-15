import autoBind from 'auto-bind';
import QuadTree from './quadtree';
import { GeoCoordinate, Preferences, Car, Coordinate, carTypes } from './types';

export default class Fleet {
  cars: QuadTree<Car>;

  constructor(size: number) {
    autoBind(this);
    this.cars = new QuadTree();
    this.loadInitialCars(size);
  }

  /**
   @param location - pick location with latitude and longitude
   @param preferences - what type of taxi is desired or specific license plate 
   @see carTypes for available taxi types
   @returns if taxi is found its details and where it currently is
   */
  findNearestTaxi(
    location: GeoCoordinate,
    preferences: Preferences<keyof Car>
  ): { taxi: Car; taxiLocation: GeoCoordinate } | null {
    const { latitude, longitude } = location;
    const filterFn = (car: Car | null): boolean => {
      if (car == null) return false;
      for (const [key, value] of Object.entries(preferences)) {
        if (car[key as keyof Car] !== value) return false;
      }
      return true;
    };
    const result = this.cars.removeNearest(latitude, longitude, filterFn);
    if (result == null) return null;
    const { coordinates, item } = result;
    return {
      taxiLocation: {
        latitude: coordinates[0],
        longitude: coordinates[1],
      },
      taxi: item!, // not null guaranteed by filterFn rejecting null cars
    };
  }

  add(location: Coordinate, taxi: Car): void {
    this.cars.add(location[0], location[1], taxi);
  }

  private loadInitialCars(numberOfCars: number) {
    for (let i = 0; i < numberOfCars; i++) {
      const latitude = Math.random() * 180 - 90;
      const longitude = Math.random() * 360 - 180;
      const type = carTypes[Math.floor(Math.random() * carTypes.length)];
      this.cars.add(latitude, longitude, {
        type: type,
        licensePlate: this.generateLicensePlate(),
      });
    }
  }

  private generateLicensePlate(): string {
    return Math.random().toString(36).slice(4).toUpperCase();
  }
}

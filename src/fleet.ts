import autoBind from 'auto-bind';
import QuadTree from './quadtree';
import { GeoCoordinate, Preferences, Car, carTypes } from './types';

export default class Fleet {
  cars: QuadTree<Car>;

  constructor(size: number) {
    autoBind(this);
    this.cars = new QuadTree();
    this.loadInitialCars(size);
  }

  findNearestTaxi(
    location: GeoCoordinate,
    preferences: Preferences
  ): { taxiLocation: GeoCoordinate; taxi: Car } {
    const { latitude, longitude } = location;
    const filterFn = (car: Car): boolean => {
      if (car == null) return false;
      for (const [key, value] of Object.entries(preferences)) {
        if (car[key] !== value) return false;
      }
      return true;
    };
    const result = this.cars.removeNearest(latitude, longitude, filterFn);
    if (result == null) return null;
    const { coordinates, item } = result;
    return {
      taxiLocation: {
        latitude: coordinates.x,
        longitude: coordinates.y,
      },
      taxi: item,
    };
  }

  add(location: GeoCoordinate, taxi: Car): void {
    const { latitude, longitude } = location;
    this.cars.add(latitude, longitude, taxi);
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

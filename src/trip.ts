import autoBind from 'auto-bind';
import { Car, Coordinate, Trip } from './types';
import { distanceBetween } from './utils';

const chargePerDegree = 1000;
const chargePerMs = 1;

export default class TripLog {
  private trips: Trip[] = [];

  constructor() {
    autoBind(this);
  }

  add(origination: Coordinate, destination: Coordinate, taxi: Car): number {
    this.trips.push({
      origination,
      destination,
      timeBegun: Date.now(),
      timeCompleted: null,
      taxi,
    });
    return this.trips.length;
  }

  complete(
    tripId: number
  ): { charge: number; destination: Coordinate; taxi: Car } | null {
    const trip = this.trips[tripId - 1];
    if (!trip) return null;
    if (trip.timeCompleted) return null;
    trip.timeCompleted = Date.now();
    const tripTime = trip.timeCompleted - trip.timeBegun;
    const tripDistance = distanceBetween(trip.origination, trip.destination);
    const charge = Math.floor(
      tripTime * chargePerMs + tripDistance * chargePerDegree // need to charge on car type basis
    );
    return { charge, destination: trip.destination, taxi: trip.taxi };
  }
}

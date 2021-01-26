import autoBind from 'auto-bind';
import { Car, GeoCoordinate, Trip } from './types';

const chargePerDegree = 1000;
const chargePerMs = 1;

export default class TripLog {
  private trips: Trip[] = [];

  constructor() {
    autoBind(this);
  }

  add(
    origination: GeoCoordinate,
    destination: GeoCoordinate,
    taxi: Car
  ): number {
    this.trips.push({
      origination,
      destination,
      timeBegun: Date.now(),
      timeCompleted: null,
      taxi,
    });
    return this.trips.length;
  }

  complete(tripId: number) {
    const trip = this.trips[tripId - 1];
    if (!trip) return null;
    if (trip.timeCompleted) return null;
    trip.timeCompleted = Date.now();
    const tripTime = trip.timeCompleted - trip.timeBegun;
    const tripDistance = Math.sqrt(
      (trip.destination.latitude - trip.origination.latitude) ** 2 +
        (trip.destination.longitude - trip.origination.longitude) ** 2
    );
    const charge = Math.floor(
      tripTime * chargePerMs + tripDistance * chargePerDegree
    );
    return { charge, destination: trip.destination, taxi: trip.taxi };
  }
}

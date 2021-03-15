import autoBind from 'auto-bind';
import { Car, carTypeCosts, Coordinate, Trip } from './types';
import { distanceBetween } from './utils';

const chargePerDegree = 1000;
const chargePerMs = 1;

export default class TripLog {
  private trips: Trip[] = [];

  constructor() {
    autoBind(this);
  }

  /**
   * @param origination - location where the trip began
   * @param destination - location where the trip ends
   * @param taxi - taxi assigned to the trip
   * @returns trip Id
   */
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

  /**
   * @param tripId - id of the trip completed, obtained from adding trip
   * @returns taxi details, trip destination, and the charge for the ride
   */
  complete(
    tripId: number
  ): { taxi: Car; destination: Coordinate; charge: number } | null {
    const trip = this.trips[tripId - 1];
    if (!trip) return null;
    if (trip.timeCompleted) return null;
    trip.timeCompleted = Date.now();
    const tripTime = trip.timeCompleted - trip.timeBegun;
    const tripDistance = distanceBetween(trip.origination, trip.destination);
    const charge = Math.floor(
      tripTime * chargePerMs +
        tripDistance * chargePerDegree * carTypeCosts[trip.taxi.type]
    );
    return { charge, destination: trip.destination, taxi: trip.taxi };
  }
}

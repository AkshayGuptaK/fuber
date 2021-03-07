import TripLog from './trip';
import { carTypes, Coordinate } from './types';

describe('Trip Log', () => {
  it('should return null when trying to complete nonexistent trip', () => {
    const tl = new TripLog();
    expect(tl.complete(1)).toBeNull();
  });

  it('should return null when trying to complete trip which is already completed', () => {
    const tl = new TripLog();
    const origination: Coordinate = [12.972442, 77.580643];
    const originalDestination: Coordinate = [37.871666, -122.272781];
    const originalTaxi = {
      type: carTypes[1],
      licensePlate: 'LUV2XLR8',
    };
    tl.add(origination, originalDestination, originalTaxi);
    tl.complete(1);
    expect(tl.complete(1)).toBeNull();
  });

  it('should return destination and taxi originally specified when trip completed', () => {
    const tl = new TripLog();
    const origination: Coordinate = [12.972442, 77.580643];
    const originalDestination: Coordinate = [37.871666, -122.272781];

    const originalTaxi = {
      type: carTypes[1],
      licensePlate: 'LUV2XLR8',
    };
    tl.add(origination, originalDestination, originalTaxi);
    const { destination, taxi } = tl.complete(1)!;
    expect(destination).toEqual(originalDestination);
    expect(taxi).toEqual(originalTaxi);
  });

  it('should return charge calculated according to trip distance and time', () => {
    const tl = new TripLog();
    const origination: Coordinate = [12.972442, 77.580643];
    const originalDestination: Coordinate = [37.871666, -122.272781];

    const originalTaxi = {
      type: carTypes[1],
      licensePlate: 'LUV2XLR8',
    };
    tl.add(origination, originalDestination, originalTaxi);
    const { charge } = tl.complete(1)!;
    expect(charge).toBeGreaterThan(200000);
  });
});

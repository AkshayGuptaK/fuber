import fastify from 'fastify';
import Fleet from './fleet';
import TripLog from './trip';
import { GeoCoordinate, Preferences } from './types';

const server = fastify({
  logger: true,
});

const fleet = new Fleet(100000);
const trips = new TripLog();

interface TripBody {
  location: GeoCoordinate;
  destination: GeoCoordinate;
  preferences: Preferences;
}

server.get('/', (request, reply) => {
  reply.send('Book with us today!');
});

server.post('/api/v1/trip', (request, reply) => {
  const { location, destination, preferences } = request.body as TripBody;
  const result = fleet.findNearestTaxi(location, preferences);
  if (result == null) reply.send('Sorry no cab available right now');
  else {
    const { taxiLocation, taxi } = result;
    const tripId = trips.add(location, destination, taxi);
    reply.send({
      tripId,
      licensePlate: taxi.licensePlate,
      location: taxiLocation,
    });
  }
});

server.put('/api/v1/trip/:tripId', (request, reply) => {
  if ((request.body as any).completed) {
    const result = trips.complete((request.params as any).tripId);
    if (result == null) reply.send('Trip not found');
    else {
      const { charge, destination, taxi } = result;
      fleet.add(destination, taxi);
      reply.send(`Please pay ${charge}`);
    }
  }
  reply.send('Book with us today!');
});

server.listen(3000, (err, address) => {
  if (err) {
    server.log.error(`there was an error: ${err}`);
    throw err;
  }
  server.log.info(`server listening on ${address}`);
});

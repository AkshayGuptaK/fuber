import fastify from 'fastify';

const server = fastify({
  logger: true,
});

server.get('/', (request, reply) => {
  reply.send('Book with us today!');
});

server.post('/api/v1/trip', (request, reply) => {
  reply.send('Book with us today!');
});

server.put('/api/v1/trip/:tripId', (request, reply) => {
  //   request.params.tripId;
  reply.send('Book with us today!');
});

server.listen(3000, (err, address) => {
  if (err) {
    server.log.error(`there was an error: ${err}`);
    throw err;
  }
  server.log.info(`server listening on ${address}`);
});

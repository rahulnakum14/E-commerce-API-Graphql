import Redis from 'ioredis';

const client = new Redis();

export default client;

// import { createClient } from 'redis';

// // Create Redis client
// const client = createClient({
//     url: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
// });

// client.on('error', (err) => {
//     console.error('Redis Client Error', err);
// });
// client.on('connect', () => {
//     console.log('Connected to Redis');
// });

// (async () => {
//     await client.connect();
// })();

// export default client;

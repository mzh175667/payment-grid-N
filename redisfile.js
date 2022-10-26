const redis = require('redis');

// REDIS CONNECTION
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisPassword = process.env.REDIS_PASSWORD;
const redisUser = process.env.REDIS_USER;

(async () => {
    const client = redis.createClient({
        url: `redis://${redisUser}:${redisPassword}@${redisHost}:${redisPort}`,
    });
    client.on('connect', function () {
        console.log('REDIS CONNECTED');
    });
    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    await client.set('key', 'newVal');
    const value = await client.get('key');
    console.log(value);
})();

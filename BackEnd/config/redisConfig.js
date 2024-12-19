
const redis = require('redis');

const client = redis.createClient({
    url : 'redis://default:@MyRedisDb01@redis-10934.c275.us-east-1-4.ec2.redns.redis-cloud.com:10934' 
});

client.on('connect' ,()=>{
    console.log('Connected to redis');
});

client.on('error', (err)=>{
    console.log('Redis error : ' , err);
});

//connect to redis
(async ()=>{
    await client.connect();
})();

module.exports = client;

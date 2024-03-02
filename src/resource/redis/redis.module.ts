import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        try {
          const redisClient = createClient({
            socket: {
              host: 'localhost',
              port: 6379,
            },
          });
          await redisClient.connect();
          return redisClient;
        } catch (error) {
          console.error(error);
        }
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService) {
        try {
          const redisClient = createClient({
            socket: {
              host: configService.get('redis_server_host'),
              port: configService.get('redis_server_port'),
            },
          });
          await redisClient.connect();
          return redisClient;
        } catch (error) {
          console.error(error);
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

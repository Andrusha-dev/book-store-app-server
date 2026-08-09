import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfigSchema } from './app-config.schema';



//Підключаємо схему валідації zod до модуля ConfigModule
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => appConfigSchema.parse(env),
      cache: true,
    })
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
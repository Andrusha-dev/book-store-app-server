import {
  Injectable,
  type OnModuleDestroy,
  type OnModuleInit,
} from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/app-config.schema';
import { PrismaClient } from '../../generated/prisma/client';





@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;

  constructor(
    private readonly logger: Logger,
    private readonly configService: ConfigService<AppConfig, true>
  ) {
    //Створюємо пул підключень нативного драйвера pg
    const pool = new Pool({
      connectionString: configService.get("DATABASE_URL", {infer: true}),
    });

    // Створюємо адаптер для Prisma 7
    const adapter = new PrismaPg(pool);

    // Передаємо адаптер у базовий клас PrismaClient
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    try {
      //Цей метод перевіряє чи працює адаптер Prisma
      await this.$connect();
      //Цей метод перевіряє фактичне підключення до бази даних через легкий sql запит
      await this.pool.query('SELECT 1');
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error({err: error as Error}, 'Database connection failed');
      throw error;
    }

  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      //Обов'язково очищуємо пул з'єднань в бд, щоб вони не накопичувались
      await this.pool.end();
      this.logger.log('Database disconnected');
    } catch (error) {
      this.logger.error({err: error as Error}, 'Database disconnection failed');
    }
  }
}
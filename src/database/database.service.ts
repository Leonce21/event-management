import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    const dbUrl = process.env.DATABASE_URL;

    console.log('🔍 DATABASE_URL:', dbUrl ? 'LOADED ✅' : '❌ MISSING');

    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    this.pool = new Pool({
      connectionString: dbUrl,
    });

    this.pool.on('connect', () => {
      this.logger.log('✅ PostgreSQL connected successfully');
    });

    this.pool.on('error', (err) => {
      this.logger.error('❌ PostgreSQL connection error', err);
    });
  }

  async onModuleInit() {
    await this.pool.query('SELECT 1');
    this.logger.log('📦 Database ready');
  }

  async onModuleDestroy() {
    await this.pool.end();
    this.logger.log('🔌 PostgreSQL disconnected');
  }

  query(text: string, params?: any[]) {
    return this.pool.query(text, params);
  }
}

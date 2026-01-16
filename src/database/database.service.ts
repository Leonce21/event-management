import { Injectable, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService {
  private static pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    if (!DatabaseService.pool) {
      const dbUrl = process.env.DATABASE_URL;

      if (!dbUrl) {
        throw new Error('DATABASE_URL not defined');
      }

      DatabaseService.pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost')
          ? false
          : { rejectUnauthorized: false },
        max: 5,
      });

      this.logger.log('✅ PostgreSQL pool initialized');
    }
  }

  query(text: string, params?: any[]) {
    return DatabaseService.pool.query(text, params);
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private readonly db: DatabaseService) {}

  async create(dto: CreateEventDto) {
    const result = await this.db.query(
      `INSERT INTO "Event" 
       (title, description, location, "startDate", "endDate", "isOnline", capacity)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        dto.title,
        dto.description,
        dto.location,
        dto.startDate,
        dto.endDate,
        dto.isOnline,
        dto.capacity,
      ],
    );
    return result.rows[0];
  }

  // events.service.ts (only the findAll method shown — replace the existing one)
  async findAll(page = 1, limit = 10, q?: string) {
    const safePage = Math.max(page, 1);
    const safeLimit = Math.min(Math.max(limit, 1), 100); // max 100
    const offset = (safePage - 1) * safeLimit;

    // Build WHERE clause and params safely
    const search = q?.trim();
    let whereClause = '';
    const params: any[] = [];

    if (search && search.length > 0) {
      // single param used for title, description, location (ILIKE)
      params.push(`%${search}%`);
      whereClause = `WHERE title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1`;
    }

    // Add limit and offset params after possible search param(s)
    const limitPlaceholder = `$${params.length + 1}`;
    const offsetPlaceholder = `$${params.length + 2}`;
    params.push(safeLimit, offset);

    // 1) Get paginated data
    const dataQuery = `
    SELECT *
    FROM "Event"
    ${whereClause}
    ORDER BY id DESC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
  `;
    const dataResult = await this.db.query(dataQuery, params);

    // 2) Get total count (apply same WHERE if present)
    const countParams = params.slice(0, params.length - 2); // only search param(s) if any
    const countQuery = `SELECT COUNT(*)::int AS total FROM "Event" ${whereClause}`;
    const countResult = await this.db.query(countQuery, countParams);

    const total = countResult.rows[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    return {
      data: dataResult.rows,
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages,
      },
    };
  }

  async findOne(id: number) {
    const result = await this.db.query('SELECT * FROM "Event" WHERE id = $1', [
      id,
    ]);
    return result.rows[0];
  }

  async update(id: number, dto: UpdateEventDto) {
    const result = await this.db.query(
      `UPDATE "Event" SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        location = COALESCE($3, location),
        "startDate" = COALESCE($4, "startDate"),
        "endDate" = COALESCE($5, "endDate"),
        "isOnline" = COALESCE($6, "isOnline"),
        capacity = COALESCE($7, capacity)
       WHERE id = $8
       RETURNING *`,
      [
        dto.title,
        dto.description,
        dto.location,
        dto.startDate,
        dto.endDate,
        dto.isOnline,
        dto.capacity,
        id,
      ],
    );
    return result.rows[0];
  }

  async delete(id: number) {
    await this.db.query('DELETE FROM "Event" WHERE id = $1', [id]);
    return { message: `Event ${id} deleted` };
  }
}

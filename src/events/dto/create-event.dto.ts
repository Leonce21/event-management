import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ example: 'NestJS Conference' })
  title: string;

  @ApiPropertyOptional({ example: 'A conference about NestJS' })
  description?: string;

  @ApiPropertyOptional({ example: 'Douala' })
  location?: string;

  @ApiProperty({ example: '2026-02-01T09:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ example: '2026-02-01T17:00:00.000Z' })
  endDate: Date;

  @ApiProperty({ example: false })
  isOnline: boolean;

  @ApiPropertyOptional({ example: 200 })
  capacity?: number;
}

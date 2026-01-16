import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EventsModule } from './events/events.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, EventsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

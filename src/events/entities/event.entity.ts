export class Event {
  id: number;
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  isOnline: boolean;
  capacity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

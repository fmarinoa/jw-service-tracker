import { Invitation } from '@/domain/Invitation';
import { User } from '@/domain/User';

export interface UserCreatedEvent {
  user: User;
  invitation?: Invitation | null;
}

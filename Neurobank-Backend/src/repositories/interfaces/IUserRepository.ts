import { User } from '../../types/User';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | undefined>;
  findByEmail(email: string): Promise<User | undefined>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | undefined>;
  delete(id: string): Promise<boolean>;
  save(users: User[]): Promise<void>;
}
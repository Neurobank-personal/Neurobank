import { Task } from '../../types/Task';

export interface ITaskRepository {
  findAll(): Promise<Task[]>;
  findById(id: string): Promise<Task | undefined>;
  findByUserId(userId: string): Promise<Task[]>;
  findByStatus(status: 'pending' | 'completed'): Promise<Task[]>;
  create(task: Task): Promise<Task>;
  update(id: string, task: Partial<Task>): Promise<Task | undefined>;
  delete(id: string): Promise<boolean>;
  save(tasks: Task[]): Promise<void>;
}
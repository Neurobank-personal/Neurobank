import { UserStatistics } from '../../types/Statistics';

export interface IStatisticsRepository {
  findAll(): Promise<UserStatistics[]>;
  findById(id: string): Promise<UserStatistics | undefined>;
  findByUserId(userId: string): Promise<UserStatistics | undefined>;
  create(userStats: UserStatistics): Promise<UserStatistics>;
  update(id: string, userStats: Partial<UserStatistics>): Promise<UserStatistics | undefined>;
  delete(id: string): Promise<boolean>;
  save(userStats: UserStatistics[]): Promise<void>;
}
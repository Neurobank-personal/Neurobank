import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { UserStatistics } from "../../types/Statistics";
import { IStatisticsRepository } from "../interfaces/IStatisticsRepository";

export class JsonStatisticsRepository implements IStatisticsRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, "userStats.json");
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<UserStatistics[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as UserStatistics[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<UserStatistics | undefined> {
    const userStats = await this.findAll();
    return userStats.find(stats => stats.id === id);
  }

  async findByUserId(userId: string): Promise<UserStatistics | undefined> {
    const userStats = await this.findAll();
    return userStats.find(stats => stats.userId === userId);
  }

  async create(userStats: UserStatistics): Promise<UserStatistics> {
    const allUserStats = await this.findAll();
    allUserStats.push(userStats);
    await this.save(allUserStats);
    return userStats;
  }

  async update(id: string, userStatsData: Partial<UserStatistics>): Promise<UserStatistics | undefined> {
    const allUserStats = await this.findAll();
    const index = allUserStats.findIndex(stats => stats.id === id);
    
    if (index === -1) {
      return undefined;
    }

    allUserStats[index] = { ...allUserStats[index], ...userStatsData };
    await this.save(allUserStats);
    return allUserStats[index];
  }

  async delete(id: string): Promise<boolean> {
    const allUserStats = await this.findAll();
    const index = allUserStats.findIndex(stats => stats.id === id);
    
    if (index === -1) {
      return false;
    }

    allUserStats.splice(index, 1);
    await this.save(allUserStats);
    return true;
  }

  async save(userStats: UserStatistics[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(userStats, null, 2));
  }
}
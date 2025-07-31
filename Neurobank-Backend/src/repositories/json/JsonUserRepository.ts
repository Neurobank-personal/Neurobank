import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { User } from "../../types/User";
import { IUserRepository } from "../interfaces/IUserRepository";

export class JsonUserRepository implements IUserRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, config.usersFile);
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<User[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as User[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(user => user.id === id);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.findAll();
    return users.find(user => user.email === email);
  }

  async create(user: User): Promise<User> {
    const users = await this.findAll();
    users.push(user);
    await this.save(users);
    return user;
  }

  async update(id: string, userData: Partial<User>): Promise<User | undefined> {
    const users = await this.findAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return undefined;
    }

    users[index] = { ...users[index], ...userData };
    await this.save(users);
    return users[index];
  }

  async delete(id: string): Promise<boolean> {
    const users = await this.findAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) {
      return false;
    }

    users.splice(index, 1);
    await this.save(users);
    return true;
  }

  async save(users: User[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(users, null, 2));
  }
}
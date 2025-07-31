import { promises as fs } from "fs";
import path from "path";
import config from "../../config";
import { Task } from "../../types/Task";
import { ITaskRepository } from "../interfaces/ITaskRepository";

export class JsonTaskRepository implements ITaskRepository {
  private filePath: string;

  constructor() {
    this.filePath = path.join(__dirname, "../../../", config.dataDir, "tasks.json");
  }

  private async ensureDataDir(): Promise<void> {
    const dataDir = path.dirname(this.filePath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  async findAll(): Promise<Task[]> {
    try {
      await this.ensureDataDir();
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data) as Task[];
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Task | undefined> {
    const tasks = await this.findAll();
    return tasks.find(task => task.id === id);
  }

  async findByUserId(userId: string): Promise<Task[]> {
    const tasks = await this.findAll();
    return tasks.filter(task => task.userId === userId);
  }

  async findByStatus(status: 'pending' | 'completed'): Promise<Task[]> {
    const tasks = await this.findAll();
    return tasks.filter(task => task.status === status);
  }

  async create(task: Task): Promise<Task> {
    const tasks = await this.findAll();
    tasks.push(task);
    await this.save(tasks);
    return task;
  }

  async update(id: string, taskData: Partial<Task>): Promise<Task | undefined> {
    const tasks = await this.findAll();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) {
      return undefined;
    }

    tasks[index] = { ...tasks[index], ...taskData };
    await this.save(tasks);
    return tasks[index];
  }

  async delete(id: string): Promise<boolean> {
    const tasks = await this.findAll();
    const index = tasks.findIndex(task => task.id === id);
    
    if (index === -1) {
      return false;
    }

    tasks.splice(index, 1);
    await this.save(tasks);
    return true;
  }

  async save(tasks: Task[]): Promise<void> {
    await this.ensureDataDir();
    await fs.writeFile(this.filePath, JSON.stringify(tasks, null, 2));
  }
}
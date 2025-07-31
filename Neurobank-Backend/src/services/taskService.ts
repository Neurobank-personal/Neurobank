import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/Task';

const TASKS_FILE = path.join(__dirname, '../../data/tasks.json');

class TaskService {
    async getAllTasks(): Promise<Task[]> {
        try {
            const data = await fs.readFile(TASKS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }

    async saveTasks(tasks: Task[]): Promise<void> {
        await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2));
    }

    async getUserTasks(userId: string): Promise<Task[]> {
        const tasks = await this.getAllTasks();
        return tasks.filter(task => task.userId === userId);
    }

    async getTaskById(taskId: string): Promise<Task | undefined> {
        const tasks = await this.getAllTasks();
        return tasks.find(task => task.id === taskId);
    }

    async createTask(taskData: CreateTaskRequest & { userId: string }): Promise<Task> {
        const tasks = await this.getAllTasks();

        const newTask: Task = {
            id: uuidv4(),
            userId: taskData.userId,
            title: taskData.title,
            description: taskData.description || '',
            priority: taskData.priority || 'medium',
            status: 'pending',
            createdAt: new Date().toISOString(),
            dueDate: taskData.dueDate || undefined,
            completedAt: undefined
        };

        tasks.push(newTask);
        await this.saveTasks(tasks);
        return newTask;
    }

    async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
        const tasks = await this.getAllTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        const updatedTask: Task = {
            ...tasks[taskIndex],
            ...updates
        };

        // If status is being changed to completed, set completedAt
        if (updates.status === 'completed' && tasks[taskIndex].status !== 'completed') {
            updatedTask.completedAt = new Date().toISOString();
        }

        // If status is being changed from completed to pending, clear completedAt
        if (updates.status === 'pending' && tasks[taskIndex].status === 'completed') {
            updatedTask.completedAt = undefined;
        }

        tasks[taskIndex] = updatedTask;
        await this.saveTasks(tasks);
        return updatedTask;
    }

    async deleteTask(taskId: string): Promise<boolean> {
        const tasks = await this.getAllTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);

        if (taskIndex === -1) {
            throw new Error('Task not found');
        }

        tasks.splice(taskIndex, 1);
        await this.saveTasks(tasks);
        return true;
    }
}

export default TaskService;
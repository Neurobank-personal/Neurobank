import { v4 as uuidv4 } from 'uuid';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { ITaskRepository } from '../repositories/interfaces/ITaskRepository';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/Task';

class TaskService {
    private taskRepository: ITaskRepository;

    constructor() {
        this.taskRepository = RepositoryFactory.getTaskRepository();
    }

    async getUserTasks(userId: string): Promise<Task[]> {
        return await this.taskRepository.findByUserId(userId);
    }

    async getTaskById(taskId: string): Promise<Task | undefined> {
        return await this.taskRepository.findById(taskId);
    }

    async createTask(taskData: CreateTaskRequest & { userId: string }): Promise<Task> {
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

        return await this.taskRepository.create(newTask);
    }

    async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
        const currentTask = await this.taskRepository.findById(taskId);
        
        if (!currentTask) {
            throw new Error('Task not found');
        }

        const updatedData = { ...updates };

        // If status is being changed to completed, set completedAt
        if (updates.status === 'completed' && currentTask.status !== 'completed') {
            updatedData.completedAt = new Date().toISOString();
        }

        // If status is being changed from completed to pending, clear completedAt
        if (updates.status === 'pending' && currentTask.status === 'completed') {
            updatedData.completedAt = undefined;
        }

        const updatedTask = await this.taskRepository.update(taskId, updatedData);
        
        if (!updatedTask) {
            throw new Error('Task not found');
        }
        
        return updatedTask;
    }

    async deleteTask(taskId: string): Promise<boolean> {
        const success = await this.taskRepository.delete(taskId);
        
        if (!success) {
            throw new Error('Task not found');
        }
        
        return success;
    }
}

export default new TaskService();
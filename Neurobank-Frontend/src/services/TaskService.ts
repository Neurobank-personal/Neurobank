import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/Task'

export class TaskService {
    private baseUrl = 'http://localhost:3001/api'

    async getUserTasks(userId: string): Promise<Task[]> {
        try {
            const response = await fetch(`${this.baseUrl}/tasks/user/${userId}`)
            if (!response.ok) {
                throw new Error('Failed to fetch tasks')
            }
            return await response.json()
        } catch (error) {
            console.error('Error fetching tasks:', error)
            throw error
        }
    }

    async createTask(userId: string, task: CreateTaskRequest): Promise<Task> {
        try {
            const response = await fetch(`${this.baseUrl}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...task, userId }),
            })
            if (!response.ok) {
                throw new Error('Failed to create task')
            }
            return await response.json()
        } catch (error) {
            console.error('Error creating task:', error)
            throw error
        }
    }

    async updateTask(taskId: string, updates: UpdateTaskRequest): Promise<Task> {
        try {
            const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            })
            if (!response.ok) {
                throw new Error('Failed to update task')
            }
            return await response.json()
        } catch (error) {
            console.error('Error updating task:', error)
            throw error
        }
    }

    async deleteTask(taskId: string): Promise<void> {
        try {
            const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
                method: 'DELETE',
            })
            if (!response.ok) {
                throw new Error('Failed to delete task')
            }
        } catch (error) {
            console.error('Error deleting task:', error)
            throw error
        }
    }

    async toggleTaskStatus(taskId: string, status: 'pending' | 'completed'): Promise<Task> {
        return this.updateTask(taskId, {
            status,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
        })
    }
}

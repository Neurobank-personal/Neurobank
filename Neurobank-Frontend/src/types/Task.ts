export interface Task {
    id: string
    userId: string
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    status: 'pending' | 'completed'
    createdAt: string
    completedAt?: string
    dueDate?: string
}

export interface CreateTaskRequest {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high'
    dueDate?: string
}

export interface UpdateTaskRequest {
    title?: string
    description?: string
    priority?: 'low' | 'medium' | 'high'
    status?: 'pending' | 'completed'
    dueDate?: string
    completedAt?: string
}

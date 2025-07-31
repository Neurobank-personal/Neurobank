import { Router, Request, Response } from 'express'
import TaskService from '../services/taskService'
import { validateRequired } from '../utils/validation'
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/Task'

const router = Router()
const taskService = new TaskService()

interface CreateTaskBody extends CreateTaskRequest {
  userId: string;
}

// Get all tasks for a user
router.get('/user/:userId', async (req: Request<{userId: string}>, res: Response<Task[] | {error: string}>) => {
    try {
        const { userId } = req.params
        const tasks = await taskService.getUserTasks(userId)
        res.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        res.status(500).json({ error: 'Failed to fetch tasks' })
    }
})

// Get a specific task
router.get('/:taskId', async (req: Request<{taskId: string}>, res: Response<Task | {error: string}>) => {
    try {
        const { taskId } = req.params
        const task = await taskService.getTaskById(taskId)

        if (!task) {
            return res.status(404).json({ error: 'Task not found' })
        }

        res.json(task)
    } catch (error) {
        console.error('Error fetching task:', error)
        res.status(500).json({ error: 'Failed to fetch task' })
    }
})

// Create a new task
router.post('/', async (req: Request<{}, Task | {error: string}, CreateTaskBody>, res: Response<Task | {error: string}>) => {
    try {
        const { userId, title, description, priority, dueDate } = req.body as CreateTaskBody

        // Validate required fields
        const requiredFields = { userId, title }
        const validation = validateRequired(requiredFields)
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.message })
        }

        // Validate priority if provided
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority. Must be low, medium, or high' })
        }

        // Validate due date if provided
        if (dueDate && isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ error: 'Invalid due date format' })
        }

        const taskData = {
            userId,
            title: title.trim(),
            description: description?.trim(),
            priority: priority || 'medium',
            dueDate: dueDate || null
        }

        const newTask = await taskService.createTask(taskData)
        res.status(201).json(newTask)
    } catch (error) {
        console.error('Error creating task:', error)
        res.status(500).json({ error: 'Failed to create task' })
    }
})

// Update a task
router.put('/:taskId', async (req: Request<{taskId: string}, Task | {error: string}, UpdateTaskRequest>, res: Response<Task | {error: string}>) => {
    try {
        const { taskId } = req.params
        const { title, description, priority, status, dueDate, completedAt } = req.body as UpdateTaskRequest

        // Validate priority if provided
        if (priority && !['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority. Must be low, medium, or high' })
        }

        // Validate status if provided
        if (status && !['pending', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be pending or completed' })
        }

        // Validate due date if provided
        if (dueDate && isNaN(Date.parse(dueDate))) {
            return res.status(400).json({ error: 'Invalid due date format' })
        }

        const updates: Partial<Task> = {}
        if (title !== undefined) updates.title = title.trim()
        if (description !== undefined) updates.description = description?.trim() || ''
        if (priority !== undefined) updates.priority = priority
        if (status !== undefined) updates.status = status
        if (dueDate !== undefined) updates.dueDate = dueDate || null
        if (completedAt !== undefined) updates.completedAt = completedAt

        const updatedTask = await taskService.updateTask(taskId, updates)
        res.json(updatedTask)
    } catch (error: any) {
        if (error.message === 'Task not found') {
            return res.status(404).json({ error: 'Task not found' })
        }
        console.error('Error updating task:', error)
        res.status(500).json({ error: 'Failed to update task' })
    }
})

// Delete a task
router.delete('/:taskId', async (req: Request<{taskId: string}>, res: Response<{error: string} | void>) => {
    try {
        const { taskId } = req.params
        await taskService.deleteTask(taskId)
        res.status(204).send()
    } catch (error: any) {
        if (error.message === 'Task not found') {
            return res.status(404).json({ error: 'Task not found' })
        }
        console.error('Error deleting task:', error)
        res.status(500).json({ error: 'Failed to delete task' })
    }
})

export default router

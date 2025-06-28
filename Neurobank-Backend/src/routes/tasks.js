const express = require('express')
const TaskService = require('../services/taskService')
const { validateRequired } = require('../utils/validation')

const router = express.Router()
const taskService = new TaskService()

// Get all tasks for a user
router.get('/user/:userId', async (req, res) => {
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
router.get('/:taskId', async (req, res) => {
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
router.post('/', async (req, res) => {
    try {
        const { userId, title, description, priority, dueDate } = req.body

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
router.put('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params
        const { title, description, priority, status, dueDate, completedAt } = req.body

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

        const updates = {}
        if (title !== undefined) updates.title = title.trim()
        if (description !== undefined) updates.description = description?.trim() || ''
        if (priority !== undefined) updates.priority = priority
        if (status !== undefined) updates.status = status
        if (dueDate !== undefined) updates.dueDate = dueDate || null
        if (completedAt !== undefined) updates.completedAt = completedAt

        const updatedTask = await taskService.updateTask(taskId, updates)
        res.json(updatedTask)
    } catch (error) {
        if (error.message === 'Task not found') {
            return res.status(404).json({ error: 'Task not found' })
        }
        console.error('Error updating task:', error)
        res.status(500).json({ error: 'Failed to update task' })
    }
})

// Delete a task
router.delete('/:taskId', async (req, res) => {
    try {
        const { taskId } = req.params
        await taskService.deleteTask(taskId)
        res.status(204).send()
    } catch (error) {
        if (error.message === 'Task not found') {
            return res.status(404).json({ error: 'Task not found' })
        }
        console.error('Error deleting task:', error)
        res.status(500).json({ error: 'Failed to delete task' })
    }
})

module.exports = router

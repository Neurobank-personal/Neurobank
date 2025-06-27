const express = require('express')
const router = express.Router()
const userService = require('../services/userService')

// Hämta alla användare
router.get('/', async (req, res, next) => {
    try {
        const users = await userService.getUsers()
        res.json(users)
    } catch (error) {
        next(error)
    }
})

// Spara användare (batch save)
router.post('/', async (req, res, next) => {
    try {
        const users = req.body
        await userService.saveUsers(users)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

// Skapa ny användare
router.post('/create', async (req, res, next) => {
    try {
        const newUser = await userService.createUser(req.body)
        res.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
})

// Hämta användare med ID
router.get('/:userId', async (req, res, next) => {
    try {
        const user = await userService.getUserById(req.params.userId)
        if (!user) {
            return res.status(404).json({ error: 'Användare hittades inte' })
        }
        res.json(user)
    } catch (error) {
        next(error)
    }
})

// Uppdatera användare
router.put('/:userId', async (req, res, next) => {
    try {
        const updatedUser = await userService.updateUser(req.params.userId, req.body)
        res.json(updatedUser)
    } catch (error) {
        next(error)
    }
})

// Ta bort användare
router.delete('/:userId', async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.userId)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

module.exports = router

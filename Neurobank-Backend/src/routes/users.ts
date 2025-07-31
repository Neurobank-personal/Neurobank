import { Router, Request, Response, NextFunction } from 'express'
import userService from '../services/userService'
import { User, CreateUserRequest } from '../types/User'

const router = Router()

// Hämta alla användare
router.get('/', async (req: Request, res: Response<User[]>, next: NextFunction) => {
    try {
        const users = await userService.getUsers()
        res.json(users)
    } catch (error) {
        next(error)
    }
})

// Spara användare (batch save)
router.post('/', async (req: Request<{}, {success: boolean}, User[]>, res: Response<{success: boolean}>, next: NextFunction) => {
    try {
        const users = req.body as User[]
        await userService.saveUsers(users)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

// Skapa ny användare
router.post('/create', async (req: Request<{}, User, CreateUserRequest>, res: Response<User>, next: NextFunction) => {
    try {
        const newUser = await userService.createUser(req.body as CreateUserRequest)
        res.status(201).json(newUser)
    } catch (error) {
        next(error)
    }
})

// Hämta användare med ID
router.get('/:userId', async (req: Request<{userId: string}>, res: Response<User | {error: string}>, next: NextFunction) => {
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
router.put('/:userId', async (req: Request<{userId: string}, User, Partial<User>>, res: Response<User>, next: NextFunction) => {
    try {
        const updatedUser = await userService.updateUser(req.params.userId, req.body as Partial<User>)
        res.json(updatedUser)
    } catch (error) {
        next(error)
    }
})

// Ta bort användare
router.delete('/:userId', async (req: Request<{userId: string}>, res: Response<{success: boolean}>, next: NextFunction) => {
    try {
        await userService.deleteUser(req.params.userId)
        res.json({ success: true })
    } catch (error) {
        next(error)
    }
})

export default router

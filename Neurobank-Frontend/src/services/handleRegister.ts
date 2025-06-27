import { UserService } from './UserService'
import type { CreateUserRequest } from '../types/User'

const userService = new UserService()

export const handleRegister = async (userData: CreateUserRequest) => {
    try {
        const user = await userService.registerUser(userData)
        return {
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                createdAt: user.createdAt
            },
            message: 'Användare skapad framgångsrikt!'
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ett fel uppstod'
        }
    }
}

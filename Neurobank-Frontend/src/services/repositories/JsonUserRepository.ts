import type { IUserRepository } from '../interfaces/IUserRepository'
import type { User, CreateUserRequest } from '../../types/User'
import { getApiUrl, API_CONFIG } from '../../config/api'

export class JsonUserRepository implements IUserRepository {
    private readonly apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.USERS)

    private async readUsers(): Promise<User[]> {
        try {
            const response = await fetch(this.apiUrl)
            if (!response.ok) throw new Error('Network error')
            return await response.json()
        } catch (error) {
            console.error('Error reading users:', error)
            return []
        }
    }

    private async writeUsers(users: User[]): Promise<void> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users)
            })
            if (!response.ok) throw new Error('Network error')
        } catch (error) {
            console.error('Error writing users:', error)
            throw new Error('Kunde inte spara användare')
        }
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        const users = await this.readUsers()

        // Kontrollera om email redan finns
        const existingUser = users.find(user => user.email === userData.email)
        if (existingUser) {
            throw new Error('En användare med denna e-post finns redan')
        }

        const newUser: User = {
            id: this.generateId(),
            ...userData,
            createdAt: new Date()
        }

        users.push(newUser)
        await this.writeUsers(users)

        return newUser
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const users = await this.readUsers()
        return users.find(user => user.email === email) || null
    }

    async findUserById(id: string): Promise<User | null> {
        const users = await this.readUsers()
        return users.find(user => user.id === id) || null
    }

    async getAllUsers(): Promise<User[]> {
        return await this.readUsers()
    }

    private generateId(): string {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
}
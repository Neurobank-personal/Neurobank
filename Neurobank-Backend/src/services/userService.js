const fileService = require('./fileService')
const { validateUser } = require('../utils/validation')

class UserService {
    async getUsers() {
        return fileService.readUsers()
    }

    async saveUsers(users) {
        return fileService.writeUsers(users)
    }

    async getUserById(userId) {
        const users = await this.getUsers()
        return users.find(user => user.id === userId)
    }

    async getUserByEmail(email) {
        const users = await this.getUsers()
        return users.find(user => user.email === email)
    }

    async createUser(userData) {
        validateUser(userData)

        const users = await this.getUsers()

        // Kolla om användaren redan finns
        const existingUser = await this.getUserByEmail(userData.email)
        if (existingUser) {
            throw new Error('Användare med denna e-post finns redan')
        }

        const newUser = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        users.push(newUser)
        await this.saveUsers(users)

        return newUser
    }

    async updateUser(userId, updates) {
        const users = await this.getUsers()
        const userIndex = users.findIndex(user => user.id === userId)

        if (userIndex === -1) {
            throw new Error('Användare hittades inte')
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString()
        }

        await this.saveUsers(users)
        return users[userIndex]
    }

    async deleteUser(userId) {
        const users = await this.getUsers()
        const filteredUsers = users.filter(user => user.id !== userId)

        if (users.length === filteredUsers.length) {
            throw new Error('Användare hittades inte')
        }

        await this.saveUsers(filteredUsers)
        return true
    }
}

module.exports = new UserService()

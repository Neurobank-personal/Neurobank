import fileService from './fileService';
import { validateUser } from '../utils/validation';
import { User, CreateUserRequest } from '../types/User';

class UserService {
    async getUsers(): Promise<User[]> {
        return fileService.readUsers();
    }

    async saveUsers(users: User[]): Promise<void> {
        return fileService.writeUsers(users);
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const users = await this.getUsers();
        return users.find(user => user.id === userId);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        const users = await this.getUsers();
        return users.find(user => user.email === email);
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        validateUser(userData);

        const users = await this.getUsers();

        // Kolla om användaren redan finns
        const existingUser = await this.getUserByEmail(userData.email);
        if (existingUser) {
            throw new Error('Användare med denna e-post finns redan');
        }

        const newUser: User = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            ...userData,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await this.saveUsers(users);

        return newUser;
    }

    async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
        const users = await this.getUsers();
        const userIndex = users.findIndex(user => user.id === userId);

        if (userIndex === -1) {
            throw new Error('Användare hittades inte');
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updates
        };

        await this.saveUsers(users);
        return users[userIndex];
    }

    async deleteUser(userId: string): Promise<boolean> {
        const users = await this.getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);

        if (users.length === filteredUsers.length) {
            throw new Error('Användare hittades inte');
        }

        await this.saveUsers(filteredUsers);
        return true;
    }
}

export default new UserService();
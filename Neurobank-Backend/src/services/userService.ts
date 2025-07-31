import { RepositoryFactory } from '../repositories/RepositoryFactory';
import { IUserRepository } from '../repositories/interfaces/IUserRepository';
import { validateUser } from '../utils/validation';
import { User, CreateUserRequest } from '../types/User';

class UserService {
    private userRepository: IUserRepository;

    constructor() {
        this.userRepository = RepositoryFactory.getUserRepository();
    }

    async getUsers(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async saveUsers(users: User[]): Promise<void> {
        return this.userRepository.save(users);
    }

    async getUserById(userId: string): Promise<User | undefined> {
        return this.userRepository.findById(userId);
    }

    async getUserByEmail(email: string): Promise<User | undefined> {
        return this.userRepository.findByEmail(email);
    }

    async createUser(userData: CreateUserRequest): Promise<User> {
        validateUser(userData);

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

        return this.userRepository.create(newUser);
    }

    async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
        const updatedUser = await this.userRepository.update(userId, updates);
        
        if (!updatedUser) {
            throw new Error('Användare hittades inte');
        }

        return updatedUser;
    }

    async deleteUser(userId: string): Promise<boolean> {
        const success = await this.userRepository.delete(userId);
        
        if (!success) {
            throw new Error('Användare hittades inte');
        }

        return true;
    }
}

export default new UserService();
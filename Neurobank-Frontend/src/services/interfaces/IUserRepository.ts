import type { User, CreateUserRequest } from '../../types/User'

export interface IUserRepository {
    createUser(userData: CreateUserRequest): Promise<User>
    findUserByEmail(email: string): Promise<User | null>
    findUserById(id: string): Promise<User | null>
    getAllUsers(): Promise<User[]>
}
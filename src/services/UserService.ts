import type { IUserRepository } from './interfaces/IUserRepository'
import { JsonUserRepository } from './repositories/JsonUserRepository'
import type { User, CreateUserRequest, LoginRequest } from '../types/User'

export class UserService {
    private userRepository: IUserRepository

    constructor() {
        // Här kan du enkelt byta till en annan repository senare
        this.userRepository = new JsonUserRepository()
    }

    async registerUser(userData: CreateUserRequest): Promise<User> {
        // Validering
        this.validateUserData(userData)

        // Hash lösenord (enkelt för nu, byt till bcrypt senare)
        const hashedPassword = this.hashPassword(userData.password)

        return await this.userRepository.createUser({
            ...userData,
            password: hashedPassword
        })
    }

    async loginUser(loginData: LoginRequest): Promise<User | null> {
        const user = await this.userRepository.findUserByEmail(loginData.email)

        if (!user) {
            return null
        }

        // Verifiera lösenord
        const isValidPassword = this.verifyPassword(loginData.password, user.password)

        return isValidPassword ? user : null
    }

    private validateUserData(userData: CreateUserRequest): void {
        if (!userData.email || !userData.email.includes('@')) {
            throw new Error('Ogiltig e-postadress')
        }

        if (!userData.password || userData.password.length < 6) {
            throw new Error('Lösenordet måste vara minst 6 tecken')
        }

        if (!userData.firstName || !userData.lastName) {
            throw new Error('För- och efternamn krävs')
        }
    }

    private hashPassword(password: string): string {
        // Enkelt för nu - byt till bcrypt senare
        return btoa(password)
    }

    private verifyPassword(password: string, hashedPassword: string): boolean {
        // Enkelt för nu - byt till bcrypt senare
        return btoa(password) === hashedPassword
    }
}
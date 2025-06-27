export interface User {
    id: string
    firstName: string
    lastName: string
    email: string
    password: string
    createdAt: Date
}

export interface CreateUserRequest {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}
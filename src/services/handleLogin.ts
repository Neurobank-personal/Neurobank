import { UserService } from './UserService'

const userService = new UserService()


export const handleLogin = async (email: string, password: string) => {
    try {
        const user = await userService.loginUser({ email, password })

        if (!user) {
            return {
                success: false,
                error: 'Ogiltiga inloggningsuppgifter'
            }
        }

        return {
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            },
            message: 'Inloggning lyckades!'
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Ett fel uppstod'
        }
    }
}
import { Router, Request, Response } from 'express'
import config from '../config'

const router = Router()

interface HealthResponse {
    status: string;
    timestamp: string;
    environment: string;
    version: string;
    uptime: number;
    memory: NodeJS.MemoryUsage;
    openaiConfigured: boolean;
}

// Health check endpoint
router.get('/', (req: Request, res: Response<HealthResponse>) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        openaiConfigured: !!config.openaiApiKey
    })
})

export default router

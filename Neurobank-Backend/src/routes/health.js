const express = require('express')
const router = express.Router()
const config = require('../config')

// Health check endpoint
router.get('/', (req, res) => {
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

module.exports = router

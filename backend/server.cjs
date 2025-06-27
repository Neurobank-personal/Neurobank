const express = require('express')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'data', 'users.json')

// Säkerställ att data-mappen finns
async function ensureDataDir() {
    const dataDir = path.dirname(DATA_FILE)
    try {
        await fs.access(dataDir)
    } catch {
        await fs.mkdir(dataDir, { recursive: true })
    }
}

// Läs användare
app.get('/api/users', async (req, res) => {
    try {
        await ensureDataDir()
        const data = await fs.readFile(DATA_FILE, 'utf-8')
        res.json(JSON.parse(data))
    } catch {
        res.json([])
    }
})

// Spara användare
app.post('/api/users', async (req, res) => {
    try {
        await ensureDataDir()
        const users = req.body
        await fs.writeFile(DATA_FILE, JSON.stringify(users, null, 2))
        res.json({ success: true })
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte spara användare' })
    }
})

app.listen(PORT, () => {
    console.log(`Server körs på http://localhost:${PORT}`)
    console.log(`Användare sparas i: ${DATA_FILE}`)
})
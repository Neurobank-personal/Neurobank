const express = require('express')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')

// Läs environment variables från .env filen
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// CORS setup - tillåt requests från frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())

const DATA_DIR = path.join(__dirname, 'data')
const USERS_FILE = path.join(DATA_DIR, 'users.json')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')

// Säkerställ att data-mappen finns
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR)
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true })
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    })
})

// ============= USER ROUTES =============

// Läs användare
app.get('/api/users', async (req, res) => {
    try {
        await ensureDataDir()
        const data = await fs.readFile(USERS_FILE, 'utf-8')
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
        await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2))
        res.json({ success: true })
    } catch (error) {
        console.error('Error saving users:', error)
        res.status(500).json({ error: 'Kunde inte spara användare' })
    }
})

// ============= NOTES ROUTES =============

// Hjälpfunktioner för anteckningar
async function readNotes() {
    try {
        await ensureDataDir()
        const data = await fs.readFile(NOTES_FILE, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

async function writeNotes(notes) {
    await ensureDataDir()
    await fs.writeFile(NOTES_FILE, JSON.stringify(notes, null, 2))
}

// Skapa anteckning
app.post('/api/notes', async (req, res) => {
    try {
        const { title, content, processType, userId } = req.body
        const notes = await readNotes()

        const newNote = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            title,
            content,
            processType,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        notes.push(newNote)
        await writeNotes(notes)

        res.json(newNote)
    } catch (error) {
        console.error('Error creating note:', error)
        res.status(500).json({ error: 'Kunde inte skapa anteckning' })
    }
})

// Hämta användarens anteckningar
app.get('/api/notes/user/:userId', async (req, res) => {
    try {
        const notes = await readNotes()
        const userNotes = notes.filter(note => note.userId === req.params.userId)
        res.json(userNotes)
    } catch (error) {
        console.error('Error fetching notes:', error)
        res.status(500).json({ error: 'Kunde inte hämta anteckningar' })
    }
})

// ============= AI PROCESSING =============

const { OpenAI } = require('openai')

// Funktion för att få OpenAI instans (lazy loading)
function getOpenAIClient() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
}

// Bearbeta med AI
app.post('/api/notes/process', async (req, res) => {
    try {
        const { noteId, processType } = req.body
        const notes = await readNotes()

        const note = notes.find(n => n.id === noteId)
        if (!note) {
            return res.status(404).json({ error: 'Anteckning hittades inte' })
        }

        let prompt = ''
        // TODO: Förbättra prompt engineering
        if (processType === 'summarize') {
            prompt = `Sammanfatta följande text på svenska och fokusera på de viktigaste punkterna:\n\n${note.content}`
        } else if (processType === 'expand') {
            prompt = `Utveckla och utvidga följande text på svenska med mer djupgående analys och exempel:\n\n${note.content}`
        } else {
            return res.status(400).json({ error: 'Ogiltigt processType' })
        }

        const openai = getOpenAIClient()
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 4000,
            temperature: 0.7
        })

        const processedContent = completion.choices[0].message.content

        // Uppdatera anteckning
        note.processedContent = processedContent
        note.updatedAt = new Date().toISOString()

        await writeNotes(notes)

        res.json(note)
    } catch (error) {
        console.error('AI processing error:', error)
        if (error.message.includes('OPENAI_API_KEY')) {
            res.status(500).json({ error: 'OpenAI API-nyckel saknas eller ogiltig' })
        } else {
            res.status(500).json({ error: 'AI-bearbetning misslyckades' })
        }
    }
})

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Något gick fel på servern' })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint hittades inte' })
})

app.listen(PORT, () => {
    console.log(`🚀 Neurobank Backend körs på http://localhost:${PORT}`)
    console.log(`📁 Data sparas i: ${DATA_DIR}`)
    console.log(`🤖 OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✅ Laddad' : '❌ Saknas'}`)
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
})

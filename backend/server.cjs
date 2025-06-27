const express = require('express')
const fs = require('fs').promises
const path = require('path')
const cors = require('cors')

// Läs environment variables från .env filen FÖRST
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

const DATA_FILE = path.join(__dirname, 'data', 'users.json')

// TODO: dela upp denna i flera filer

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
    console.log(`OpenAI API Key loaded: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`)
})

// Endpoints för AI anrop
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

const NOTES_FILE = path.join(__dirname, 'data', 'notes.json')

// Läs anteckningar
async function readNotes() {
    try {
        await ensureDataDir()
        const data = await fs.readFile(NOTES_FILE, 'utf-8')
        return JSON.parse(data)
    } catch {
        return []
    }
}

// Spara anteckningar
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
        res.status(500).json({ error: 'Kunde inte skapa anteckning' })
    }
})

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
        //  TODO: Prompt engineering, vill ha bättre prompts
        if (processType === 'summarize') {
            prompt = `Sammanfatta följande text på svenska:\n\n${note.content}`
        } else if (processType === 'expand') {
            prompt = `Utveckla och utvidga följande text på svenska:\n\n${note.content}`
        }

        const openai = getOpenAIClient()
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 4000  // Ungefär 3,000-4,000 ord output
        })

        const processedContent = completion.choices[0].message.content

        // Uppdatera anteckning
        note.processedContent = processedContent
        note.updatedAt = new Date().toISOString()

        await writeNotes(notes)

        res.json(note)
    } catch (error) {
        console.error('AI Error:', error)
        res.status(500).json({ error: 'AI-bearbetning misslyckades' })
    }
})

// Hämta användarens anteckningar
app.get('/api/notes/user/:userId', async (req, res) => {
    try {
        const notes = await readNotes()
        const userNotes = notes.filter(note => note.userId === req.params.userId)
        res.json(userNotes)
    } catch (error) {
        res.status(500).json({ error: 'Kunde inte hämta anteckningar' })
    }
})
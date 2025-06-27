const fs = require('fs').promises
const path = require('path')
const config = require('../config')

class FileService {
    constructor() {
        this.dataDir = path.join(__dirname, '../../', config.dataDir)
        this.usersFile = path.join(this.dataDir, config.usersFile)
        this.notesFile = path.join(this.dataDir, config.notesFile)
    }

    async ensureDataDir() {
        try {
            await fs.access(this.dataDir)
        } catch {
            await fs.mkdir(this.dataDir, { recursive: true })
        }
    }

    async readFile(filePath, defaultValue = []) {
        try {
            await this.ensureDataDir()
            const data = await fs.readFile(filePath, 'utf-8')
            return JSON.parse(data)
        } catch {
            return defaultValue
        }
    }

    async writeFile(filePath, data) {
        await this.ensureDataDir()
        await fs.writeFile(filePath, JSON.stringify(data, null, 2))
    }

    async readUsers() {
        return this.readFile(this.usersFile, [])
    }

    async writeUsers(users) {
        return this.writeFile(this.usersFile, users)
    }

    async readNotes() {
        return this.readFile(this.notesFile, [])
    }

    async writeNotes(notes) {
        return this.writeFile(this.notesFile, notes)
    }
}

module.exports = new FileService()

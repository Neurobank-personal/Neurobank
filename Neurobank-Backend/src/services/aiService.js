const { OpenAI } = require('openai')
const config = require('../config')

class AIService {
    constructor() {
        this.openai = null
    }

    getOpenAIClient() {
        if (!config.openaiApiKey) {
            throw new Error('OPENAI_API_KEY environment variable is not set')
        }

        if (!this.openai) {
            this.openai = new OpenAI({
                apiKey: config.openaiApiKey
            })
        }

        return this.openai
    }

    generatePrompt(processType, content) {
        const prompts = {
            summarize: `Sammanfatta följande text på svenska och fokusera på de viktigaste punkterna:\n\n${content}`,
            expand: `Utveckla och utvidga följande text på svenska med mer djupgående analys och exempel:\n\n${content}`,
            analyze: `Analysera följande text på svenska och ge djupgående insikter:\n\n${content}`,
            structure: `Strukturera och organisera följande text på svenska på ett tydligt sätt:\n\n${content}`,
            flashcards: `Generate flashcards from the following text in English. Create flashcards with questions and answers based on the content. Also categorize each flashcard with an appropriate category. Respond in the following JSON format:
{
  "flashcards": [
    {
      "question": "question here",
      "answer": "answer here", 
      "category": "category here"
    }
  ]
}

Text to generate flashcards from:\n\n${content}`
        }

        if (!prompts[processType]) {
            throw new Error(`Ogiltigt processType: ${processType}`)
        }

        return prompts[processType]
    }

    async processText(content, processType) {
        try {
            const openai = this.getOpenAIClient()
            const prompt = this.generatePrompt(processType, content)

            const completion = await openai.chat.completions.create({
                model: config.ai.model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: config.ai.maxTokens,
                temperature: config.ai.temperature
            })

            return completion.choices[0].message.content
        } catch (error) {
            console.error('AI processing error:', error)
            throw error
        }
    }

    async generateFlashcards(notes) {
        try {
            const openai = this.getOpenAIClient()

            // Kombinera alla anteckningar till en text
            const combinedContent = notes.map(note => `**${note.title}**\n${note.content}`).join('\n\n---\n\n')

            const prompt = this.generatePrompt('flashcards', combinedContent)

            const completion = await openai.chat.completions.create({
                model: config.ai.model,
                messages: [{ role: "user", content: prompt }],
                max_tokens: config.ai.maxTokens,
                temperature: config.ai.temperature
            })

            const response = completion.choices[0].message.content

            try {
                const parsed = JSON.parse(response)
                return parsed.flashcards || []
            } catch (parseError) {
                console.error('Failed to parse AI response:', parseError)
                throw new Error('AI returnerade ogiltigt format för flashcards')
            }
        } catch (error) {
            console.error('AI flashcard generation error:', error)
            throw error
        }
    }
}

module.exports = new AIService()

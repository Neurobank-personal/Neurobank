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
            structure: `Strukturera och organisera följande text på svenska på ett tydligt sätt:\n\n${content}`
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
}

module.exports = new AIService()

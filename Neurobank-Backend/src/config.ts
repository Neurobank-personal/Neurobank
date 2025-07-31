import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  port: number;
  frontendUrl: string;
  nodeEnv: string;
  openaiApiKey: string | undefined;
  dataDir: string;
  usersFile: string;
  notesFile: string;
  ai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: process.env.OPENAI_API_KEY,

  // Databasinställningar
  dataDir: 'data',
  usersFile: 'users.json',
  notesFile: 'notes.json',

  // AI-inställningar
  ai: {
    model: 'gpt-3.5-turbo',
    maxTokens: 4000,
    temperature: 0.7
  }
};

export default config;
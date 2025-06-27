# SecondBrain Project

A full-stack note-taking application with AI capabilities.

## Project Structure

```
SecondBrain-project/
├── Neurobank-Frontend/    # Vue.js frontend application
└── Neurobank-Backend/     # Node.js backend server
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- make (usually pre-installed on macOS/Linux)

### Quick Start
```bash
# Install all dependencies
make install

# Start both frontend and backend
make dev
```

### Available Commands
- `make dev` - Start both servers in development mode
- `make dev-frontend` - Start only frontend
- `make dev-backend` - Start only backend
- `make install` - Install all dependencies
- `make build` - Build frontend for production
- `make clean` - Clean all node_modules and build files
- `make help` - Show all available commands

## Development

Both frontend and backend need to be running simultaneously for the application to work properly.

- Frontend runs on: http://localhost:5173
- Backend runs on: http://localhost:3000

## Features

- User authentication (login/register)
- Note management (create, read, update, delete)
- Modern Vue.js frontend with TypeScript
- RESTful API backend with Express.js

## Contributing

1. Make changes in the appropriate frontend or backend directory
2. Test your changes locally
3. Commit with descriptive messages
4. Push to your branch and create a pull request

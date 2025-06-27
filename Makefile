# SecondBrain Project Makefile

.PHONY: dev dev-frontend dev-backend install install-frontend install-backend build clean help

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev          - Start both frontend and backend in development mode"
	@echo "  make dev-frontend - Start only frontend in development mode"
	@echo "  make dev-backend  - Start only backend in development mode"
	@echo "  make install      - Install dependencies for both frontend and backend"
	@echo "  make build        - Build frontend for production"
	@echo "  make clean        - Clean all node_modules and build files"
	@echo "  make help         - Show this help message"

# Start both servers in development mode
dev:
	@echo "🚀 Starting SecondBrain development servers..."
	@echo "📱 Frontend will be available at: http://localhost:5173"
	@echo "🔧 Backend will be available at: http://localhost:3000"
	@echo "Press Ctrl+C to stop both servers"
	@make -j2 dev-frontend dev-backend

# Start only frontend
dev-frontend:
	@echo "🎨 Starting frontend development server..."
	@cd Neurobank-Frontend && npm run dev

# Start only backend
dev-backend:
	@echo "⚙️ Starting backend development server..."
	@cd Neurobank-Backend && npm start

# Install all dependencies
install:
	@echo "📦 Installing dependencies..."
	@echo "Installing frontend dependencies..."
	@cd Neurobank-Frontend && npm install
	@echo "Installing backend dependencies..."
	@cd Neurobank-Backend && npm install
	@echo "✅ All dependencies installed!"

# Install only frontend dependencies
install-frontend:
	@echo "📦 Installing frontend dependencies..."
	@cd Neurobank-Frontend && npm install

# Install only backend dependencies
install-backend:
	@echo "📦 Installing backend dependencies..."
	@cd Neurobank-Backend && npm install

# Build frontend for production
build:
	@echo "🏗️ Building frontend for production..."
	@cd Neurobank-Frontend && npm run build
	@echo "✅ Frontend built successfully!"

# Clean all node_modules and build files
clean:
	@echo "🧹 Cleaning project..."
	@rm -rf Neurobank-Frontend/node_modules
	@rm -rf Neurobank-Frontend/dist
	@rm -rf Neurobank-Backend/node_modules
	@echo "✅ Project cleaned!"

# Check if dependencies are installed
check-deps:
	@if [ ! -d "Neurobank-Frontend/node_modules" ]; then \
		echo "❌ Frontend dependencies not installed. Run 'make install' first."; \
		exit 1; \
	fi
	@if [ ! -d "Neurobank-Backend/node_modules" ]; then \
		echo "❌ Backend dependencies not installed. Run 'make install' first."; \
		exit 1; \
	fi

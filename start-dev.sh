#!/bin/bash

# Development startup script for Acquisitions API with Neon Local
# This script helps set up the development environment quickly

set -e

echo "🚀 Starting Acquisitions API Development Environment..."
echo

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if environment file exists
if [ ! -f ".env.dev.local" ]; then
    echo "📝 Creating development environment file..."
    
    if [ ! -f ".env.development" ]; then
        echo "❌ .env.development template not found!"
        exit 1
    fi
    
    cp .env.development .env.dev.local
    echo "✅ Created .env.dev.local from template"
    echo
    echo "🔧 Please edit .env.dev.local and add your Neon credentials:"
    echo "   - NEON_API_KEY"
    echo "   - NEON_PROJECT_ID" 
    echo "   - PARENT_BRANCH_ID"
    echo "   - ARCJET_KEY"
    echo
    echo "Then run this script again."
    exit 0
fi

# Validate required environment variables
echo "🔍 Validating environment configuration..."

source .env.dev.local

if [ -z "$NEON_API_KEY" ] || [ "$NEON_API_KEY" = "your_neon_api_key_here" ]; then
    echo "❌ NEON_API_KEY is not configured in .env.dev.local"
    exit 1
fi

if [ -z "$NEON_PROJECT_ID" ] || [ "$NEON_PROJECT_ID" = "your_neon_project_id_here" ]; then
    echo "❌ NEON_PROJECT_ID is not configured in .env.dev.local"
    exit 1
fi

if [ -z "$PARENT_BRANCH_ID" ] || [ "$PARENT_BRANCH_ID" = "your_parent_branch_id_here" ]; then
    echo "❌ PARENT_BRANCH_ID is not configured in .env.dev.local"
    exit 1
fi

echo "✅ Environment configuration looks good"

# Clean up any existing containers
echo "🧹 Cleaning up any existing containers..."
docker-compose -f docker-compose.dev.yml down --remove-orphans > /dev/null 2>&1 || true

# Build and start the development environment
echo "🏗️ Building and starting development environment..."
docker-compose --env-file .env.dev.local -f docker-compose.dev.yml up -d --build

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service health
echo "🏥 Checking service health..."

# Wait for Neon Local to be ready
echo "   Waiting for Neon Local..."
timeout 60 bash -c 'until docker-compose -f docker-compose.dev.yml exec -T neon-local pg_isready -h localhost -p 5432 -U neon > /dev/null 2>&1; do sleep 2; done'

# Wait for application to be ready
echo "   Waiting for application..."
timeout 60 bash -c 'until curl -f http://localhost:3000/health > /dev/null 2>&1; do sleep 2; done' || echo "   ⚠️ Health check endpoint not available yet"

echo
echo "🎉 Development environment is ready!"
echo
echo "📡 Services available:"
echo "   • Application: http://localhost:3000"
echo "   • Database: localhost:5432 (user: neon, password: npg)"
echo "   • Neon Local Proxy: Running with ephemeral branch"
echo
echo "🛠️ Useful commands:"
echo "   • View logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "   • Stop environment: docker-compose -f docker-compose.dev.yml down"
echo "   • Database migrations: docker-compose -f docker-compose.dev.yml exec app npm run db:migrate"
echo "   • Drizzle Studio: docker-compose -f docker-compose.dev.yml exec app npm run db:studio"
echo
echo "📚 Check README.md for detailed usage instructions"
echo
echo "Happy coding! 🎯"
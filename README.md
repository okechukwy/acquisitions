# Acquisitions API

A Node.js REST API built with Express, Drizzle ORM, and Neon Database, containerized with Docker for both development and production environments.

## 🏗️ Architecture

- **Backend**: Node.js with Express.js
- **Database**: Neon Database (PostgreSQL-compatible)
- **ORM**: Drizzle ORM with Neon serverless driver
- **Security**: Arcjet for rate limiting and protection
- **Containerization**: Docker with multi-environment support

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Neon Database account ([sign up here](https://neon.tech))
- Your Neon API credential

### Get Your Neon Credentials

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project or select an existing one
3. Get your credentials:
   - **NEON_API_KEY**: From Account Settings > API Keys
   - **NEON_PROJECT_ID**: From Project Settings > General
   - **PARENT_BRANCH_ID**: Usually `main` or your default branch ID

## 🔧 Development Setup (with Neon Local)

### 1. Clone and Setup Environment

```bash
git clone https://github.com/okechukwy/acquisitions.git
cd acquisitions

# Copy and configure your development environment
cp .env.development .env.dev.local
```

### 2. Configure Development Environment

Edit `.env.dev.local` with your Neon credentials:

```bash
# .env.dev.local
NEON_API_KEY=your_neon_api_key_here
NEON_PROJECT_ID=your_neon_project_id_here
PARENT_BRANCH_ID=your_parent_branch_id_here
ARCJET_KEY=your_arcjet_key_here
```

### 3. Start Development Environment

```bash
# Start with Neon Local (ephemeral database branches)
docker-compose --env-file .env.dev.local -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop the environment
docker-compose -f docker-compose.dev.yml down
```

### 4. Development Workflow

The development setup provides:

- **🔄 Ephemeral Database Branches**: Fresh database branch created on each startup
- **📡 Neon Local Proxy**: Local PostgreSQL interface to your Neon cloud data
- **🔥 Hot Reload**: Source code mounted for live development
- **📊 Database Access**: Connect at `localhost:5432` with credentials `neon:npg`

#### Run Database Migrations

```bash
# Generate migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:generate

# Apply migrations
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Open Drizzle Studio
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

#### Development Commands

```bash
# View application logs
docker-compose -f docker-compose.dev.yml logs -f app

# Execute commands in the app container
docker-compose -f docker-compose.dev.yml exec app npm run lint

# Access the application shell
docker-compose -f docker-compose.dev.yml exec app sh
```

### 5. Persistent Branches (Optional)

To persist database branches across container restarts, uncomment the volume mounts in `docker-compose.dev.yml`:

```yaml
volumes:
  - ./.neon_local/:/tmp/.neon_local
  - ./.git/HEAD:/tmp/.git/HEAD:ro
```

Set `DELETE_BRANCH=false` in your environment file.

## 🚀 Production Deployment

### 1. Configure Production Environment

```bash
# Copy and configure production environment
cp .env.production .env.prod.local
```

Edit `.env.prod.local`:

```bash
# .env.prod.local
DATABASE_URL=postgres://username:password@ep-xxx-pooler.region.aws.neon.tech/dbname?sslmode=require
ARCJET_KEY=your_production_arcjet_key
PORT=3000
NODE_ENV=production
```

### 2. Deploy to Production

```bash
# Build and start production environment
docker-compose --env-file .env.prod.local -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production environment
docker-compose -f docker-compose.prod.yml down
```

### 3. Production Features

The production setup includes:

- **🔒 Security Hardening**: Read-only filesystem, non-root user, security options
- **📈 Resource Limits**: CPU and memory constraints
- **🏥 Health Checks**: Automatic health monitoring
- **🔄 Auto-restart**: Restart on failure with backoff
- **☁️ Direct Neon Cloud**: Connects directly to your Neon cloud database

## 🌍 Environment Configuration

### Development vs Production

| Feature         | Development                     | Production                     |
| --------------- | ------------------------------- | ------------------------------ |
| Database        | Neon Local (ephemeral branches) | Neon Cloud (direct connection) |
| SSL             | Self-signed certs allowed       | Full SSL validation            |
| Logging         | Debug level                     | Info level                     |
| Hot Reload      | Enabled                         | Disabled                       |
| Resource Limits | None                            | CPU/Memory limited             |
| Security        | Development mode                | Hardened container             |

### Environment Variables

#### Required for Development

```bash
NEON_API_KEY=          # Your Neon API key
NEON_PROJECT_ID=       # Your Neon project ID
PARENT_BRANCH_ID=      # Parent branch for ephemeral branches
ARCJET_KEY=            # Arcjet protection key
```

#### Required for Production

```bash
DATABASE_URL=          # Direct Neon cloud connection string
ARCJET_KEY=            # Production Arcjet key
NODE_ENV=production    # Production mode
```

## 🔧 Database Operations

### Migrations

```bash
# Development
docker-compose -f docker-compose.dev.yml exec app npm run db:generate
docker-compose -f docker-compose.dev.yml exec app npm run db:migrate

# Production
docker-compose -f docker-compose.prod.yml exec app npm run db:migrate
```

### Database Studio

```bash
# Access Drizzle Studio (development only)
docker-compose -f docker-compose.dev.yml exec app npm run db:studio
```

## 📊 Monitoring and Debugging

### Health Checks

Both environments include health checks:

```bash
# Check container health
docker-compose -f docker-compose.dev.yml ps
docker-compose -f docker-compose.prod.yml ps
```

### Logs

```bash
# Application logs
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f app

# Database logs (development only)
docker-compose -f docker-compose.dev.yml logs -f neon-local
```

### Container Stats

```bash
# Resource usage
docker stats acquisitions-app-dev
docker stats acquisitions-app-prod
```

## 🛠️ Development Tips

### 1. Database Branching Workflow

```bash
# Each docker-compose up creates a fresh branch
docker-compose -f docker-compose.dev.yml up -d

# Work with your ephemeral branch
# Database is automatically cleaned up on down
docker-compose -f docker-compose.dev.yml down
```

### 2. Local Database Access

Connect to your development database:

- **Host**: `localhost`
- **Port**: `5432`
- **User**: `neon`
- **Password**: `npg`
- **Database**: `neondb`

### 3. Hot Reload Development

Source code is mounted in development mode:

```bash
# Edit files locally, see changes immediately
# No need to rebuild container for code changes
```

## 🔒 Security Considerations

### Development

- Uses self-signed certificates for Neon Local
- Reduced security for development convenience
- Debug information enabled

### Production

- Full SSL certificate validation
- Read-only container filesystem
- Non-root user execution
- Resource limits enforced
- Security options enabled

## 📚 API Documentation

### Health Check

```bash
GET /health
```

### Authentication Endpoints

```bash
POST /auth/sign-up
POST /auth/sign-in
POST /auth/sign-out
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Use the development environment for testing
4. Submit a pull request

## 🐛 Troubleshooting

### Common Issues

#### Neon Local Connection Failed

```bash
# Check if Neon Local is running
docker-compose -f docker-compose.dev.yml ps neon-local

# View Neon Local logs
docker-compose -f docker-compose.dev.yml logs neon-local
```

#### Database Migration Errors

```bash
# Reset development environment
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

#### Port Already in Use

```bash
# Check what's using port 3000 or 5432
netstat -tulpn | grep :3000
netstat -tulpn | grep :5432

# Or change ports in docker-compose files
```

### Getting Help

1. Check the [Neon Documentation](https://neon.tech/docs)
2. Review container logs
3. Verify environment variables
4. Test database connectivity

## 📄 License

ISC License - see LICENSE file for details.

---

Made with ❤️ using Neon Database and Docker

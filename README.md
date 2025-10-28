# Acquisitions API

A modern Express.js application with authentication features, dockerized for both development and production environments using Neon Database.

## 🚀 Features

- **Authentication System**: Complete sign-up, sign-in, and sign-out functionality
- **Neon Database Integration**: Uses Neon Local for development and Neon Cloud for production
- **Docker Support**: Fully containerized with separate configurations for dev/prod
- **Security**: Helmet, CORS, JWT authentication, and bcrypt password hashing
- **Logging**: Winston-based structured logging
- **Validation**: Zod schema validation
- **Database ORM**: Drizzle ORM with PostgreSQL

## 📋 Prerequisites

- **Docker** and **Docker Compose**
- **Node.js** 20+ (for local development)
- **pnpm** (package manager)
- **Neon Account** (for production database)

## 🛠️ Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd acquisitions
pnpm install
```

### 2. Environment Configuration

Copy the example environment file and configure it:

```bash
cp env.development.example .env.development
```

Edit `.env.development` with your preferred settings:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgres://user:password@neon-local:5432/dbname
JWT_SECRET=your-development-jwt-secret-key-here
JWT_EXPIRES_IN=1d
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
HELMET_ENABLED=true
```

### 3. Start Development Environment

The development setup uses **Neon Local** running in Docker alongside your application:

```bash
# Start with Neon Local (recommended for development)
pnpm docker:dev

# Or start in detached mode
pnpm docker:dev:detached
```

This will:
- Start Neon Local proxy on port 5432
- Start your application on port 3000
- Automatically create ephemeral branches for development
- Enable hot reloading (if volume mounts are configured)

### 4. Database Migrations

Run database migrations to set up your schema:

```bash
# Generate migrations (if needed)
pnpm db:generate

# Apply migrations
pnpm db:migrate
```

### 5. Verify Setup

Check that everything is running:

```bash
# Check application health
curl http://localhost:3000/health

# Check API endpoint
curl http://localhost:3000/api

# View logs
pnpm docker:logs:dev
```

## 🏭 Production Deployment

### 1. Environment Configuration

Copy and configure the production environment:

```bash
cp env.production.example .env.production
```

Update `.env.production` with your production values:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-production-jwt-secret-key-here-make-it-very-secure
JWT_EXPIRES_IN=1d
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
HELMET_ENABLED=true
```

### 2. Deploy to Production

```bash
# Set environment variables
export DATABASE_URL="your-neon-cloud-database-url"
export JWT_SECRET="your-secure-production-secret"
export CORS_ORIGIN="https://yourdomain.com"

# Start production environment
pnpm docker:prod

# Or start in detached mode
pnpm docker:prod:detached
```

### 3. Production with Nginx (Optional)

For production deployments with a reverse proxy:

```bash
# Start with Nginx
docker-compose -f docker-compose.prod.yml --profile with-nginx up -d
```

## 🐳 Docker Commands

### Development Commands

```bash
# Start development environment
pnpm docker:dev

# Start in background
pnpm docker:dev:detached

# Stop development environment
pnpm docker:dev:down

# View development logs
pnpm docker:logs:dev

# Rebuild and start
docker-compose -f docker-compose.dev.yml up --build
```

### Production Commands

```bash
# Start production environment
pnpm docker:prod

# Start in background
pnpm docker:prod:detached

# Stop production environment
pnpm docker:prod:down

# View production logs
pnpm docker:logs:prod

# Rebuild and start
docker-compose -f docker-compose.prod.yml up --build
```

### General Docker Commands

```bash
# Build application image
pnpm docker:build

# View all running containers
docker ps

# View container logs
docker logs acquisitions-app-dev
docker logs acquisitions-app-prod

# Access container shell
docker exec -it acquisitions-app-dev sh
```

## 🗄️ Database Management

### Neon Local (Development)

Neon Local automatically handles:
- Ephemeral branch creation
- Database migrations
- Connection pooling
- Local PostgreSQL instance

### Neon Cloud (Production)

For production, ensure you have:
- A Neon Cloud database created
- Proper connection string with SSL
- Environment variables configured
- Database migrations applied

### Database Commands

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Open Drizzle Studio (database GUI)
pnpm db:studio
```

## 🔧 Configuration

### Environment Variables

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `NODE_ENV` | `development` | `production` | Environment mode |
| `PORT` | `3000` | `3000` | Application port |
| `DATABASE_URL` | Neon Local URL | Neon Cloud URL | Database connection |
| `JWT_SECRET` | Dev secret | Secure secret | JWT signing key |
| `JWT_EXPIRES_IN` | `1d` | `1d` | JWT expiration |
| `LOG_LEVEL` | `debug` | `info` | Logging level |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://yourdomain.com` | CORS origin |

### Docker Compose Services

#### Development (`docker-compose.dev.yml`)
- **neon-local**: Neon Local proxy (port 5432)
- **app**: Application container (port 3000)

#### Production (`docker-compose.prod.yml`)
- **app**: Application container (port 3000)
- **nginx**: Optional reverse proxy (ports 80/443)

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :3000
   lsof -i :5432
   
   # Kill the process or change ports in docker-compose
   ```

2. **Database Connection Issues**
   ```bash
   # Check Neon Local is running
   docker ps | grep neon-local
   
   # Check database connectivity
   docker exec -it acquisitions-app-dev pg_isready -h neon-local -p 5432
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   
   # Rebuild containers
   docker-compose -f docker-compose.dev.yml down
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Environment Variables Not Loading**
   ```bash
   # Check environment file exists
   ls -la .env*
   
   # Verify Docker is reading the file
   docker-compose -f docker-compose.dev.yml config
   ```

### Logs and Debugging

```bash
# View application logs
pnpm docker:logs:dev

# View specific service logs
docker-compose -f docker-compose.dev.yml logs app
docker-compose -f docker-compose.dev.yml logs neon-local

# Follow logs in real-time
docker-compose -f docker-compose.dev.yml logs -f app
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/sign-up` - User registration
- `POST /api/auth/sign-in` - User login
- `POST /api/auth/sign-out` - User logout

### Health Check

- `GET /health` - Application health status
- `GET /api` - API status

## 🔒 Security Considerations

### Development
- Uses development JWT secrets
- CORS allows localhost
- Debug logging enabled

### Production
- **Use strong JWT secrets**
- **Configure proper CORS origins**
- **Enable SSL/TLS**
- **Use environment variable injection**
- **Regular security updates**

## 📖 Additional Resources

- [Neon Local Documentation](https://neon.com/docs/local/neon-local)
- [Neon Cloud Documentation](https://neon.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Express.js Documentation](https://expressjs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with both development and production setups
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

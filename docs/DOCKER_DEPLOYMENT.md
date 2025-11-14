# Docker Deployment Guide - Cashlines

## Overview

Cashlines uses Docker Compose to orchestrate the application and PostgreSQL database. This guide covers Docker deployment and LXC container mapping.

## Quick Start - PostgreSQL Stack

### 1. Basic Deployment (Recommended)

```bash
# Clone and navigate to project
git clone <repo-url> cashlines
cd cashlines

# Create production environment
cp .env.production .env
# Edit .env with your PostgreSQL password and domain

# Start the stack
docker-compose up -d

# Check status
docker-compose ps
docker-compose logs -f cashlines

# Access the app
open http://localhost:3000
```

### 2. Database Setup

The Docker stack automatically:
- ✅ Creates PostgreSQL container
- ✅ Initializes database and user
- ✅ Runs Prisma migrations on startup
- ✅ Waits for DB health check before starting app

**No manual migration needed!** The entrypoint script handles it.

## Architecture

### Docker Compose Services

```
┌─────────────────────────────────────────┐
│      Docker Compose (Orchestration)     │
├─────────────────────────────────────────┤
│  cashlines-network (bridge network)     │
├────────────────┬────────────────────────┤
│  cashlines     │  postgres              │
│  (Next.js App) │  (Database)            │
│  :3000         │  :5432                 │
│                │  (internal only)       │
└────────────────┴────────────────────────┘
```

### Container Communication

- **cashlines → postgres**: Internal network, no port exposure needed
- **Host → cashlines**: Port 3000 (exposed)
- **Host → postgres**: Port 5432 (exposed for admin access only)

### Volumes

```
postgres-data/      # PostgreSQL data files (persistent)
  └─ var/lib/postgresql/data/

cashlines-logs/     # Application logs (persistent)
  └─ app/logs/
```

## Production Configuration

### 1. Security - Change Default Password

**NEVER use default credentials in production!**

```bash
# Generate secure password
openssl rand -base64 32

# Update docker-compose.yml
# Change: POSTGRES_PASSWORD: cashlines_secure_password
# To:     POSTGRES_PASSWORD: $(openssl rand -base64 32)

# Or use Docker secrets (recommended for swarm)
```

### 2. Environment Setup

```bash
# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://cashlines:YOUR_SECURE_PASS@postgres:5432/cashlines
NEXT_PUBLIC_APP_URL=https://your-domain.com
EOF

chmod 600 .env  # Restrict permissions
```

### 3. Persistent Data

Default setup uses named volumes managed by Docker:

```bash
# View volume information
docker volume ls | grep cashlines
docker volume inspect cashlines_postgres-data

# Backup PostgreSQL data
docker exec cashlines-postgres pg_dump -U cashlines cashlines > backup.sql

# Restore from backup
docker exec -i cashlines-postgres psql -U cashlines cashlines < backup.sql
```

## Database Management

### Connect to PostgreSQL

```bash
# From host (if port exposed)
psql -h localhost -U cashlines -d cashlines

# From Docker
docker exec -it cashlines-postgres psql -U cashlines -d cashlines

# Run SQL queries
docker exec cashlines-postgres psql -U cashlines -d cashlines -c "SELECT version();"
```

### Backup Strategies

**Daily automated backup:**
```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker exec cashlines-postgres pg_dump -U cashlines cashlines | gzip > $BACKUP_DIR/cashlines_$TIMESTAMP.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "cashlines_*.sql.gz" -mtime +30 -delete
EOF

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

## LXC Deployment (Alternative)

### LXC vs Docker

Docker uses **LXC** (or runc) as the low-level container runtime:

```
Your Application Code (same)
        ↓
docker-compose.yml (same)
        ↓
Docker Engine (abstraction layer)
        ↓
LXC / runc (container runtime)
        ↓
cgroups + namespaces (kernel isolation)
```

### Deploying to LXD (LXC Management)

LXD is the management system for LXC containers, similar to Docker Compose.

**Installation:**
```bash
# Ubuntu/Debian
sudo apt-get install lxd lxd-client

# Initialize LXD
sudo lxd init

# Add user to lxd group
sudo usermod -a -G lxd $USER
newgrp lxd
```

**Convert Docker Compose to LXD:**

```bash
# Option 1: Run Docker inside LXC container
lxc launch ubuntu:22.04 cashlines-docker
lxc exec cashlines-docker -- apt-get update
lxc exec cashlines-docker -- apt-get install -y docker.io docker-compose
lxc exec cashlines-docker -- docker-compose up -d

# Option 2: Manual setup (more direct)
# Create separate containers for app and DB
lxc launch ubuntu:22.04 cashlines-app
lxc launch ubuntu:22.04 cashlines-db

# Mount shared network volume
lxc network create cashlines-net
lxc network attach cashlines-net cashlines-app eth1
lxc network attach cashlines-net cashlines-db eth1
```

### Full LXC Setup Example

```bash
#!/bin/bash

# Create bridge network
lxc network create cashlines-net

# PostgreSQL container
lxc launch ubuntu:22.04 postgres-cashlines
lxc exec postgres-cashlines -- apt-get install -y postgresql

# Configure PostgreSQL
lxc exec postgres-cashlines -- sudo -u postgres createuser cashlines
lxc exec postgres-cashlines -- sudo -u postgres createdb -O cashlines cashlines

# Cashlines app container
lxc launch ubuntu:22.04 app-cashlines
lxc exec app-cashlines -- apt-get install -y nodejs npm curl

# Copy app to container
lxc file push -r ./cashlines app-cashlines/root/cashlines

# Install and run
lxc exec app-cashlines -- bash << 'EOF'
cd /root/cashlines
npm install
DATABASE_URL="postgresql://cashlines:password@postgres-cashlines/cashlines" npm run build
DATABASE_URL="postgresql://cashlines:password@postgres-cashlines/cashlines" npm start
EOF

# Expose port
lxc config device add app-cashlines http proxy listen=tcp:0.0.0.0:3000 connect=tcp:127.0.0.1:3000
```

## Monitoring & Logging

### View Logs

```bash
# Application logs
docker-compose logs -f cashlines

# Database logs
docker-compose logs -f postgres

# Specific time range
docker-compose logs --since 2025-11-14 --until 2025-11-15

# Export logs
docker-compose logs > logs.txt
```

### Health Checks

The Docker Compose includes health checks:

```bash
# Check service health
docker-compose ps

# STATUS shows:
# Up (healthy)     - Service is running and passed health check
# Up (unhealthy)   - Service running but failed health check
# Exited           - Service stopped

# Manual health check
docker-compose exec postgres pg_isready -U cashlines
```

## Scaling & Updates

### Update Application

```bash
# Build new image
docker-compose build

# Apply update
docker-compose up -d

# Verify migration ran
docker-compose logs cashlines | grep -i "migration\|prisma"

# Rollback if needed
git checkout previous-commit
docker-compose build
docker-compose up -d
```

### Database Upgrades

```bash
# PostgreSQL version upgrade (manual process)
# 1. Backup current data
docker exec cashlines-postgres pg_dump -U cashlines cashlines > backup.sql

# 2. Stop and remove postgres container
docker-compose down

# 3. Remove old postgres-data volume (CAREFUL!)
docker volume rm cashlines_postgres-data

# 4. Update docker-compose.yml postgres image version
# image: postgres:17-alpine  # Update version

# 5. Start new instance
docker-compose up -d

# 6. Restore data if needed
docker exec -i cashlines-postgres psql -U cashlines cashlines < backup.sql
```

## Troubleshooting

### PostgreSQL won't start

```bash
# Check logs
docker-compose logs postgres

# Common issues:
# - Volume permission: docker-compose down && docker volume rm cashlines_postgres-data
# - Port in use: lsof -i :5432 (change port in docker-compose.yml)
# - Corrupted data: Remove volume and restart
```

### App can't connect to database

```bash
# Test connection from app container
docker-compose exec cashlines psql -h postgres -U cashlines -d cashlines

# Check network
docker network inspect cashlines_cashlines-network

# Verify DATABASE_URL
docker-compose exec cashlines env | grep DATABASE_URL
```

### Slow performance

```bash
# Check container resources
docker stats

# View PostgreSQL stats
docker-compose exec postgres psql -U cashlines -c "SELECT * FROM pg_stat_statements LIMIT 10;"

# Increase memory allocation in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G
```

## Best Practices

✅ **DO:**
- Use PostgreSQL for production
- Store sensitive data in `.env` (not in code)
- Backup database regularly
- Use named volumes for persistence
- Monitor logs and health checks
- Run health checks before depending on services
- Use specific PostgreSQL versions (not `latest`)

❌ **DON'T:**
- Expose PostgreSQL port to internet
- Use default credentials
- Store backups in containers
- Run as root (Docker runs as `nextjs` user)
- Mount source code as volume in production

## Further Reading

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL in Docker Best Practices](https://www.postgresql.org/about/news/postgresql-11-support-ends-october-2023-2456/)
- [LXD Documentation](https://lxd.readthedocs.io/)
- [Compose File Specification](https://github.com/compose-spec/compose-spec)

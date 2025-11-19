# LXC/LXD Deployment Guide - Cashlines

## LXC vs Docker: Understanding the Difference

### Architecture Comparison

```
┌─────────────────────┐
│  Your Application   │
└─────────────────────┘
           ↓
      ┌────┴────┐
      ↓         ↓
   Docker    LXD
   (High-level container manager)
      ↓         ↓
   ┌────┴────┐
   ↓         ↓
  runc      LXC
  (Container runtime)
      ↓
  ├─ cgroups (resource limits)
  ├─ namespaces (isolation)
  ├─ seccomp (security)
  └─ AppArmor (MAC)
```

### Key Differences

| Aspect | Docker | LXC/LXD |
|--------|--------|---------|
| **Abstraction Level** | Image-based (App containers) | OS-based (System containers) |
| **Container Type** | Application-focused | Full OS environment |
| **Boot Time** | Seconds | Sub-second |
| **Resource Overhead** | Low | Ultra-low |
| **Use Case** | Microservices, Apps | VMs replacement, Full stacks |
| **Learning Curve** | Medium | Lower (similar to VMs) |
| **Native File Mounts** | Via volumes | Direct mount |

### When to Use Each

**Use Docker when:**
- ✅ Building microservices
- ✅ Need image distribution
- ✅ Running stateless workloads
- ✅ Team knows Docker ecosystem

**Use LXC/LXD when:**
- ✅ Self-hosting single app per container
- ✅ Want lightweight VMs
- ✅ Need direct file system access
- ✅ Running on resource-constrained hardware
- ✅ Prefer system container model

## Installation

### LXD Setup (Ubuntu/Debian)

```bash
# Install LXD
sudo apt-get update
sudo apt-get install -y lxd lxd-client

# Add user to lxd group (run once per user)
sudo usermod -aG lxd $USER
newgrp lxd

# Initialize LXD
lxd init --auto

# Verify installation
lxc version
lxc list  # Should show empty or existing containers
```

### Proxmox LXD Setup

If using Proxmox, LXD is pre-installed:

```bash
# Connect via SSH to Proxmox node
ssh root@proxmox.local

# Verify LXD
lxc version

# Create container through Proxmox UI or CLI
lxc launch ubuntu:22.04 cashlines-prod
```

## Deployment Strategy

### Option 1: Single Container (Simplest)

Run both app and database in one container (dev/small deployments only):

```bash
# Create container
lxc launch ubuntu:22.04 cashlines

# Enter container
lxc shell cashlines

# Inside container:
# Install Node.js
apt-get update
apt-get install -y nodejs npm postgresql postgresql-contrib curl

# Configure PostgreSQL
sudo -u postgres createuser cashlines
sudo -u postgres createdb -O cashlines cashlines
sudo -u postgres psql -c "ALTER USER cashlines WITH PASSWORD 'secure_password';"

# Enable PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Copy app and setup (from host)
# lxc file push -r ./cashlines cashlines/root/

# Inside container:
cd /root/cashlines
npm install
DATABASE_URL="postgresql://cashlines:secure_password@localhost/cashlines" npm run build
npm start  # or use systemd service
```

### Option 2: Separate Containers (Recommended)

Run app and database in separate containers (production-ready):

```bash
#!/bin/bash
set -e

# Step 1: Create bridge network
echo "Creating network..."
lxc network create cashlines-bridge || true

# Step 2: Create PostgreSQL container
echo "Creating PostgreSQL container..."
lxc launch ubuntu:22.04 cashlines-db --network cashlines-bridge

lxc exec cashlines-db -- apt-get update
lxc exec cashlines-db -- apt-get install -y postgresql postgresql-contrib

# Configure PostgreSQL
lxc exec cashlines-db -- sudo -u postgres psql << 'PSQL'
CREATE USER cashlines WITH PASSWORD 'your_secure_password';
CREATE DATABASE cashlines OWNER cashlines;
ALTER SYSTEM SET listen_addresses = '*';
PSQL

# Allow remote connections within network
lxc exec cashlines-db -- bash << 'BASH'
echo "host    cashlines    cashlines    10.0.0.0/8    md5" >> /etc/postgresql/*/main/pg_hba.conf
systemctl restart postgresql
BASH

# Step 3: Create app container
echo "Creating application container..."
lxc launch ubuntu:22.04 cashlines-app --network cashlines-bridge

lxc exec cashlines-app -- apt-get update
lxc exec cashlines-app -- apt-get install -y nodejs npm git curl

# Step 4: Deploy application
echo "Deploying application..."
lxc file push -r ./cashlines/ cashlines-app/root/cashlines/

lxc exec cashlines-app -- bash << 'BASH'
cd /root/cashlines
npm install
npm run build

# Get IP of DB container
DB_IP=$(ping -c 1 cashlines-db | grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | head -1)

# Create .env
cat > .env << ENV
NODE_ENV=production
DATABASE_URL="postgresql://cashlines:your_secure_password@$DB_IP:5432/cashlines"
NEXT_PUBLIC_APP_URL="http://cashlines-app.local"
ENV

# Run migrations
DATABASE_URL="postgresql://cashlines:your_secure_password@$DB_IP:5432/cashlines" npx prisma migrate deploy

# Create systemd service
cat > /etc/systemd/system/cashlines.service << 'SERVICE'
[Unit]
Description=Cashlines Application
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/cashlines
EnvironmentFile=/root/cashlines/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
SERVICE

systemctl daemon-reload
systemctl enable cashlines
systemctl start cashlines

echo "✅ Cashlines started"
BASH

# Step 5: Expose port
echo "Configuring port forwarding..."
lxc config device add cashlines-app http proxy listen=tcp:0.0.0.0:3000 connect=tcp:127.0.0.1:3000

echo "✅ Deployment complete!"
echo "Access application at http://localhost:3000"
echo ""
echo "Useful commands:"
echo "  lxc list                                  # List containers"
echo "  lxc shell cashlines-app                   # Enter app container"
echo "  lxc shell cashlines-db                    # Enter DB container"
echo "  lxc logs cashlines-app -f                 # View app logs"
echo "  lxc delete cashlines-app --force          # Delete container"
```

## Container Management

### Basic Operations

```bash
# List containers
lxc list

# Create container
lxc launch ubuntu:22.04 mycontainer

# Start/Stop/Restart
lxc start mycontainer
lxc stop mycontainer
lxc restart mycontainer

# Enter container shell
lxc shell mycontainer
lxc exec mycontainer -- bash

# Copy files to/from container
lxc file push /local/path mycontainer/root/path/
lxc file pull mycontainer/root/path /local/path

# View logs
lxc logs mycontainer
lxc logs mycontainer -f  # Follow

# Delete container
lxc delete mycontainer --force
```

### Networking

```bash
# Create bridge network
lxc network create cashlines-net

# List networks
lxc network list

# Attach container to network
lxc network attach cashlines-net mycontainer eth1

# Get container IP
lxc list mycontainer -c n4

# Port forwarding (host to container)
lxc config device add mycontainer http proxy listen=tcp:0.0.0.0:3000 connect=tcp:127.0.0.1:3000

# Delete network (when not in use)
lxc network delete cashlines-net
```

### Resource Management

```bash
# Set memory limit
lxc config set mycontainer limits.memory 2GB

# Set CPU limit
lxc config set mycontainer limits.cpu 2

# Set disk limit (root filesystem)
lxc config set mycontainer limits.disk.root 20GB

# View current limits
lxc config show mycontainer | grep limits

# Mount directory from host
lxc config device add mycontainer storage disk source=/host/path path=/container/path
```

## Database Management

### PostgreSQL in LXC

```bash
# Connect to PostgreSQL (from host)
DB_IP=$(lxc list cashlines-db -c n4 --format csv | tail -1)
psql -h $DB_IP -U cashlines -d cashlines

# From inside DB container
lxc exec cashlines-db -- sudo -u postgres psql -d cashlines

# Backup
lxc exec cashlines-db -- sudo -u postgres pg_dump cashlines > backup.sql

# Restore
lxc exec cashlines-db -- sudo -u postgres psql cashlines < backup.sql

# View PostgreSQL status
lxc exec cashlines-db -- systemctl status postgresql
```

## Monitoring

### Container Stats

```bash
# Real-time stats (all containers)
lxc monitor --type=metrics

# Memory usage
lxc list -c n,m

# Disk usage
lxc list -c n,d

# Network usage
lxc network stats cashlines-net
```

### Application Logs

```bash
# Follow application logs
lxc logs cashlines-app -f

# View specific time range
lxc logs cashlines-app --since "30m"

# Logs with context
lxc logs cashlines-app | tail -100 | less

# From inside container
lxc shell cashlines-app -- journalctl -u cashlines -f
```

## Backup & Restore

### Container Snapshots

```bash
# Create snapshot
lxc snapshot cashlines-app daily-backup

# List snapshots
lxc info cashlines-app | grep Snapshots

# Restore from snapshot
lxc restore cashlines-app daily-backup

# Export snapshot to file
lxc publish cashlines-app/daily-backup --alias cashlines-backup
lxc image export cashlines-backup ./
```

### Database Backup

```bash
#!/bin/bash
# Daily backup script

BACKUP_DIR="/backups/cashlines"
DB_CONTAINER="cashlines-db"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
lxc exec $DB_CONTAINER -- sudo -u postgres pg_dump cashlines | \
  gzip > $BACKUP_DIR/cashlines_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "cashlines_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup complete: $BACKUP_DIR/cashlines_$TIMESTAMP.sql.gz"

# Add to crontab:
# 0 2 * * * /path/to/backup-script.sh >> /var/log/cashlines-backup.log 2>&1
```

## Comparison: Docker Compose vs LXC

### Docker Compose

```bash
# Deploy
docker-compose up -d

# Scale
docker-compose up -d --scale worker=3

# Update
docker-compose build && docker-compose up -d

# Logs
docker-compose logs -f
```

### LXC Equivalent

```bash
# Deploy
# (use script above, or Ansible/Terraform)

# Scale
# (Create additional containers manually)
for i in 1 2 3; do
  lxc launch ubuntu:22.04 worker-$i
done

# Update
lxc shell cashlines-app
# cd /root/cashlines && git pull && npm run build

# Logs
lxc logs cashlines-app -f
```

## Performance Characteristics

### Resource Overhead

```
┌──────────┬────────────┬──────────────┐
│ Aspect   │ Docker     │ LXC          │
├──────────┼────────────┼──────────────┤
│ Memory   │ 50-100MB   │ 20-30MB      │
│ Boot     │ 2-5s       │ 0.1-0.5s     │
│ CPU      │ Moderate   │ Minimal      │
│ Disk     │ 2-5GB      │ 500MB-1GB    │
└──────────┴────────────┴──────────────┘
```

### Cashlines Specific

**Docker Compose stack:**
- Memory: ~600MB (app + postgres)
- Startup: ~10 seconds
- Image size: ~500MB
- Ideal for: Cloud deployments, managed services

**LXC stack:**
- Memory: ~300MB (app + postgres)
- Startup: ~2 seconds
- Disk: ~2GB per container
- Ideal for: Self-hosted, dedicated servers, Proxmox

## Migration Path

If you start with Docker but want to move to LXC:

```bash
# Export data from Docker
docker exec cashlines-postgres pg_dump -U cashlines cashlines > dump.sql

# In LXC PostgreSQL container
lxc exec cashlines-db -- psql -U cashlines cashlines < dump.sql

# Update connection strings
# Change: postgres:5432 → cashlines-db (container name in network)

# Test and migrate
```

## Conclusion

**For Cashlines:**
- **Docker Compose**: Good for development, cloud hosting (AWS, Heroku, DigitalOcean)
- **LXC/LXD**: Better for self-hosting on dedicated hardware or Proxmox
- **Both support**: PostgreSQL, persistent data, networking, backups

Choose based on your infrastructure and team expertise!

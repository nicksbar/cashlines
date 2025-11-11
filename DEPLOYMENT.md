# ✅ Deployment & Production Checklist

> Everything you need to deploy Cashlines to production

---

## 📋 Pre-Deployment Verification

### Code Quality
- [x] All 111 tests passing
- [x] No TypeScript errors
- [x] No ESLint warnings
- [x] Code reviewed and documented
- [x] Git history clean

### Features Complete
- [x] Income tracking with deduction breakdown
- [x] Account management (CRUD)
- [x] Transaction tracking (create/delete)
- [x] Bulk CSV import (3-step workflow)
- [x] Dashboard analytics (6 metrics)
- [x] All API endpoints working

### Documentation Complete
- [x] README.md - Project overview
- [x] QUICK_START.md - Setup instructions
- [x] USER_WORKFLOW.md - User guide
- [x] IMPORT_EXAMPLES.md - CSV examples
- [x] TESTING.md - Test documentation
- [x] Deployment guides ready

### Security Review
- [x] SQLite database (local storage)
- [x] No external API calls
- [x] Input validation on all endpoints
- [x] No secrets in code
- [x] Error messages don't leak sensitive info

---

## 🚀 Deployment Options

### Option 1: Docker (Recommended)

#### Prerequisites
- Docker installed
- Docker Compose installed

#### Steps
```bash
# 1. Clone repository
git clone <repo-url>
cd /workspaces/cashlines

# 2. Build Docker image
docker build -t cashlines:latest .

# 3. Run with Docker Compose
docker-compose up -d

# 4. Access app
# http://localhost:3000

# 5. Stop
docker-compose down
```

#### Docker Compose File
```yaml
version: '3.8'
services:
  cashlines:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./prisma/:/app/prisma/
    environment:
      NODE_ENV: production
      DATABASE_URL: file:./dev.db
```

### Option 2: Traditional Server

#### Prerequisites
- Node.js 18+
- npm or yarn
- SQLite (automatic)

#### Steps
```bash
# 1. Clone repository
git clone <repo-url>
cd /workspaces/cashlines

# 2. Install dependencies
npm install

# 3. Setup database
npm run prisma migrate deploy

# 4. Build for production
npm run build

# 5. Start production server
npm start

# 6. Access app
# http://localhost:3000 (or your domain)
```

#### Running with PM2 (Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start "npm start" --name "cashlines"

# View logs
pm2 logs cashlines

# Stop application
pm2 stop cashlines

# Restart on system reboot
pm2 startup
pm2 save
```

### Option 3: Railway, Render, or Vercel

#### Steps (General)
1. Push code to GitHub
2. Connect GitHub repo to deployment platform
3. Set environment variables (if needed)
4. Configure build command: `npm run build`
5. Configure start command: `npm start`
6. Deploy

#### Notes
- Vercel: Best for frontend, may need serverless DB
- Railway: Great for full-stack, has PostgreSQL option
- Render: Good balance, free tier available

### Option 4: Home Server or NAS

#### Requirements
- Home network with port forwarding
- Domain name (optional)
- Dynamic DNS (if IP changes)

#### Steps
```bash
# 1-4. Same as Traditional Server above

# 5. For remote access, set up reverse proxy
# Use Nginx, Apache, or Caddy

# Example with Caddy:
caddy reverse-proxy --from your-domain.com --to localhost:3000
```

---

## 🔧 Configuration for Production

### Environment Variables
Create `.env.local` file:
```env
# Database
DATABASE_URL="file:./prisma/prod.db"

# Next.js
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://yourdomain.com"

# Optional: Analytics/Monitoring
# SENTRY_DSN="your-sentry-url"
```

### Database Backup
```bash
# Backup database before production
cp prisma/prod.db prisma/prod.db.backup.$(date +%Y%m%d)

# Restore from backup if needed
cp prisma/prod.db.backup.20251111 prisma/prod.db
```

### Performance Optimization
```bash
# Enable compression
npm install compression

# Enable caching headers
# (Already configured in next.config.js)

# Build for production
npm run build

# Test production build locally
npm run build
npm start
```

---

## 🔐 Security Hardening

### Network Security
- [ ] Use HTTPS (required for production)
- [ ] Configure CORS if needed
- [ ] Use strong passwords (if adding auth)
- [ ] Enable firewall rules
- [ ] Whitelist IP addresses (if applicable)

### Application Security
- [ ] Validate all inputs (already done with Zod)
- [ ] Sanitize outputs (already done)
- [ ] Enable CSRF protection
- [ ] Set secure headers
- [ ] Keep dependencies updated

### Database Security
- [ ] Regular backups (daily recommended)
- [ ] Backup verification (test restore)
- [ ] Encrypted backups (if cloud storage)
- [ ] Access controls
- [ ] Data retention policies

### Monitoring
- [ ] Set up error logging
- [ ] Monitor server resources
- [ ] Log important transactions
- [ ] Set up alerts for errors
- [ ] Regular security audits

---

## 📊 Production Checklist

### Pre-Launch
- [ ] Database initialized and seeded
- [ ] All tests passing
- [ ] Production build created
- [ ] Environment variables set
- [ ] HTTPS certificate obtained
- [ ] Domain configured
- [ ] DNS propagated
- [ ] Backups configured
- [ ] Monitoring enabled

### Post-Launch
- [ ] App accessible at URL
- [ ] Dashboard loads correctly
- [ ] All pages working
- [ ] API endpoints responding
- [ ] CSV import tested
- [ ] Database persisting data
- [ ] Error logging working
- [ ] Performance acceptable

### Ongoing
- [ ] Daily/weekly backups
- [ ] Weekly health checks
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] Continuous monitoring
- [ ] User feedback collection

---

## 🚨 Troubleshooting

### App won't start
```bash
# Check dependencies installed
npm install

# Check database initialized
npm run prisma migrate deploy

# View error logs
npm run dev 2>&1 | tee app.log
```

### Database errors
```bash
# Reset database (WARNING: deletes data!)
npm run prisma migrate reset

# View database
npm run prisma studio

# Check database file
ls -lh prisma/prod.db
```

### High memory usage
```bash
# Check processes
ps aux | grep node

# Restart service
pm2 restart cashlines

# Check logs for memory leaks
pm2 logs cashlines | head -100
```

### Performance issues
```bash
# Build for production (not dev mode)
npm run build
npm start

# Check database indexes
npm run prisma studio

# Monitor server resources
top -p $(pidof node)
```

---

## 📈 Scaling Considerations

### Current Limitations
- **SQLite**: Single-file database, works for single user
- **File-based**: Suitable for < 1GB data
- **Memory**: Standard Node.js memory limits

### To Scale Beyond Current Setup

#### Option 1: Upgrade Database
```javascript
// Switch from SQLite to PostgreSQL
DATABASE_URL="postgresql://user:password@localhost:5432/cashlines"

// 1. Install Postgres driver
npm install @prisma/client@latest

// 2. Update DATABASE_URL in env

// 3. Run migration
npm run prisma migrate deploy
```

#### Option 2: Separate Database Server
- Use managed PostgreSQL (AWS RDS, Railway, Vercel Postgres)
- Keep application stateless (easier to scale)
- Enable connection pooling

#### Option 3: Add Caching Layer
- Install Redis: `npm install redis`
- Cache dashboard calculations
- Cache user preferences
- Cache API responses

#### Option 4: Deploy Multiple Instances
- Use load balancer (Nginx)
- Point to shared database (PostgreSQL)
- Scale horizontally as needed

---

## 📚 Deployment Resources

### Docker
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

### Node.js Hosting
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)

### Process Management
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

### Database
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/)
- [PostgreSQL Setup](https://www.postgresql.org/docs/)

### HTTPS/Domains
- [Let's Encrypt (Free SSL)](https://letsencrypt.org/)
- [Caddy Web Server](https://caddyserver.com/)
- [Nginx Documentation](https://nginx.org/en/docs/)

---

## ✅ Launch Day Checklist

```
3 Weeks Before
  [ ] Review all code and tests
  [ ] Finalize documentation
  [ ] Plan backup strategy
  [ ] Test disaster recovery

1 Week Before
  [ ] Prepare production database
  [ ] Configure domain
  [ ] Set up monitoring
  [ ] Create backup schedule

1 Day Before
  [ ] Final security audit
  [ ] Test all features
  [ ] Verify backups work
  [ ] Prepare rollback plan

Launch Day
  [ ] Deploy to production
  [ ] Verify all pages load
  [ ] Test CSV import
  [ ] Check database backup
  [ ] Monitor error logs
  [ ] Announce availability

1 Week After
  [ ] Monitor for issues
  [ ] Collect user feedback
  [ ] Optimize performance
  [ ] Review security logs
```

---

## 🎯 Success Criteria

Your Cashlines deployment is successful when:

✅ App loads without errors  
✅ All pages are accessible  
✅ CSV import works  
✅ Dashboard shows correct data  
✅ Database persists transactions  
✅ Backups run automatically  
✅ Error logging works  
✅ Performance is acceptable (< 1 second page load)  
✅ Users can track income  
✅ Users can bulk import expenses  

---

## 📞 Support & Troubleshooting

### Need Help?

1. **Check logs first**
   ```bash
   npm run dev 2>&1 | tee debug.log
   tail -f debug.log
   ```

2. **Check tests**
   ```bash
   npm test
   ```

3. **Review documentation**
   - [QUICK_START.md](./QUICK_START.md) - Setup
   - [STATUS.md](./STATUS.md) - Known issues
   - [TESTING.md](./TESTING.md) - Test details

4. **Check GitHub issues**
   - Look for similar problems
   - Check closed issues for solutions

---

## 📝 Post-Deployment Notes

### Backup Strategy
- **Daily**: Automated backups to storage
- **Weekly**: Full backup + verification
- **Monthly**: Archive important periods
- **Disaster Recovery**: Test restore monthly

### Monitoring
- **Error Tracking**: Log all errors
- **Performance**: Monitor page load times
- **Database**: Monitor query times
- **Storage**: Monitor disk space

### Maintenance
- **Updates**: Monthly dependency updates
- **Optimization**: Quarterly performance review
- **Security**: Quarterly security audit
- **Features**: Gather user feedback

---

## 🎉 Congratulations!

You now have everything needed to deploy Cashlines to production.

**Next Steps:**
1. Choose deployment option
2. Follow deployment instructions
3. Verify everything working
4. Set up backups and monitoring
5. Invite users!

---

**Questions? Check the full documentation at [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)**

**Need to add features? See [STATUS.md](./STATUS.md) for next priorities**

**Built with ❤️ for self-hosted money tracking**

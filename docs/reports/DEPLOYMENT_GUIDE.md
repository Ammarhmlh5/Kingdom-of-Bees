# 🚀 Kingdom of Bees - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- Git
- npm or yarn

---

## 🔧 Backend Deployment

### 1. Environment Setup

Create `.env` file in `backend/`:

```env
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=postgresql://user:password@host:5432/kingdom_of_bees

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret-min-32-characters
REFRESH_TOKEN_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# Logging
LOG_LEVEL=info
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Generate Prisma Client

```bash
npm run prisma:generate
```

### 4. Run Database Migrations

```bash
npm run prisma:migrate
```

### 5. Seed Database (Optional)

```bash
npx tsx src/seed.ts
```

### 6. Build

```bash
npm run build
```

### 7. Start Production Server

```bash
npm start
```

Or use PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name kingdom-backend
pm2 save
pm2 startup
```

---

## 🌐 Frontend Web Deployment

### 1. Environment Setup

Create `.env` in `frontend-web/`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Install & Build

```bash
cd frontend-web
npm install
npm run build
```

### 3. Deploy

Deploy the `dist/` folder to:
- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **Static hosting:** Upload `dist/` contents

---

## 👨‍💼 Admin Panel Deployment

### 1. Environment Setup

Create `.env` in `admin-panel/`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

### 2. Install & Build

```bash
cd admin-panel
npm install
npm run build
```

### 3. Deploy

Same as frontend-web.

---

## 🐳 Docker Deployment (Recommended)

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kingdom_of_bees
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: your-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:your-password@postgres:5432/kingdom_of_bees
      JWT_SECRET: your-jwt-secret
      REFRESH_TOKEN_SECRET: your-refresh-secret
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### Run with Docker

```bash
docker-compose up -d
```

---

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Set up firewall rules
- [ ] Regular security updates

---

## 📊 Monitoring

### PM2 Monitoring

```bash
pm2 monit
pm2 logs kingdom-backend
```

### Database Monitoring

```bash
# Check connections
SELECT * FROM pg_stat_activity;

# Database size
SELECT pg_size_pretty(pg_database_size('kingdom_of_bees'));
```

---

## 🔄 Updates & Maintenance

### Update Backend

```bash
cd backend
git pull
npm install
npm run build
pm2 restart kingdom-backend
```

### Database Migrations

```bash
npm run prisma:migrate
```

### Backup Database

```bash
pg_dump -U postgres kingdom_of_bees > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql -U postgres kingdom_of_bees < backup_20260101.sql
```

---

## 🆘 Troubleshooting

### Backend won't start

1. Check logs: `pm2 logs kingdom-backend`
2. Verify DATABASE_URL is correct
3. Ensure port 4000 is available
4. Check Prisma client is generated

### Database connection issues

1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Ensure database exists
4. Check firewall rules

### CORS errors

1. Verify CORS_ORIGIN in .env
2. Check frontend API_URL
3. Ensure protocol matches (http/https)

---

## 📞 Support

For issues, contact: support@kingdom-of-bees.com

---

**Last Updated:** 2026-01-01  
**Version:** 1.0.0

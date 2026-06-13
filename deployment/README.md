# QuickCommerce AWS Deployment Files

This directory contains all configuration files and scripts needed to deploy QuickCommerce to AWS Free Tier.

---

## 📁 Files Overview

| File | Purpose | Usage |
|------|---------|-------|
| `AWS_DEPLOYMENT_GUIDE.md` | Complete step-by-step deployment guide | Read first for detailed instructions |
| `QUICK_START.md` | Condensed quick reference guide | For experienced users / quick lookup |
| `ec2-setup.sh` | Automated EC2 setup script | Run on fresh Ubuntu EC2 instance |
| `quickcommerce.service` | Systemd service configuration | Controls FastAPI backend service |
| `nginx-quickcommerce.conf` | Nginx reverse proxy config | Routes HTTP traffic to backend |

---

## 🚀 Quick Deployment Steps

### 1. Database (RDS)
- Create PostgreSQL RDS instance via AWS Console
- Configure security group
- Save endpoint and credentials

### 2. Backend (EC2)
```bash
# Upload and run setup script
scp -i key.pem ec2-setup.sh ubuntu@EC2_IP:~/
ssh -i key.pem ubuntu@EC2_IP
chmod +x ec2-setup.sh
./ec2-setup.sh

# Upload backend code
scp -i key.pem -r ../backend/ ubuntu@EC2_IP:/var/www/quickcommerce/

# Configure and start
cd /var/www/quickcommerce/backend
nano .env  # Add credentials
source venv/bin/activate
python migrate_db.py
sudo systemctl start quickcommerce
```

### 3. Frontend (Amplify)
- Push code to GitHub
- Connect repo in AWS Amplify Console
- Add `VITE_API_URL` environment variable
- Deploy

---

## 📋 Configuration Files Explained

### `ec2-setup.sh`
Automated script that:
- Installs Python 3.11, PostgreSQL client, Nginx
- Creates application directory structure
- Sets up Python virtual environment
- Configures systemd service
- Configures Nginx reverse proxy

**Usage:**
```bash
chmod +x ec2-setup.sh
./ec2-setup.sh
```

### `quickcommerce.service`
Systemd service file for running FastAPI backend as a system service.

**Key configurations:**
- Runs as `ubuntu` user
- Auto-restarts on failure
- Logs to systemd journal
- Runs uvicorn with 2 workers

**Installation:**
```bash
sudo cp quickcommerce.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable quickcommerce
sudo systemctl start quickcommerce
```

**Management:**
```bash
sudo systemctl status quickcommerce   # Check status
sudo systemctl restart quickcommerce  # Restart
sudo journalctl -u quickcommerce -f   # View logs
```

### `nginx-quickcommerce.conf`
Nginx reverse proxy configuration.

**Features:**
- Proxies port 80 → uvicorn on 127.0.0.1:8080
- Security headers
- Gzip compression
- WebSocket support (for future use)
- Long timeout for AI requests

**Installation:**
```bash
sudo cp nginx-quickcommerce.conf /etc/nginx/sites-available/quickcommerce
sudo ln -s /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔧 Environment Variables

### Backend `.env` (Production)

Required variables for EC2 deployment:

```bash
# AWS Bedrock
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1

# JWT Security
SECRET_KEY=your-strong-random-secret-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Environment
ENVIRONMENT=production

# Database
DATABASE_URL=postgresql://dbadmin:password@rds-endpoint.region.rds.amazonaws.com:5432/quickcommerce
```

### Frontend Environment (Amplify)

Set in AWS Amplify Console → Environment variables:

```
VITE_API_URL=http://YOUR_EC2_PUBLIC_IP/api
```

Or for custom domain:
```
VITE_API_URL=https://api.yourdomain.com/api
```

---

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   AWS Amplify   │ (Frontend Hosting)
│  React + Vite   │
└────────┬────────┘
         │ HTTPS
         │
         ▼
┌─────────────────┐
│   Amazon EC2    │ (Backend Server)
│  Ubuntu 22.04   │
│                 │
│  ┌──────────┐  │
│  │  Nginx   │  │ :80 → :8080
│  └─────┬────┘  │
│        │       │
│  ┌─────▼────┐ │
│  │ Uvicorn  │ │ FastAPI + SQLAlchemy
│  └─────┬────┘ │
└────────┼───────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌────────────────┐  ┌──────────────┐
│  Amazon RDS    │  │ AWS Bedrock  │
│  PostgreSQL    │  │  Nova Micro  │
│  (Database)    │  │    (LLM)     │
└────────────────┘  └──────────────┘
```

---

## 🔍 Verification & Testing

### Backend Health Check
```bash
# On EC2
curl http://localhost/health

# From external
curl http://YOUR_EC2_IP/health
```

### Database Connection Test
```bash
# On EC2
cd /var/www/quickcommerce/backend
source venv/bin/activate
python -c "from database import engine; print(engine.connect())"
```

### Service Status
```bash
sudo systemctl status quickcommerce
sudo systemctl status nginx
```

### View Logs
```bash
# Application logs
sudo journalctl -u quickcommerce -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 🛠️ Common Maintenance Tasks

### Update Backend Code
```bash
# From local machine
scp -i key.pem -r backend/ ubuntu@EC2_IP:/var/www/quickcommerce/

# On EC2
sudo systemctl restart quickcommerce
```

### Update Dependencies
```bash
cd /var/www/quickcommerce/backend
source venv/bin/activate
pip install -r requirements.txt --upgrade
sudo systemctl restart quickcommerce
```

### Database Backup
```bash
# Export database
pg_dump -h RDS_ENDPOINT -U dbadmin quickcommerce > backup_$(date +%Y%m%d).sql

# Restore database
psql -h RDS_ENDPOINT -U dbadmin quickcommerce < backup_20240101.sql
```

### View Database
```bash
# Connect to RDS
psql -h RDS_ENDPOINT -U dbadmin -d quickcommerce

# Useful commands:
\dt              # List tables
\d users         # Describe users table
SELECT * FROM users LIMIT 5;
```

---

## 🐛 Troubleshooting

### Problem: Backend returns 502 Bad Gateway

**Solution:**
```bash
# Check if service is running
sudo systemctl status quickcommerce

# If not running, check logs
sudo journalctl -u quickcommerce -n 50

# Common fixes:
# 1. Restart service
sudo systemctl restart quickcommerce

# 2. Check .env file
cat /var/www/quickcommerce/backend/.env

# 3. Test database connection
cd /var/www/quickcommerce/backend
source venv/bin/activate
python -c "from database import engine; print(engine.connect())"
```

### Problem: Can't connect to RDS

**Solution:**
```bash
# Test direct connection
psql -h RDS_ENDPOINT -U dbadmin -d quickcommerce

# If fails, check:
# 1. RDS security group allows EC2
# 2. DATABASE_URL in .env is correct
# 3. RDS is in "Available" state (AWS Console)
```

### Problem: Frontend CORS errors

**Solution:**
```bash
# Update backend/main.py
nano /var/www/quickcommerce/backend/main.py

# Add Amplify URL to allow_origins list
# Example: "https://main.d123abc.amplifyapp.com"

sudo systemctl restart quickcommerce
```

### Problem: Amplify build fails

**Solutions:**
1. Check `amplify.yml` syntax in root directory
2. Verify `package.json` has `"build": "vite build"`
3. Check build logs in Amplify Console
4. Ensure `VITE_API_URL` env var is set

---

## 📊 Monitoring & Logs

### Application Logs
```bash
# Real-time logs
sudo journalctl -u quickcommerce -f

# Last 100 lines
sudo journalctl -u quickcommerce -n 100

# Logs from last hour
sudo journalctl -u quickcommerce --since "1 hour ago"

# Logs with specific level
sudo journalctl -u quickcommerce -p err
```

### System Monitoring
```bash
# Install htop
sudo apt install htop

# Monitor resources
htop

# Disk usage
df -h

# Memory usage
free -h
```

### Nginx Logs
```bash
# Access logs (all requests)
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# Search for errors
sudo grep "error" /var/log/nginx/error.log
```

---

## 🔐 Security Best Practices

- [ ] Use strong passwords for RDS
- [ ] Restrict RDS security group (only EC2, not 0.0.0.0/0)
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Rotate JWT secret keys
- [ ] Keep system updated: `sudo apt update && sudo apt upgrade`
- [ ] Use IAM roles instead of access keys (advanced)
- [ ] Enable CloudWatch monitoring
- [ ] Set up billing alerts
- [ ] Regular database backups
- [ ] Restrict SSH to your IP only

---

## 💰 Cost Management

### Free Tier Limits
- **EC2**: 750 hours/month (t2.micro or t3.micro)
- **RDS**: 750 hours/month (db.t2.micro or db.t3.micro), 20 GB storage
- **Amplify**: 1000 build minutes/month, 15 GB served/month
- **Data Transfer**: 100 GB/month (combined)

### Stop Services When Not Needed
```bash
# Stop EC2 (preserves data, no compute charges)
aws ec2 stop-instances --instance-ids i-xxxxx

# Stop RDS (preserves data, no compute charges)
aws rds stop-db-instance --db-instance-identifier quickcommerce-db

# Note: RDS auto-starts after 7 days
```

### Monitor Costs
- AWS Console → Billing Dashboard
- Set up billing alerts ($1, $5, $10)
- Review cost explorer monthly

---

## 📚 Additional Resources

- [AWS Free Tier FAQ](https://aws.amazon.com/free/free-tier-faqs/)
- [FastAPI Deployment Best Practices](https://fastapi.tiangolo.com/deployment/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [Systemd Service Guide](https://www.freedesktop.org/software/systemd/man/systemd.service.html)

---

## 🆘 Need Help?

1. Check `AWS_DEPLOYMENT_GUIDE.md` for detailed steps
2. Review service logs: `sudo journalctl -u quickcommerce -f`
3. Verify AWS service status
4. Check AWS documentation for specific services

---

**Good luck with your deployment! 🚀**

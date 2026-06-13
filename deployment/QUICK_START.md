# QuickCommerce AWS Deployment - Quick Start

This is a condensed version for quick reference. See `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions.

---

## Pre-Deployment Checklist

- [ ] AWS Account created
- [ ] AWS CLI installed (optional but recommended)
- [ ] Git repository with your code
- [ ] EC2 key pair created and downloaded

---

## 1. Database: Amazon RDS PostgreSQL

### Create RDS Instance

1. AWS Console → RDS → Create database
2. Settings:
   - Engine: PostgreSQL 15.x
   - Template: Free tier
   - Instance: db.t3.micro
   - Storage: 20 GB
   - Public access: Yes (temporary)
   - Database name: `quickcommerce`
3. Save endpoint and credentials

### Security Group

- Inbound: PostgreSQL (5432) from EC2 security group

---

## 2. Backend: Amazon EC2

### Launch EC2

1. AWS Console → EC2 → Launch Instance
2. Settings:
   - AMI: Ubuntu 22.04 LTS
   - Type: t2.micro or t3.micro
   - Security: Allow SSH (22), HTTP (80), HTTPS (443)
   - Storage: 20 GB

### Deploy Backend

```bash
# Connect to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Upload setup script
# From local: scp -i "your-key.pem" deployment/ec2-setup.sh ubuntu@YOUR_EC2_IP:~/

# Run setup
chmod +x ec2-setup.sh
./ec2-setup.sh

# Upload backend code
# From local: scp -i "your-key.pem" -r backend/ ubuntu@YOUR_EC2_IP:/var/www/quickcommerce/

# Configure environment
cd /var/www/quickcommerce/backend
nano .env
# Add:
# AWS_ACCESS_KEY_ID=xxx
# AWS_SECRET_ACCESS_KEY=xxx
# AWS_REGION=us-east-1
# SECRET_KEY=your-strong-secret
# ENVIRONMENT=production
# DATABASE_URL=postgresql://dbadmin:password@rds-endpoint:5432/quickcommerce

# Initialize database
source venv/bin/activate
python -c "from backend.database import engine; from backend.models import Base; Base.metadata.create_all(bind=engine)"

# Start service
sudo systemctl start quickcommerce
sudo systemctl status quickcommerce

# Start Nginx
sudo systemctl restart nginx

# Test
curl http://localhost/health
```

---

## 3. Frontend: AWS Amplify

### Prepare Repo

```bash
# Commit and push to GitHub
git add .
git commit -m "AWS deployment ready"
git push origin main
```

### Deploy on Amplify

1. AWS Console → Amplify → New app → Host web app
2. Connect to GitHub repository
3. Branch: `main`
4. Build settings: Auto-detected from `amplify.yml`
5. Environment variables:
   - `VITE_API_URL` = `http://YOUR_EC2_PUBLIC_IP/api`
6. Save and deploy

### Update Backend CORS

```bash
# SSH into EC2
nano /var/www/quickcommerce/backend/main.py

# Add your Amplify URL to allow_origins:
# "https://main.xxxxx.amplifyapp.com"

sudo systemctl restart quickcommerce
```

---

## Quick Commands Reference

### EC2 Management

```bash
# Connect
ssh -i "key.pem" ubuntu@EC2_IP

# Check backend status
sudo systemctl status quickcommerce

# View logs
sudo journalctl -u quickcommerce -f

# Restart backend
sudo systemctl restart quickcommerce

# Restart Nginx
sudo systemctl restart nginx
```

### Database

```bash
# Connect to RDS
psql -h RDS_ENDPOINT -U dbadmin -d quickcommerce

# Check tables
\dt

# View users
SELECT * FROM users;
```

### Monitoring

```bash
# System resources
htop

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Application logs
sudo journalctl -u quickcommerce --since "1 hour ago"
```

---

## Test Deployment

1. **Backend**: `http://YOUR_EC2_IP/docs`
2. **Frontend**: `https://main.xxxxx.amplifyapp.com`
3. **Health**: `curl http://YOUR_EC2_IP/health`

---

## Troubleshooting Quick Fixes

### Backend won't start
```bash
sudo journalctl -u quickcommerce -n 50
# Check .env file, reinstall dependencies
```

### Database connection error
```bash
# Test connection
psql -h RDS_ENDPOINT -U dbadmin -d quickcommerce
# Check security group
```

### 502 Bad Gateway
```bash
sudo systemctl restart quickcommerce
sudo systemctl restart nginx
```

### CORS errors
```bash
# Add Amplify URL to backend/main.py allow_origins
sudo systemctl restart quickcommerce
```

---

## File Structure Summary

```
QuickCommerce/
├── backend/
│   ├── .env                    # Production environment variables
│   ├── config.py               # ✅ Updated for RDS
│   ├── database.py             # ✅ Updated for PostgreSQL
│   ├── requirements.txt        # ✅ Added psycopg2-binary
│   └── ...
├── frontend/
│   ├── src/services/api.js     # ✅ Updated for env vars
│   ├── vite.config.js          # ✅ Updated for production
│   └── ...
├── deployment/
│   ├── ec2-setup.sh            # ✅ Automated setup script
│   ├── quickcommerce.service   # ✅ Systemd service
│   ├── nginx-quickcommerce.conf # ✅ Nginx config
│   ├── AWS_DEPLOYMENT_GUIDE.md # ✅ Full documentation
│   └── QUICK_START.md          # ✅ This file
└── amplify.yml                 # ✅ Amplify build config
```

---

## Cost Tracking

**Free Tier Limits:**
- EC2: 750 hrs/month
- RDS: 750 hrs/month, 20 GB storage
- Amplify: 1000 build minutes, 15 GB served
- Bedrock Nova: ~$0.00035 per 1K tokens (very cheap)

**Set Billing Alerts:** AWS Console → Billing → Alerts

---

**Need help?** See `AWS_DEPLOYMENT_GUIDE.md` for detailed instructions.

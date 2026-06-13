# QuickCommerce AWS Deployment Guide

Complete step-by-step guide to deploy QuickCommerce to AWS Free Tier services.

---

## Table of Contents

1. [Database Migration: SQLite to Amazon RDS](#1-database-migration-sqlite-to-amazon-rds)
2. [Backend Deployment: Amazon EC2](#2-backend-deployment-amazon-ec2)
3. [Frontend Deployment: AWS Amplify](#3-frontend-deployment-aws-amplify)
4. [Testing & Verification](#4-testing--verification)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Database Migration: SQLite to Amazon RDS

### 1.1 Create RDS PostgreSQL Instance

1. **Navigate to AWS RDS Console**
   - Go to: https://console.aws.amazon.com/rds/
   - Click "Create database"

2. **Choose Database Configuration**
   - **Engine type**: PostgreSQL
   - **Version**: PostgreSQL 15.x (latest)
   - **Templates**: Free tier
   - **DB instance identifier**: `quickcommerce-db`
   - **Master username**: `dbadmin`
   - **Master password**: [Create strong password - save it securely!]

3. **Instance Configuration**
   - **DB instance class**: db.t3.micro or db.t4g.micro (Free Tier eligible)
   - **Storage**: 20 GiB (Free Tier limit)
   - **Storage autoscaling**: Disable (to stay in Free Tier)

4. **Connectivity**
   - **Public access**: Yes (for initial setup; restrict later via security groups)
   - **VPC security group**: Create new or select existing
   - **Port**: 5432 (default)

5. **Database Authentication**
   - **Authentication**: Password authentication

6. **Additional Configuration**
   - **Initial database name**: `quickcommerce`
   - **Backup retention**: 7 days (Free Tier includes automated backups)
   - **Encryption**: Enable (recommended)

7. **Create Database**
   - Click "Create database"
   - Wait 5-10 minutes for instance to become available

### 1.2 Configure RDS Security Group

1. **Go to EC2 Security Groups**
   - Find the security group attached to your RDS instance
   
2. **Add Inbound Rule**
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port**: 5432
   - **Source**: 
     - For testing: Your IP (My IP)
     - For production: EC2 instance security group ID
   - **Description**: Allow PostgreSQL from EC2

3. **Save Rules**

### 1.3 Get RDS Connection Details

After RDS instance is available:

1. Click on your database instance
2. Copy the **Endpoint** (e.g., `quickcommerce-db.xxxxxxxxx.us-east-1.rds.amazonaws.com`)
3. Note the **Port** (5432)
4. Remember your **Master username** and **Master password**

### 1.4 Update Backend Configuration

The code has already been updated with RDS support. You'll need to create a production `.env` file:

**On your EC2 instance** (after following EC2 setup below):

```bash
nano /var/www/quickcommerce/backend/.env
```

Add the following:

```bash
# AWS Bedrock Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1

# JWT Configuration
SECRET_KEY=generate-a-strong-random-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Environment
ENVIRONMENT=production

# Database Configuration
DATABASE_URL=postgresql://dbadmin:your_password@quickcommerce-db.xxxxxxxxx.us-east-1.rds.amazonaws.com:5432/quickcommerce
```

### 1.5 Migrate Data from SQLite to PostgreSQL (Optional)

If you have existing data in SQLite that you want to migrate:

**Option A: Manual Export/Import** (Small datasets)

```bash
# On your local machine, export data
sqlite3 quickcommerce.db .dump > data_dump.sql

# Edit data_dump.sql to make it PostgreSQL compatible
# Then import on EC2 instance
psql -h quickcommerce-db.xxx.rds.amazonaws.com -U dbadmin -d quickcommerce -f data_dump.sql
```

**Option B: Fresh Start** (Recommended for new deployments)

Just let SQLAlchemy create tables on first run - no migration needed.

---

## 2. Backend Deployment: Amazon EC2

### 2.1 Launch EC2 Instance

1. **Navigate to EC2 Console**
   - Go to: https://console.aws.amazon.com/ec2/

2. **Launch Instance**
   - **Name**: `quickcommerce-backend`
   - **AMI**: Ubuntu Server 22.04 LTS (Free Tier eligible)
   - **Instance type**: t2.micro or t3.micro (Free Tier eligible)
   - **Key pair**: Create new or select existing (download .pem file)
   - **Network settings**:
     - Allow SSH traffic from: Your IP
     - Allow HTTP traffic from: 0.0.0.0/0
     - Allow HTTPS traffic from: 0.0.0.0/0

3. **Configure Storage**
   - 8-30 GB gp3 (Free Tier: 30 GB)

4. **Launch Instance**

### 2.2 Configure Security Group

1. **Edit Inbound Rules**:
   - **SSH**: Port 22, Source: Your IP
   - **HTTP**: Port 80, Source: 0.0.0.0/0
   - **HTTPS**: Port 443, Source: 0.0.0.0/0 (for future SSL)

2. **Save Rules**

### 2.3 Connect to EC2 Instance

**Windows (using PowerShell):**
```powershell
# Set permissions on key file
icacls "quickcommerce-key.pem" /inheritance:r
icacls "quickcommerce-key.pem" /grant:r "$($env:USERNAME):R"

# Connect via SSH
ssh -i "quickcommerce-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

**Mac/Linux:**
```bash
chmod 400 quickcommerce-key.pem
ssh -i "quickcommerce-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

### 2.4 Run Setup Script

**Option A: Automated Setup**

1. Upload the setup script to EC2:
   ```bash
   scp -i "quickcommerce-key.pem" deployment/ec2-setup.sh ubuntu@YOUR_EC2_PUBLIC_IP:~/
   ```

2. Run the script:
   ```bash
   ssh -i "quickcommerce-key.pem" ubuntu@YOUR_EC2_PUBLIC_IP
   chmod +x ec2-setup.sh
   ./ec2-setup.sh
   ```

**Option B: Manual Setup**

Follow these commands on your EC2 instance:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip \
    postgresql-client libpq-dev nginx git

# Create application directory
sudo mkdir -p /var/www/quickcommerce
sudo chown -R ubuntu:ubuntu /var/www/quickcommerce

# Upload your backend code
# On your local machine:
# scp -i "key.pem" -r backend/ ubuntu@YOUR_EC2_IP:/var/www/quickcommerce/

# Create virtual environment
cd /var/www/quickcommerce/backend
python3.11 -m venv venv
source venv/bin/activate

# Install Python packages
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
nano .env
# Paste your production environment variables (see section 1.4)

# Initialize database
python -c "from backend.database import engine; from backend.models import Base; Base.metadata.create_all(bind=engine)"
```

### 2.5 Configure Systemd Service

```bash
# Copy service file
sudo cp /var/www/quickcommerce/deployment/quickcommerce.service /etc/systemd/system/

# Or create manually:
sudo nano /etc/systemd/system/quickcommerce.service
# Paste contents from deployment/quickcommerce.service

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable quickcommerce
sudo systemctl start quickcommerce

# Check status
sudo systemctl status quickcommerce

# View logs
sudo journalctl -u quickcommerce -f
```

### 2.6 Configure Nginx

```bash
# Copy nginx configuration
sudo cp /var/www/quickcommerce/deployment/nginx-quickcommerce.conf /etc/nginx/sites-available/quickcommerce

# Or create manually:
sudo nano /etc/nginx/sites-available/quickcommerce
# Paste contents from deployment/nginx-quickcommerce.conf

# Enable site
sudo ln -s /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 2.7 Verify Backend Deployment

```bash
# Test locally on EC2
curl http://localhost/health
# Expected: {"status":"ok"}

# Test from your machine
curl http://YOUR_EC2_PUBLIC_IP/health
# Expected: {"status":"ok"}

# View API docs
# Open browser: http://YOUR_EC2_PUBLIC_IP/docs
```

---

## 3. Frontend Deployment: AWS Amplify

### 3.1 Prepare Repository

AWS Amplify requires your code in a Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit).

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit for AWS deployment"
   ```

2. **Push to GitHub** (recommended):
   ```bash
   # Create a new repository on GitHub
   # Then:
   git remote add origin https://github.com/yourusername/quickcommerce.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify `amplify.yml` is in root**:
   - The file has already been created at the project root
   - This tells Amplify how to build your Vite app

### 3.2 Create Amplify App

1. **Navigate to AWS Amplify Console**
   - Go to: https://console.aws.amazon.com/amplify/

2. **Create New App**
   - Click "New app" → "Host web app"
   - Choose your Git provider (GitHub)
   - Authorize AWS Amplify to access your repository

3. **Select Repository**
   - Repository: `quickcommerce`
   - Branch: `main`

4. **Configure Build Settings**
   - Amplify will auto-detect the `amplify.yml` file
   - **App name**: `quickcommerce-frontend`
   - Click "Advanced settings"

5. **Add Environment Variables**
   - Click "Add environment variable"
   - **Key**: `VITE_API_URL`
   - **Value**: `http://YOUR_EC2_PUBLIC_IP/api`
   
   Example: `http://3.142.123.45/api`

   **Important**: Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP address

6. **Save and Deploy**
   - Click "Save and deploy"
   - Wait 3-5 minutes for build to complete

### 3.3 Update CORS Settings

After Amplify deploys, you'll get an Amplify domain like: `https://main.xxxxxx.amplifyapp.com`

Update your backend CORS settings:

```bash
# SSH into EC2
ssh -i "key.pem" ubuntu@YOUR_EC2_IP

# Edit main.py
nano /var/www/quickcommerce/backend/main.py
```

Update the `allow_origins` list:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://main.xxxxxx.amplifyapp.com",  # Add your Amplify URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Restart the backend:

```bash
sudo systemctl restart quickcommerce
```

### 3.4 Verify Frontend Deployment

1. **Open Amplify URL** in browser
   - `https://main.xxxxxx.amplifyapp.com`

2. **Test Registration/Login**
   - Register a new user
   - Login
   - Try the chat feature

### 3.5 Custom Domain (Optional)

1. **In Amplify Console**:
   - Go to "Domain management"
   - Click "Add domain"
   - Follow wizard to add your domain (requires Route 53 or external DNS provider)

2. **Update Environment Variables**:
   - Update `VITE_API_URL` if using custom domain for API

---

## 4. Testing & Verification

### 4.1 Backend Health Checks

```bash
# API Health
curl http://YOUR_EC2_IP/health

# API Documentation
open http://YOUR_EC2_IP/docs

# Database Connection
ssh ubuntu@YOUR_EC2_IP
source /var/www/quickcommerce/backend/venv/bin/activate
python -c "from backend.database import engine; print(engine.connect())"
```

### 4.2 Frontend Checks

1. Open Amplify URL in browser
2. Check browser console for errors (F12)
3. Test all features:
   - Registration
   - Login
   - Product browsing
   - Chat with AI
   - Cart operations
   - Profile settings

### 4.3 Integration Tests

Test the full flow:
1. Register new user
2. Set dietary preferences
3. Chat with bot
4. Add recommendations to cart
5. View cart
6. Logout and login again

---

## 5. Troubleshooting

### Common Issues

#### Backend Won't Start

```bash
# Check logs
sudo journalctl -u quickcommerce -n 50

# Common fixes:
# 1. Check .env file syntax
nano /var/www/quickcommerce/backend/.env

# 2. Verify Python dependencies
source /var/www/quickcommerce/backend/venv/bin/activate
pip install -r requirements.txt

# 3. Check database connection
python -c "from backend.config import settings; print(settings.database_url)"
```

#### Database Connection Failed

```bash
# Test RDS connection
psql -h your-rds-endpoint.rds.amazonaws.com -U dbadmin -d quickcommerce

# Check security group allows EC2 → RDS
# Check .env DATABASE_URL is correct
```

#### CORS Errors in Frontend

```bash
# Update backend/main.py CORS origins
# Add your Amplify URL to allow_origins list
sudo systemctl restart quickcommerce
```

#### Amplify Build Failed

1. Check `amplify.yml` syntax
2. Verify `frontend/package.json` has correct build script
3. Check build logs in Amplify console
4. Ensure all dependencies are in `package.json`

#### 502 Bad Gateway

```bash
# Backend not running
sudo systemctl status quickcommerce
sudo systemctl start quickcommerce

# Nginx misconfigured
sudo nginx -t
sudo systemctl restart nginx
```

---

## Cost Optimization Tips

### Free Tier Limits

- **EC2**: 750 hours/month of t2.micro or t3.micro
- **RDS**: 750 hours/month of db.t2.micro or db.t3.micro, 20 GB storage
- **Amplify**: 1000 build minutes/month, 15 GB served/month
- **Bedrock**: Pay per request (no free tier, but Nova models are very cheap)

### Staying Within Free Tier

1. **Stop EC2 when not in use** (during development)
   ```bash
   aws ec2 stop-instances --instance-ids i-xxxxx
   ```

2. **Use RDS automatic pause** (if available for your instance type)

3. **Monitor usage** in AWS Billing Dashboard

4. **Set up billing alerts**:
   - Go to AWS Billing Console
   - Create alert for $1, $5, $10 thresholds

---

## Security Checklist

- [ ] Use strong passwords for RDS
- [ ] Restrict RDS security group to EC2 only (remove public access after setup)
- [ ] Use IAM roles instead of access keys where possible
- [ ] Enable SSL/HTTPS (use Let's Encrypt for free SSL)
- [ ] Rotate JWT secret keys regularly
- [ ] Enable CloudWatch monitoring
- [ ] Regular security updates: `sudo apt update && sudo apt upgrade`
- [ ] Use AWS Secrets Manager for sensitive data (advanced)

---

## Next Steps

1. **Enable HTTPS** with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

2. **Set up monitoring**:
   - CloudWatch for EC2/RDS metrics
   - Application logs with CloudWatch Logs

3. **Automated backups**:
   - RDS automated backups (already enabled)
   - Consider S3 for application data

4. **CI/CD Pipeline**:
   - GitHub Actions for backend deployment
   - Amplify already handles frontend CI/CD

---

## Support & Resources

- [AWS Free Tier](https://aws.amazon.com/free/)
- [RDS Documentation](https://docs.aws.amazon.com/rds/)
- [EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Amplify Documentation](https://docs.amplify.aws/)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)

---

**Deployment Complete! 🚀**

Your QuickCommerce application is now running on AWS Free Tier infrastructure.

# QuickCommerce AWS Deployment Checklist

Use this checklist to track your deployment progress.

---

## Pre-Deployment

- [ ] AWS Account created and verified
- [ ] Credit card added (required even for Free Tier)
- [ ] IAM user created with appropriate permissions
- [ ] AWS CLI installed (optional)
- [ ] Git repository created (GitHub/GitLab/Bitbucket)
- [ ] Code pushed to repository
- [ ] EC2 key pair created and downloaded
- [ ] All sensitive data removed from code
- [ ] Strong passwords generated for:
  - [ ] RDS master password
  - [ ] JWT secret key
  - [ ] Any other secrets

---

## 1. Database Setup (RDS)

### RDS Instance Creation
- [ ] Navigate to AWS RDS Console
- [ ] Click "Create database"
- [ ] Select PostgreSQL engine
- [ ] Choose Free Tier template
- [ ] Configure instance:
  - [ ] Instance identifier: `quickcommerce-db`
  - [ ] Master username: `dbadmin` (or your choice)
  - [ ] Strong master password set
  - [ ] Instance class: db.t3.micro or db.t4g.micro
  - [ ] Storage: 20 GiB
  - [ ] Storage autoscaling: Disabled
  - [ ] Public access: Yes (temporary)
  - [ ] Initial database name: `quickcommerce`
- [ ] Create database
- [ ] Wait for status: Available (5-10 minutes)
- [ ] Copy endpoint address
- [ ] Note port (5432)

### Security Group Configuration
- [ ] Go to EC2 Security Groups
- [ ] Find RDS security group
- [ ] Add inbound rule:
  - [ ] Type: PostgreSQL
  - [ ] Port: 5432
  - [ ] Source: Your IP (for testing)
  - [ ] Description: "Temporary access for setup"
- [ ] Save rules

### Database Connection Test
- [ ] Install PostgreSQL client locally
- [ ] Test connection:
  ```bash
  psql -h [RDS_ENDPOINT] -U dbadmin -d quickcommerce
  ```
- [ ] Connection successful
- [ ] Exit psql: `\q`

---

## 2. Backend Setup (EC2)

### EC2 Instance Creation
- [ ] Navigate to AWS EC2 Console
- [ ] Click "Launch Instance"
- [ ] Configure:
  - [ ] Name: `quickcommerce-backend`
  - [ ] AMI: Ubuntu Server 22.04 LTS
  - [ ] Instance type: t2.micro or t3.micro
  - [ ] Key pair: Select or create new
  - [ ] Key pair downloaded and saved securely
  - [ ] Network: Default VPC
  - [ ] Storage: 20 GB gp3
- [ ] Configure security group:
  - [ ] SSH (22): Your IP
  - [ ] HTTP (80): 0.0.0.0/0
  - [ ] HTTPS (443): 0.0.0.0/0
- [ ] Launch instance
- [ ] Wait for status: Running
- [ ] Copy public IP address

### Connect to EC2
- [ ] Set key file permissions:
  ```bash
  # Windows PowerShell:
  icacls "key.pem" /inheritance:r
  icacls "key.pem" /grant:r "$($env:USERNAME):R"
  
  # Mac/Linux:
  chmod 400 key.pem
  ```
- [ ] Connect via SSH:
  ```bash
  ssh -i "key.pem" ubuntu@[EC2_PUBLIC_IP]
  ```
- [ ] Connection successful

### System Setup
- [ ] Update system:
  ```bash
  sudo apt update && sudo apt upgrade -y
  ```
- [ ] Install dependencies:
  ```bash
  sudo apt install -y python3.11 python3.11-venv python3-pip \
      postgresql-client libpq-dev nginx git
  ```
- [ ] Create application directory:
  ```bash
  sudo mkdir -p /var/www/quickcommerce
  sudo chown -R ubuntu:ubuntu /var/www/quickcommerce
  ```

### Upload Backend Code
- [ ] From local machine:
  ```bash
  scp -i "key.pem" -r backend/ ubuntu@[EC2_IP]:/var/www/quickcommerce/
  ```
- [ ] Verify files uploaded:
  ```bash
  ls -la /var/www/quickcommerce/backend/
  ```

### Python Environment Setup
- [ ] Create virtual environment:
  ```bash
  cd /var/www/quickcommerce/backend
  python3.11 -m venv venv
  ```
- [ ] Activate virtual environment:
  ```bash
  source venv/bin/activate
  ```
- [ ] Upgrade pip:
  ```bash
  pip install --upgrade pip
  ```
- [ ] Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- [ ] No errors during installation

### Environment Configuration
- [ ] Create `.env` file:
  ```bash
  nano /var/www/quickcommerce/backend/.env
  ```
- [ ] Add configuration:
  ```bash
  AWS_ACCESS_KEY_ID=[your_key]
  AWS_SECRET_ACCESS_KEY=[your_secret]
  AWS_REGION=us-east-1
  SECRET_KEY=[strong-random-key-min-32-chars]
  ALGORITHM=HS256
  ACCESS_TOKEN_EXPIRE_MINUTES=1440
  ENVIRONMENT=production
  DATABASE_URL=postgresql://dbadmin:[password]@[rds-endpoint]:5432/quickcommerce
  ```
- [ ] Save file (Ctrl+X, Y, Enter)
- [ ] Verify .env file:
  ```bash
  cat .env | grep -v SECRET | grep -v PASSWORD
  ```

### Database Initialization
- [ ] Test database connection:
  ```bash
  source venv/bin/activate
  python -c "from backend.database import engine; print(engine.connect())"
  ```
- [ ] Run migration:
  ```bash
  python migrate_db.py
  ```
- [ ] Tables created successfully
- [ ] Verify tables:
  ```bash
  psql -h [RDS_ENDPOINT] -U dbadmin -d quickcommerce -c "\dt"
  ```

### Systemd Service Setup
- [ ] Copy service file:
  ```bash
  sudo cp /var/www/quickcommerce/deployment/quickcommerce.service /etc/systemd/system/
  ```
  Or create manually from deployment files
- [ ] Reload systemd:
  ```bash
  sudo systemctl daemon-reload
  ```
- [ ] Enable service:
  ```bash
  sudo systemctl enable quickcommerce
  ```
- [ ] Start service:
  ```bash
  sudo systemctl start quickcommerce
  ```
- [ ] Check status:
  ```bash
  sudo systemctl status quickcommerce
  ```
- [ ] Service status: Active (running)
- [ ] View logs:
  ```bash
  sudo journalctl -u quickcommerce -f
  ```
- [ ] No errors in logs

### Nginx Configuration
- [ ] Copy Nginx config:
  ```bash
  sudo cp /var/www/quickcommerce/deployment/nginx-quickcommerce.conf /etc/nginx/sites-available/quickcommerce
  ```
  Or create manually from deployment files
- [ ] Enable site:
  ```bash
  sudo ln -s /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
  ```
- [ ] Remove default site:
  ```bash
  sudo rm -f /etc/nginx/sites-enabled/default
  ```
- [ ] Test Nginx config:
  ```bash
  sudo nginx -t
  ```
- [ ] Configuration test successful
- [ ] Restart Nginx:
  ```bash
  sudo systemctl restart nginx
  ```
- [ ] Nginx status:
  ```bash
  sudo systemctl status nginx
  ```
- [ ] Nginx active and running

### Backend Verification
- [ ] Test health endpoint locally:
  ```bash
  curl http://localhost/health
  ```
- [ ] Response: `{"status":"ok"}`
- [ ] Test from external machine:
  ```bash
  curl http://[EC2_PUBLIC_IP]/health
  ```
- [ ] Response: `{"status":"ok"}`
- [ ] Open API docs in browser:
  ```
  http://[EC2_PUBLIC_IP]/docs
  ```
- [ ] API docs load successfully
- [ ] Test user registration via API docs
- [ ] Test user login via API docs
- [ ] Receive JWT token

### Update RDS Security Group
- [ ] Go to EC2 Security Groups
- [ ] Find RDS security group
- [ ] Edit inbound rule for PostgreSQL:
  - [ ] Change source from "Your IP" to EC2 security group
  - [ ] Remove public access (0.0.0.0/0)
  - [ ] Description: "Access from EC2 only"
- [ ] Save rules
- [ ] Test backend still works (should be fine)

---

## 3. Frontend Setup (AWS Amplify)

### Repository Preparation
- [ ] Code committed to Git:
  ```bash
  git add .
  git commit -m "Ready for AWS deployment"
  ```
- [ ] Code pushed to GitHub:
  ```bash
  git push origin main
  ```
- [ ] Verify `amplify.yml` exists in project root
- [ ] Verify frontend code in `frontend/` directory

### Amplify App Creation
- [ ] Navigate to AWS Amplify Console
- [ ] Click "New app" → "Host web app"
- [ ] Select Git provider (GitHub)
- [ ] Authorize AWS Amplify
- [ ] Select repository: `quickcommerce`
- [ ] Select branch: `main`
- [ ] App name: `quickcommerce-frontend`

### Build Settings
- [ ] Amplify detects `amplify.yml`
- [ ] Review build settings (should auto-detect)
- [ ] Build specification shows:
  - [ ] preBuild: `cd frontend && npm ci`
  - [ ] build: `npm run build`
  - [ ] artifacts: `frontend/dist`

### Environment Variables
- [ ] Click "Advanced settings"
- [ ] Click "Add environment variable"
- [ ] Add variable:
  - [ ] Key: `VITE_API_URL`
  - [ ] Value: `http://[EC2_PUBLIC_IP]/api`
  - [ ] Example: `http://3.142.123.45/api`
- [ ] Verify variable saved

### Deploy
- [ ] Click "Save and deploy"
- [ ] Build starts automatically
- [ ] Wait for build phases:
  - [ ] Provision (1 min)
  - [ ] Build (2-3 min)
  - [ ] Deploy (1 min)
- [ ] Build status: Success
- [ ] Copy Amplify domain: `https://main.[app-id].amplifyapp.com`

### Update Backend CORS
- [ ] SSH into EC2:
  ```bash
  ssh -i "key.pem" ubuntu@[EC2_IP]
  ```
- [ ] Edit main.py:
  ```bash
  nano /var/www/quickcommerce/backend/main.py
  ```
- [ ] Add Amplify URL to `allow_origins`:
  ```python
  allow_origins=[
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://main.[your-app-id].amplifyapp.com",  # Add this
  ]
  ```
- [ ] Save file
- [ ] Restart backend:
  ```bash
  sudo systemctl restart quickcommerce
  ```
- [ ] Verify service restarted:
  ```bash
  sudo systemctl status quickcommerce
  ```

### Frontend Verification
- [ ] Open Amplify URL in browser
- [ ] Home page loads
- [ ] No console errors (F12)
- [ ] Test registration:
  - [ ] Click "Register"
  - [ ] Fill form
  - [ ] Submit
  - [ ] Registration successful
- [ ] Test login:
  - [ ] Enter credentials
  - [ ] Login successful
  - [ ] Redirected to products/chat
- [ ] Test chat feature:
  - [ ] Type message
  - [ ] Send
  - [ ] Receive AI response
  - [ ] Recommendations appear
- [ ] Test cart:
  - [ ] Add product to cart
  - [ ] Cart updates
  - [ ] View cart sidebar
- [ ] Test profile:
  - [ ] Update dietary preferences
  - [ ] Save
  - [ ] Preferences saved

---

## 4. Final Configuration

### SSL/HTTPS Setup (Optional but Recommended)
- [ ] Domain name purchased (optional)
- [ ] Domain configured in Route 53 or external DNS
- [ ] Install Certbot:
  ```bash
  sudo apt install certbot python3-certbot-nginx
  ```
- [ ] Get SSL certificate:
  ```bash
  sudo certbot --nginx -d yourdomain.com
  ```
- [ ] Certificate obtained
- [ ] Nginx automatically configured for HTTPS
- [ ] Test HTTPS: `https://yourdomain.com`
- [ ] Update Amplify `VITE_API_URL` to HTTPS URL

### Monitoring Setup
- [ ] Set up CloudWatch for EC2:
  - [ ] Enable detailed monitoring
  - [ ] Create alarms for:
    - [ ] CPU utilization > 80%
    - [ ] Disk usage > 80%
    - [ ] Status check failed
- [ ] Set up CloudWatch for RDS:
  - [ ] Enable enhanced monitoring
  - [ ] Create alarms for:
    - [ ] CPU utilization > 80%
    - [ ] Free storage < 2 GB
    - [ ] Database connections > 80

### Billing Alerts
- [ ] Go to AWS Billing Console
- [ ] Create billing alerts:
  - [ ] $1 threshold
  - [ ] $5 threshold
  - [ ] $10 threshold
  - [ ] $20 threshold (near Free Tier limit)
- [ ] Verify email notifications

### Backup Setup
- [ ] RDS automated backups enabled (default)
- [ ] Backup retention: 7 days
- [ ] Create manual snapshot of RDS
- [ ] Create AMI of EC2 instance (optional)
- [ ] Document backup procedure

---

## 5. Testing & Validation

### End-to-End Testing
- [ ] User registration flow
- [ ] User login flow
- [ ] JWT token persistence
- [ ] Chat with AI
- [ ] Product recommendations
- [ ] Add to cart
- [ ] Update cart
- [ ] Remove from cart
- [ ] Profile updates
- [ ] Dietary filters work
- [ ] Budget preferences respected
- [ ] Logout and re-login
- [ ] Session persistence

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms (non-AI endpoints)
- [ ] AI chat response < 10 seconds
- [ ] No memory leaks
- [ ] No 502/504 errors

### Security Testing
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] CORS configured correctly
- [ ] JWT validation works
- [ ] Password hashing works
- [ ] Unauthorized access blocked
- [ ] RDS not publicly accessible
- [ ] EC2 SSH restricted to your IP

---

## 6. Documentation

- [ ] README updated with deployment info
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide created
- [ ] Runbook for common tasks
- [ ] Contact information for support

---

## Post-Deployment

### Day 1
- [ ] Monitor all services for 24 hours
- [ ] Check logs for errors
- [ ] Verify Free Tier usage in billing dashboard
- [ ] Test all features again

### Week 1
- [ ] Check AWS billing (should be $0 or very low)
- [ ] Review CloudWatch metrics
- [ ] Check for any security alerts
- [ ] Performance optimization if needed

### Monthly
- [ ] Review AWS billing
- [ ] Check Free Tier usage
- [ ] Update dependencies
- [ ] Security patches applied
- [ ] Database backup verified
- [ ] Review error logs

---

## Rollback Plan

If deployment fails or issues arise:

- [ ] EC2: Stop instance to avoid charges
- [ ] RDS: Stop database instance
- [ ] Amplify: Revert to previous deployment
- [ ] Document issues encountered
- [ ] Review logs for root cause
- [ ] Fix issues and redeploy

---

## Success Criteria

✅ Deployment is successful when:

- [ ] Frontend accessible via Amplify URL
- [ ] Backend accessible via EC2 public IP
- [ ] Database connected and functional
- [ ] All features working end-to-end
- [ ] No errors in logs
- [ ] Security properly configured
- [ ] Monitoring and alerts active
- [ ] Billing alerts configured
- [ ] Documentation complete
- [ ] Team trained on deployment

---

**Congratulations! Your QuickCommerce application is now live on AWS! 🎉**

Keep this checklist for future reference and maintenance tasks.

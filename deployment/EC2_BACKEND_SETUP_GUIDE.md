# EC2 Backend Setup - Complete Step-by-Step Guide

**You are here:** EC2 instance created ✅  
**Next:** Connect and deploy your FastAPI backend

**Time Required:** 45-60 minutes  
**Difficulty:** Beginner-friendly

---

## 📋 What You Need Before Starting

**From AWS Console:**
- [ ] EC2 Public IP address (find it in EC2 console)
- [ ] Key pair file (.pem) downloaded to your computer
- [ ] EC2 instance status: "Running" (green)

**From Previous Step (RDS):**
- [ ] RDS endpoint saved
- [ ] RDS username (dbadmin)
- [ ] RDS password saved

**On Your Computer:**
- [ ] Backend code in: `g:\Project\Merge_Conflicts_HackOn\backend\`
- [ ] AWS credentials (Access Key ID and Secret Key)

---

## Part 1: Find Your EC2 Public IP

### Step 1.1: Open EC2 Console

1. Go to AWS Console: https://console.aws.amazon.com
2. Search for "EC2" at the top
3. Click "EC2"

### Step 1.2: Find Your Instance

1. In the left sidebar, click **"Instances"**
2. You'll see your instance (probably named "quickcommerce-backend")
3. Click on the instance (checkbox or row)

### Step 1.3: Copy Public IP

**In the bottom details panel, find:**
- **Public IPv4 address:** Something like `3.142.123.45`
- **Click the copy icon** next to it

**Save this IP!** You'll use it many times.

```
MY EC2 PUBLIC IP: __________________ (write it here!)
```

---

## Part 2: Prepare Your Key File (Windows)

### Step 2.1: Find Your Downloaded Key

Your `.pem` key file is probably in:
- `C:\Users\YourName\Downloads\`
- Named something like: `quickcommerce-key.pem`

**Move it to a safe location:**
```
Example: C:\Keys\quickcommerce-key.pem
```

### Step 2.2: Set Correct Permissions

**Open PowerShell as Administrator:**
1. Press `Windows + X`
2. Click "Windows PowerShell (Admin)" or "Terminal (Admin)"

**Run these commands** (replace with your key path):

```powershell
# Change to your key directory
cd C:\Keys

# Set permissions (replace 'quickcommerce-key.pem' with your filename)
icacls "quickcommerce-key.pem" /inheritance:r
icacls "quickcommerce-key.pem" /grant:r "$($env:USERNAME):R"
```

**What this does:** Makes the key secure (SSH requires this)

---

## Part 3: Connect to Your EC2 Instance

### Step 3.1: Open PowerShell

**Regular PowerShell is fine now** (doesn't need Admin)

### Step 3.2: Connect via SSH

**Replace these values:**
- `YOUR_KEY_FILE.pem` = your actual key filename
- `YOUR_EC2_IP` = your EC2 public IP (from Part 1)

```powershell
# Navigate to where your key is
cd C:\Keys

# Connect to EC2
ssh -i "quickcommerce-key.pem" ubuntu@YOUR_EC2_IP
```

**Example:**
```powershell
ssh -i "quickcommerce-key.pem" ubuntu@3.142.123.45
```

### Step 3.3: First Connection Warning

**You'll see a message like:**
```
The authenticity of host '3.142.123.45' can't be established.
Are you sure you want to continue connecting (yes/no)?
```

**Type:** `yes` and press Enter

### Step 3.4: Success!

**You should see:**
```
Welcome to Ubuntu 22.04.x LTS
...
ubuntu@ip-xxx-xx-xx-xx:~$
```

✅ **You're now inside your EC2 server!**

---

## Part 4: Update System & Install Dependencies

### Step 4.1: Update Ubuntu

**Run these commands one by one:**

```bash
sudo apt update
```

Wait for it to finish (30 seconds), then:

```bash
sudo apt upgrade -y
```

Wait for this (2-5 minutes). You'll see lots of text.

### Step 4.2: Install Python 3.11

```bash
sudo apt install -y python3.11 python3.11-venv python3-pip
```

Wait 2-3 minutes.

### Step 4.3: Install PostgreSQL Client

```bash
sudo apt install -y postgresql-client libpq-dev
```

Wait 1 minute.

### Step 4.4: Install Nginx

```bash
sudo apt install -y nginx
```

Wait 1 minute.

### Step 4.5: Install Git (optional, for future updates)

```bash
sudo apt install -y git
```

✅ **All dependencies installed!**

---

## Part 5: Create Application Directory

### Step 5.1: Create Directories

```bash
sudo mkdir -p /var/www/quickcommerce
```

### Step 5.2: Set Ownership

```bash
sudo chown -R ubuntu:ubuntu /var/www/quickcommerce
```

### Step 5.3: Verify

```bash
ls -la /var/www/
```

You should see `quickcommerce` directory listed.

---

## Part 6: Upload Backend Code

### Step 6.1: Open NEW PowerShell Window

**Keep your SSH connection open!**

**On your LOCAL computer**, open a NEW PowerShell window:
1. Press `Windows + R`
2. Type `powershell`
3. Press Enter

### Step 6.2: Navigate to Your Project

```powershell
cd G:\Project\Merge_Conflicts_HackOn
```

### Step 6.3: Upload Backend Folder

**Replace YOUR_EC2_IP with your actual IP:**

```powershell
scp -i "C:\Keys\quickcommerce-key.pem" -r backend ubuntu@YOUR_EC2_IP:/var/www/quickcommerce/
```

**Example:**
```powershell
scp -i "C:\Keys\quickcommerce-key.pem" -r backend ubuntu@3.142.123.45:/var/www/quickcommerce/
```

**This will take 1-2 minutes.** You'll see files being uploaded.

### Step 6.4: Verify Upload

**Go back to your SSH window** (the one connected to EC2)

```bash
ls -la /var/www/quickcommerce/backend/
```

You should see your backend files:
- `config.py`
- `database.py`
- `main.py`
- `requirements.txt`
- etc.

✅ **Backend code uploaded!**

---

## Part 7: Create Python Virtual Environment

### Step 7.1: Navigate to Backend

```bash
cd /var/www/quickcommerce/backend
```

### Step 7.2: Create Virtual Environment

```bash
python3.11 -m venv venv
```

Wait 30 seconds.

### Step 7.3: Activate Virtual Environment

```bash
source venv/bin/activate
```

**You should see `(venv)` appear at the start of your command line:**
```
(venv) ubuntu@ip-xxx:~/backend$
```

### Step 7.4: Upgrade pip

```bash
pip install --upgrade pip
```

### Step 7.5: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**This takes 3-5 minutes.** You'll see packages being installed.

**Wait for it to complete!**

✅ **Python environment ready!**

---

## Part 8: Configure Environment Variables

### Step 8.1: Create .env File

```bash
nano .env
```

**This opens a text editor inside the terminal.**

### Step 8.2: Paste Configuration

**Type or paste this** (press Shift+Insert to paste in terminal):

```bash
# AWS Bedrock Credentials
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_HERE
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_KEY_HERE
AWS_REGION=us-east-1

# JWT Configuration
SECRET_KEY=your-super-strong-secret-key-min-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Environment
ENVIRONMENT=production

# Database Configuration (REPLACE WITH YOUR RDS DETAILS!)
DATABASE_URL=postgresql://dbadmin:YOUR_RDS_PASSWORD@YOUR_RDS_ENDPOINT:5432/quickcommerce
```

### Step 8.3: Replace These Values

**You MUST replace:**
1. `YOUR_AWS_ACCESS_KEY_HERE` - Your AWS Access Key ID
2. `YOUR_AWS_SECRET_KEY_HERE` - Your AWS Secret Access Key
3. `YOUR_RDS_PASSWORD` - RDS password you created
4. `YOUR_RDS_ENDPOINT` - RDS endpoint (like: `quickcommerce-db.xxxxx.rds.amazonaws.com`)
5. `your-super-strong-secret-key-min-32-characters-long` - Create a strong random string

**Example SECRET_KEY generator:**
- Just type random characters, numbers, symbols
- Make it at least 32 characters
- Example: `QuickComm2024!Prod#SecureKey@789xyz`

### Step 8.4: Save and Exit

1. Press `Ctrl + X`
2. Press `Y` (yes to save)
3. Press `Enter` (confirm filename)

### Step 8.5: Verify .env File

```bash
cat .env
```

Check that all values are filled in (no YOUR_XXX placeholders).

**⚠️ IMPORTANT:** Make sure DATABASE_URL is one long line with no spaces!

---

## Part 9: Initialize Database

### Step 9.1: Test Database Connection

```bash
source venv/bin/activate
python -c "from backend.database import engine; print(engine.connect())"
```

**If successful, you'll see:**
```
<connection object...>
```

**If it fails:**
- Check your DATABASE_URL in .env
- Check RDS endpoint is correct
- Check RDS security group allows EC2 (we'll fix this in Part 11 if needed)

### Step 9.2: Run Database Migration

```bash
python migrate_db.py
```

**You should see:**
```
==================================================
QuickCommerce Database Migration
==================================================
Database URL: postgresql://...
Creating tables...
✅ Successfully created tables:
   - users
   - cart_items
   - user_profiles
==================================================
Migration Complete!
==================================================
```

✅ **Database initialized!**

---

## Part 10: Configure Systemd Service

### Step 10.1: Copy Service File

```bash
sudo cp /var/www/quickcommerce/deployment/quickcommerce.service /etc/systemd/system/
```

### Step 10.2: Reload Systemd

```bash
sudo systemctl daemon-reload
```

### Step 10.3: Enable Service (Auto-start)

```bash
sudo systemctl enable quickcommerce
```

### Step 10.4: Start Service

```bash
sudo systemctl start quickcommerce
```

### Step 10.5: Check Service Status

```bash
sudo systemctl status quickcommerce
```

**Look for:**
- `Active: active (running)` in green

**If you see errors:**
```bash
# View detailed logs
sudo journalctl -u quickcommerce -n 50
```

✅ **Backend service running!**

---

## Part 11: Configure Nginx

### Step 11.1: Copy Nginx Configuration

```bash
sudo cp /var/www/quickcommerce/deployment/nginx-quickcommerce.conf /etc/nginx/sites-available/quickcommerce
```

### Step 11.2: Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
```

### Step 11.3: Remove Default Site

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### Step 11.4: Test Nginx Configuration

```bash
sudo nginx -t
```

**You should see:**
```
nginx: configuration file test is successful
```

### Step 11.5: Restart Nginx

```bash
sudo systemctl restart nginx
```

### Step 11.6: Check Nginx Status

```bash
sudo systemctl status nginx
```

**Look for:**
- `Active: active (running)` in green

✅ **Nginx configured!**

---

## Part 12: Test Your Backend!

### Step 12.1: Test Locally (on EC2)

```bash
curl http://localhost/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Step 12.2: Test from Your Computer

**On your LOCAL computer** (PowerShell):

```powershell
curl http://YOUR_EC2_IP/health
```

**Example:**
```powershell
curl http://3.142.123.45/health
```

**Expected response:**
```json
{"status":"ok"}
```

### Step 12.3: Test API Docs

**Open your web browser:**
```
http://YOUR_EC2_IP/docs
```

**You should see:** FastAPI Swagger documentation page!

✅ **Backend is LIVE and working!**

---

## Part 13: Configure RDS Security Group (IMPORTANT!)

Right now, RDS might only allow your computer's IP. Let's allow EC2 to access it.

### Step 13.1: Find EC2 Security Group ID

**In EC2 Console:**
1. Click on your instance
2. In the bottom panel, click "Security" tab
3. Find "Security groups" - click the link (starts with `sg-`)
4. **Copy the Security Group ID** (like `sg-0abc123def456`)

### Step 13.2: Update RDS Security Group

1. Go to **RDS Console**
2. Click on your database (`quickcommerce-db`)
3. Click the **"VPC security groups"** link
4. Click **"Edit inbound rules"**
5. Find the PostgreSQL rule (port 5432)
6. Click **"Edit"**
7. Change **Source** from your IP to:
   - Type: Custom
   - Source: Paste your EC2 security group ID (sg-xxx)
8. Click **"Save rules"**

### Step 13.3: Test Database Connection Again

**On EC2:**
```bash
cd /var/www/quickcommerce/backend
source venv/bin/activate
python -c "from backend.database import engine; print('Database connected!')"
```

✅ **RDS security configured!**

---

## ✅ Success Checklist

Verify everything works:

- [ ] SSH connection to EC2 works
- [ ] Backend code uploaded
- [ ] Python dependencies installed
- [ ] .env file configured
- [ ] Database migration successful
- [ ] systemd service running
- [ ] Nginx configured and running
- [ ] `curl http://localhost/health` returns `{"status":"ok"}`
- [ ] `http://YOUR_EC2_IP/health` works from browser
- [ ] `http://YOUR_EC2_IP/docs` shows API documentation
- [ ] RDS security group allows EC2 access

---

## 🎉 Backend Deployment Complete!

Your FastAPI backend is now:
- ✅ Running on Amazon EC2
- ✅ Connected to Amazon RDS PostgreSQL
- ✅ Using AWS Bedrock for AI
- ✅ Accessible via public IP
- ✅ Auto-restarts on failure
- ✅ Behind Nginx reverse proxy

---

## 📝 Save This Information

```
EC2 Public IP: ___________________
Backend Health URL: http://YOUR_EC2_IP/health
API Docs URL: http://YOUR_EC2_IP/docs
SSH Command: ssh -i "key.pem" ubuntu@YOUR_EC2_IP
```

---

## 🚀 Next Step: Deploy Frontend

Now that your backend is running, let's deploy the frontend to AWS Amplify!

**Continue to:** Frontend Deployment (Amplify)

---

## 🆘 Troubleshooting

### Service won't start
```bash
sudo journalctl -u quickcommerce -n 100
```

### Nginx errors
```bash
sudo tail -f /var/log/nginx/error.log
```

### Database connection fails
- Check .env DATABASE_URL
- Check RDS security group
- Check RDS is "Available" status

### Can't access from browser
- Check EC2 security group allows HTTP (port 80)
- Check service is running: `sudo systemctl status quickcommerce`
- Check Nginx is running: `sudo systemctl status nginx`

---

**Need help? All detailed troubleshooting is in:**
```
deployment/AWS_DEPLOYMENT_GUIDE.md - Section 5
```

# EC2 Backend Setup - Quick Checklist

**Print this and check off each step!**

---

## Pre-Flight Check
- [ ] EC2 instance running
- [ ] EC2 Public IP: ___________________
- [ ] Key file location: ___________________
- [ ] RDS Endpoint: ___________________
- [ ] RDS Password: ___________________

---

## Part 1: Connect to EC2

```powershell
# On your Windows computer:
cd C:\Keys
icacls "your-key.pem" /inheritance:r
icacls "your-key.pem" /grant:r "$($env:USERNAME):R"
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

- [ ] Connected successfully
- [ ] See `ubuntu@ip-xxx` prompt

---

## Part 2: Update System

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y python3.11 python3.11-venv python3-pip
sudo apt install -y postgresql-client libpq-dev
sudo apt install -y nginx git
```

- [ ] All packages installed

---

## Part 3: Create Directory

```bash
sudo mkdir -p /var/www/quickcommerce
sudo chown -R ubuntu:ubuntu /var/www/quickcommerce
```

- [ ] Directory created

---

## Part 4: Upload Code

**New PowerShell window (local computer):**

```powershell
cd G:\Project\Merge_Conflicts_HackOn
scp -i "C:\Keys\your-key.pem" -r backend ubuntu@YOUR_EC2_IP:/var/www/quickcommerce/
```

- [ ] Code uploaded (takes 1-2 min)

---

## Part 5: Setup Python

**Back in SSH window:**

```bash
cd /var/www/quickcommerce/backend
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

- [ ] Virtual environment created
- [ ] Dependencies installed (takes 3-5 min)

---

## Part 6: Configure .env

```bash
nano .env
```

**Paste and edit:**
```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
SECRET_KEY=make-this-32-chars-long-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ENVIRONMENT=production
DATABASE_URL=postgresql://dbadmin:PASSWORD@RDS_ENDPOINT:5432/quickcommerce
```

**Save:** Ctrl+X, Y, Enter

- [ ] .env file created
- [ ] All values replaced (no placeholders)

---

## Part 7: Initialize Database

```bash
source venv/bin/activate
python migrate_db.py
```

- [ ] See "Migration Complete!" message
- [ ] Tables created: users, cart_items, user_profiles

---

## Part 8: Start Backend Service

```bash
sudo cp /var/www/quickcommerce/deployment/quickcommerce.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable quickcommerce
sudo systemctl start quickcommerce
sudo systemctl status quickcommerce
```

- [ ] Status shows: "active (running)" in green

---

## Part 9: Configure Nginx

```bash
sudo cp /var/www/quickcommerce/deployment/nginx-quickcommerce.conf /etc/nginx/sites-available/quickcommerce
sudo ln -s /etc/nginx/sites-available/quickcommerce /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

- [ ] Nginx test successful
- [ ] Nginx restarted

---

## Part 10: Test!

```bash
# On EC2:
curl http://localhost/health
```

**Expected:** `{"status":"ok"}`

- [ ] Local test works

**On your computer (browser):**
- Open: `http://YOUR_EC2_IP/health`
- Open: `http://YOUR_EC2_IP/docs`

- [ ] Health endpoint works
- [ ] API docs page loads

---

## Part 11: Fix RDS Security Group

1. Get EC2 security group ID (from EC2 console)
2. Go to RDS console
3. Click database → VPC security groups
4. Edit inbound rules
5. Change PostgreSQL (5432) source to EC2 security group

- [ ] RDS allows EC2 access

---

## ✅ Success!

- [ ] Backend running on EC2
- [ ] Connected to RDS
- [ ] Health check passes
- [ ] API docs accessible
- [ ] Ready for frontend deployment

---

## Save This Info

```
EC2 IP: ___________________
Health URL: http://YOUR_EC2_IP/health
API Docs: http://YOUR_EC2_IP/docs
SSH: ssh -i "key.pem" ubuntu@YOUR_EC2_IP
```

---

## Next: Frontend Deployment (Amplify)

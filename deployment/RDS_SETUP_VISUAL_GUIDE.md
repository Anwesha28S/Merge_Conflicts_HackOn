# Amazon RDS PostgreSQL Setup - Visual Step-by-Step Guide

**For:** QuickCommerce Database Migration  
**Time Required:** 15-20 minutes  
**Difficulty:** Beginner-friendly

This guide will walk you through **every single click** needed to create your Amazon RDS PostgreSQL database.

---

## 📋 Before You Start

**Have Ready:**
- AWS Account (signed in)
- A strong password (write it down!)
- Notepad to save important information

**You Will Get:**
- Database endpoint (like: `quickcommerce.abc123.us-east-1.rds.amazonaws.com`)
- Database username (you'll choose this)
- Database password (you'll create this)

---

## Step 1: Open AWS RDS Console

### 1.1 Navigate to RDS Service

**Option A: Search Method (Easiest)**
1. Log into AWS Console: https://console.aws.amazon.com
2. At the top, you'll see a search bar that says "Search"
3. Type: `RDS`
4. Click on "RDS" (it will show "Relational Database Service")

**Option B: Services Menu**
1. Log into AWS Console
2. Click "Services" in the top-left corner
3. Under "Database" category, click "RDS"

**What You'll See:**
- You're now on the RDS Dashboard
- The page title says "Amazon RDS"
- You'll see options like "Databases", "Snapshots", "Performance Insights"

---

## Step 2: Start Creating Your Database

### 2.1 Click "Create database" Button

**Where to find it:**
- Look for an orange button on the right side that says "Create database"
- If you don't see databases yet, you'll also see it in the center of the page

**Click it!**

---

## Step 3: Choose Database Creation Method

### 3.1 Select "Standard create"

**What you'll see:**
- Two options at the top:
  - ⭕ Standard create
  - ⭕ Easy create

**What to do:**
- ✅ **Click on "Standard create"** (the first option)

**Why?** Standard create gives you full control to stay within Free Tier limits.

---

## Step 4: Choose Database Engine

### 4.1 Select PostgreSQL

**What you'll see:**
A section titled "Engine options" with logos of different databases:
- Amazon Aurora
- MySQL
- MariaDB
- **PostgreSQL** ← This one!
- Oracle
- Microsoft SQL Server

**What to do:**
- ✅ **Click on the PostgreSQL box**
- The box will be highlighted in orange/blue when selected

### 4.2 Choose PostgreSQL Version

**What you'll see:**
- A dropdown menu labeled "Engine version"
- It will show something like "PostgreSQL 15.4-R2" or similar

**What to do:**
- ✅ **Leave it as the default** (usually the latest stable version)
- Any version 15.x or 14.x works fine

**Note:** Don't worry about the exact version number. Any recent PostgreSQL version works.

---

## Step 5: Templates (VERY IMPORTANT!)

### 5.1 Select "Free tier" Template

**What you'll see:**
A section called "Templates" with three options:
- ⭕ Production
- ⭕ Dev/Test
- ⭕ **Free tier** ← This one!

**What to do:**
- ✅ **Click on "Free tier"**
- This is CRITICAL - it automatically configures everything to stay free!

**What happens:**
- AWS will automatically:
  - Set instance size to db.t3.micro or db.t2.micro
  - Limit storage to 20 GB
  - Disable some expensive features
  - Keep you in Free Tier eligible configuration

---

## Step 6: Settings (Your Database Identification)

### 6.1 DB Instance Identifier

**What you'll see:**
- A text box labeled "DB instance identifier"
- A default name like "database-1"

**What to do:**
- ✅ **Change it to:** `quickcommerce-db`
- This is just a name for YOU to identify your database in AWS

**Rules:**
- Only letters, numbers, and hyphens (-)
- Must be unique in your AWS account
- Cannot contain spaces or special characters

### 6.2 Master Username

**What you'll see:**
- A text box labeled "Master username"
- Default value: "postgres"

**What to do (Option 1 - Easier):**
- ✅ **Change it to:** `dbadmin`

**What to do (Option 2 - Keep default):**
- ✅ **Leave it as:** `postgres`

**Important:** Write down whatever you choose!

### 6.3 Master Password

**What you'll see:**
- A section for "Credentials management"
- Two options:
  - ⭕ Self managed (we'll use this)
  - ⭕ Manage master credentials in AWS Secrets Manager

**What to do:**
1. ✅ **Select "Self managed"** (simpler for beginners)

2. You'll see two password fields:
   - "Master password"
   - "Confirm master password"

3. ✅ **Create a STRONG password:**
   - At least 8 characters
   - Mix of uppercase, lowercase, numbers
   - Example: `QuickDB2024!Secure`
   - **WRITE IT DOWN IMMEDIATELY!**

4. Type the same password in both boxes

**⚠️ CRITICAL:** You cannot recover this password if you lose it! Save it in:
- A password manager (recommended)
- A secure note on your computer
- Written down and stored safely

---

## Step 7: Instance Configuration

This section is **automatically configured** when you selected "Free tier" template!

### 7.1 DB Instance Class

**What you'll see:**
- A section called "DB instance class"
- Should show: **db.t3.micro** or **db.t2.micro**
- A green label saying "Free tier eligible"

**What to do:**
- ✅ **Leave it as is** - Don't change anything!

**What this means:**
- `db.t3.micro` = Small, free-tier eligible database instance
- Perfect for your QuickCommerce application
- Free for 12 months (750 hours/month)

**⚠️ Warning:** If you see anything else (like db.m5.large), you selected wrong template! Go back to Step 5.

---

## Step 8: Storage Configuration

### 8.1 Storage Type

**What you'll see:**
- "Storage type" dropdown
- Should show: "General Purpose SSD (gp3)" or "General Purpose SSD (gp2)"

**What to do:**
- ✅ **Leave as default** (either gp2 or gp3 is fine)

### 8.2 Allocated Storage

**What you'll see:**
- A text box labeled "Allocated storage"
- Should show: **20 GiB**

**What to do:**
- ✅ **Leave it at 20 GiB** - This is the Free Tier limit!

**Do NOT increase it!** More storage = charges.

### 8.3 Storage Autoscaling

**What you'll see:**
- A checkbox: "Enable storage autoscaling"
- It might be checked or unchecked

**What to do:**
- ✅ **UNCHECK this box** (make sure it's empty)

**Why?** 
- Autoscaling can grow beyond 20 GiB
- This would charge you money
- We want to stay in Free Tier

---

## Step 9: Connectivity (IMPORTANT!)

### 9.1 Compute Resource

**What you'll see:**
- Two options:
  - ⭕ Connect to an EC2 compute resource
  - ⭕ Don't connect to an EC2 compute resource

**What to do:**
- ✅ **Select "Don't connect to an EC2 compute resource"**

**Why?** We'll create EC2 later and connect them manually.

### 9.2 Network Type

**What you'll see:**
- Should show: "IPv4"

**What to do:**
- ✅ **Leave as "IPv4"**

### 9.3 Virtual Private Cloud (VPC)

**What you'll see:**
- A dropdown labeled "Virtual private cloud (VPC)"
- Should show: "Default VPC" or something like "vpc-xxxxx"

**What to do:**
- ✅ **Leave as default VPC**

### 9.4 DB Subnet Group

**What you'll see:**
- Should auto-populate with "default"

**What to do:**
- ✅ **Leave as default**

### 9.5 Public Access (TEMPORARY SETTING)

**What you'll see:**
- A dropdown or radio buttons labeled "Public access"
- Two options:
  - Yes
  - No

**What to do:**
- ✅ **Select "Yes"**

**Why "Yes"?**
- You need to access it initially to set it up
- You need to test the connection from your computer
- Later, you'll restrict this via security groups
- We'll secure it properly after EC2 is created

**Security Note:** Even with "Yes", it's not truly public - AWS still requires:
- Correct security group rules
- Valid username and password
- So it's protected!

### 9.6 VPC Security Group

**What you'll see:**
- A section to choose security group
- Options:
  - ⭕ Create new
  - ⭕ Choose existing

**What to do:**
- ✅ **Select "Create new"**

**New security group name:**
- The text box will auto-fill with something like "rds-launch-wizard-1"
- ✅ **Change it to:** `quickcommerce-rds-sg`

**Why?** This makes it easier to find later when configuring access.

### 9.7 Availability Zone

**What you'll see:**
- A dropdown labeled "Availability zone"
- Shows "No preference" or specific zones

**What to do:**
- ✅ **Leave as "No preference"**

### 9.8 Database Port

**What you'll see:**
- A text box showing: **5432**

**What to do:**
- ✅ **Leave it as 5432** (This is the standard PostgreSQL port)

---

## Step 10: Database Authentication

**What you'll see:**
- A section titled "Database authentication"
- Several checkboxes:
  - ☑ Password authentication
  - ☐ Password and IAM database authentication
  - ☐ Password and Kerberos authentication

**What to do:**
- ✅ **Check ONLY "Password authentication"**
- Uncheck the others if they're checked

**Why?** Simple password authentication is easiest for beginners and perfectly secure.

---

## Step 11: Additional Configuration (VERY IMPORTANT!)

### 11.1 Expand "Additional configuration"

**What you'll see:**
- A collapsed section that says "Additional configuration" with a small arrow (▶)

**What to do:**
- ✅ **Click on it to expand** (the arrow will point down ▼)

### 11.2 Initial Database Name

**What you'll see:**
- A text box labeled "Initial database name"
- It might be EMPTY or have a default value

**What to do:**
- ✅ **Type:** `quickcommerce`

**⚠️ CRITICAL:** If you leave this blank, no database will be created!
- You'll have to create it manually later
- This saves you a step

**What this means:**
- This creates a database (like a folder) inside your PostgreSQL server
- Your application will connect to this specific database

### 11.3 DB Parameter Group

**What you'll see:**
- A dropdown showing "default.postgres15" or similar

**What to do:**
- ✅ **Leave as default**

### 11.4 Option Group

**What you'll see:**
- Should show "default:postgres-15" or similar

**What to do:**
- ✅ **Leave as default**

---

## Step 12: Backup Configuration

### 12.1 Enable Automated Backups

**What you'll see:**
- A checkbox: "Enable automated backups"
- Should be CHECKED by default

**What to do:**
- ✅ **Leave it CHECKED**

**Why?**
- Free Tier includes automated backups!
- This protects your data
- No extra cost

### 12.2 Backup Retention Period

**What you'll see:**
- A dropdown or slider showing days (1-35)
- Default might be 7 days

**What to do:**
- ✅ **Set to 7 days** (or leave default if it's already 7)

**What this means:**
- AWS keeps 7 daily backups
- You can restore from any of the last 7 days
- Still free within Free Tier!

### 12.3 Backup Window

**What you'll see:**
- Options:
  - ⭕ No preference
  - ⭕ Select window

**What to do:**
- ✅ **Select "No preference"**

**Why?** Let AWS choose the best time automatically.

---

## Step 13: Encryption

### 13.1 Enable Encryption

**What you'll see:**
- A checkbox: "Enable encryption"
- Might be checked or unchecked

**What to do:**
- ✅ **CHECK this box** (enable encryption)

**Why?**
- Encrypts your data at rest
- Better security
- Still free!
- Industry best practice

### 13.2 AWS KMS Key

**What you'll see:**
- A dropdown for selecting encryption key
- Should show "aws/rds (default)"

**What to do:**
- ✅ **Leave as "aws/rds (default)"**

---

## Step 14: Monitoring

### 14.1 Enhanced Monitoring

**What you'll see:**
- A checkbox: "Enable Enhanced Monitoring"

**What to do:**
- ✅ **UNCHECK this** (leave it disabled)

**Why?**
- Enhanced monitoring costs extra money
- Basic monitoring (included free) is enough
- You can enable later if needed

---

## Step 15: Maintenance

### 15.1 Enable Auto Minor Version Upgrade

**What you'll see:**
- A checkbox: "Enable auto minor version upgrade"
- Probably checked by default

**What to do:**
- ✅ **Leave it CHECKED**

**Why?**
- Automatically applies security patches
- Keeps your database secure
- Only minor updates (safe)

### 15.2 Maintenance Window

**What you'll see:**
- Options:
  - ⭕ No preference
  - ⭕ Select window

**What to do:**
- ✅ **Select "No preference"**

---

## Step 16: Deletion Protection (Optional but Recommended)

### 16.1 Enable Deletion Protection

**What you'll see:**
- Near the bottom, a checkbox: "Enable deletion protection"

**What to do (Recommended):**
- ✅ **CHECK this box**

**Why?**
- Prevents accidental deletion
- You have to disable it first before deleting
- Protects your data from mistakes

**Alternative (If Testing):**
- ☐ **Leave UNCHECKED** if you plan to delete/recreate frequently during testing

---

## Step 17: Review and Create!

### 17.1 Estimated Monthly Costs

**What you'll see:**
- At the bottom-right, a box showing "Estimated monthly costs"
- Should say: **$0.00** (if you configured Free Tier correctly)

**⚠️ WARNING:** If it shows any cost (like $15 or more):
- ❌ **STOP! Don't create it yet!**
- Go back and check:
  - Did you select "Free tier" template? (Step 5)
  - Is instance db.t3.micro or db.t2.micro? (Step 7)
  - Is storage 20 GiB or less? (Step 8)
  - Is storage autoscaling DISABLED? (Step 8)

### 17.2 Create Database!

**What to do:**
- ✅ **Click the orange "Create database" button at the bottom**

---

## Step 18: Database Creation Process

### 18.1 What Happens Next

**You'll see:**
1. A green banner at the top: "Creating database quickcommerce-db"
2. You'll be taken to the RDS Databases list
3. Your database will show with status: **"Creating"**

### 18.2 Wait for Creation (5-10 minutes)

**What you'll see:**
- Database status: "Creating"
- A progress indicator
- Don't close the browser!

**Refresh the page every minute to check progress**

### 18.3 When Complete

**You'll see:**
- Status changes to: **"Available"** (with a green checkmark ✓)
- This means your database is ready!

---

## Step 19: Get Your Database Connection Details

### 19.1 Click on Your Database Name

**What to do:**
- ✅ **Click on "quickcommerce-db"** (the blue link)

### 19.2 Find the Endpoint

**What you'll see:**
- A page with all database details
- Look for a section called "Connectivity & security"
- Find the field: **"Endpoint"**

**It will look like:**
```
quickcommerce-db.abc123defg.us-east-1.rds.amazonaws.com
```

**What to do:**
- ✅ **Copy this entire endpoint**
- Paste it in a notepad file
- Label it: "RDS Endpoint"

### 19.3 Note the Port

**Right below Endpoint, you'll see:**
- **Port:** 5432

**What to do:**
- ✅ **Write this down** (though 5432 is standard)

---

## Step 20: Save Your Connection Information

### 20.1 Create a Secure Note

**Save these details in a safe place:**

```
=== QuickCommerce Database Credentials ===

Database Identifier: quickcommerce-db
Endpoint: quickcommerce-db.abc123defg.us-east-1.rds.amazonaws.com
Port: 5432
Master Username: dbadmin (or postgres)
Master Password: [your password here]
Database Name: quickcommerce
Region: us-east-1
```

**⚠️ KEEP THIS SECURE!** This is sensitive information.

---

## ✅ Success! Your Database is Created!

You now have:
- ✅ A PostgreSQL database running on Amazon RDS
- ✅ Free Tier eligible (free for 12 months)
- ✅ Automated backups enabled
- ✅ Encrypted storage
- ✅ Connection endpoint saved

---

## 🔍 What Each Setting Means (Summary)

| Setting | Value | Why? |
|---------|-------|------|
| **Template** | Free tier | Keeps everything free for 12 months |
| **Instance** | db.t3.micro | Small enough for Free Tier |
| **Storage** | 20 GiB | Free Tier limit |
| **Autoscaling** | Disabled | Prevents going over Free Tier |
| **Public Access** | Yes | Allows initial setup (will restrict later) |
| **Port** | 5432 | Standard PostgreSQL port |
| **Database Name** | quickcommerce | The actual database your app uses |
| **Backups** | 7 days | Protects your data (free!) |
| **Encryption** | Enabled | Security best practice (free!) |

---

## 🔐 Next Step: Configure Security Group

After your database is "Available", you need to:

1. **Allow your computer to connect** (for testing)
2. **Later, allow only your EC2 instance** (for production)

**Continue to:** Security Group configuration guide

---

## 💡 Quick Tips

**Testing Your Connection (Windows):**
```powershell
# Install PostgreSQL client first (if you don't have it)
# Then test connection:
psql -h quickcommerce-db.abc123defg.us-east-1.rds.amazonaws.com -U dbadmin -d quickcommerce
```

**Connection String Format:**
```
postgresql://dbadmin:your_password@quickcommerce-db.abc123.us-east-1.rds.amazonaws.com:5432/quickcommerce
```

---

## 🆘 Troubleshooting

### "Estimated cost is not $0"
- Check you selected "Free tier" template
- Check instance is db.t3.micro or db.t2.micro
- Check storage is 20 GiB
- Check autoscaling is disabled

### "Can't find 'Initial database name' field"
- You need to expand "Additional configuration" section
- Click the arrow to expand it

### "Database creation failed"
- Check your AWS account is verified
- Check you have billing information added (even for Free Tier)
- Try again, might be temporary issue

### "I forgot my password"
- You can reset it in the RDS console
- Select your database → Actions → Modify
- Find "New master password" section

---

## 📚 What You Just Created (Technical Details)

**In AWS Terms:**
- **RDS DB Instance:** A managed PostgreSQL server
- **Database Engine:** PostgreSQL 15.x
- **Compute:** 1 vCPU, 1 GB RAM (db.t3.micro)
- **Storage:** 20 GB SSD (gp2/gp3)
- **Availability:** Single-AZ (one datacenter)
- **Networking:** VPC, subnet group, security group
- **Security:** Encrypted at rest, password authentication

**In Simple Terms:**
- You have a PostgreSQL database server running in AWS
- It's like your local database, but in the cloud
- It's always on and accessible from anywhere (with proper credentials)
- AWS handles updates, backups, and maintenance

---

## 🎯 Next Steps

1. ✅ **Done:** Database created
2. ⏭️ **Next:** Configure security group to allow access
3. ⏭️ **Then:** Test connection from your computer
4. ⏭️ **Finally:** Set up EC2 backend to use this database

**Continue to:** `deployment/AWS_DEPLOYMENT_GUIDE.md` - Section 1.2

---

**Congratulations! You've successfully created your Amazon RDS PostgreSQL database!** 🎉

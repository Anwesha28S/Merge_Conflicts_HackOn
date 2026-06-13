# RDS PostgreSQL Creation - Quick Checklist

**Print this and check off each step as you go!**

---

## Before You Start
- [ ] AWS Account logged in
- [ ] Strong password ready
- [ ] Notepad open to save info

---

## Step-by-Step Checklist

### 1. Navigation
- [ ] Go to AWS Console (console.aws.amazon.com)
- [ ] Search for "RDS" and click it
- [ ] Click orange "Create database" button

### 2. Database Creation Method
- [ ] Select **"Standard create"** (not Easy create)

### 3. Engine Selection
- [ ] Click **"PostgreSQL"**
- [ ] Leave version as default

### 4. Template (CRITICAL!)
- [ ] Select **"Free tier"** template
- [ ] Verify you see "Free tier eligible" labels

### 5. Settings
- [ ] DB instance identifier: `quickcommerce-db`
- [ ] Master username: `dbadmin` (or your choice)
- [ ] Master password: _________________ (write it here!)
- [ ] Confirm password: (same as above)

### 6. Instance Configuration (Auto-configured)
- [ ] Verify shows: **db.t3.micro** or **db.t2.micro**
- [ ] See "Free tier eligible" label

### 7. Storage
- [ ] Allocated storage: **20 GiB**
- [ ] **UNCHECK** "Enable storage autoscaling"

### 8. Connectivity
- [ ] Select "Don't connect to an EC2 compute resource"
- [ ] Leave VPC as default
- [ ] Public access: **Yes**
- [ ] Create new security group
- [ ] Security group name: `quickcommerce-rds-sg`
- [ ] Port: **5432**

### 9. Database Authentication
- [ ] Select **"Password authentication"** only

### 10. Additional Configuration
- [ ] Click to **expand** "Additional configuration"
- [ ] Initial database name: `quickcommerce` (IMPORTANT!)

### 11. Backup
- [ ] **Keep CHECKED** "Enable automated backups"
- [ ] Backup retention: **7 days**
- [ ] Backup window: "No preference"

### 12. Encryption
- [ ] **CHECK** "Enable encryption"
- [ ] Use default AWS KMS key

### 13. Monitoring
- [ ] **UNCHECK** "Enable Enhanced Monitoring" (costs extra)

### 14. Maintenance
- [ ] **Keep CHECKED** "Enable auto minor version upgrade"
- [ ] Maintenance window: "No preference"

### 15. Deletion Protection (Optional)
- [ ] **CHECK** "Enable deletion protection" (recommended)

### 16. Final Check
- [ ] Estimated monthly costs shows: **$0.00**
- [ ] If not $0, go back and check Free Tier settings!

### 17. Create!
- [ ] Click orange **"Create database"** button

---

## After Creation (Wait 5-10 minutes)

### 18. Status Check
- [ ] Refresh page every minute
- [ ] Wait for status: **"Available"** with green checkmark

### 19. Get Connection Info
- [ ] Click on "quickcommerce-db" (database name)
- [ ] Find "Connectivity & security" section
- [ ] Copy the **Endpoint** (looks like: xxx.amazonaws.com)

### 20. Save Information

**Write this information down NOW:**

```
Endpoint: _________________________________
Port: 5432
Username: _________________________________
Password: _________________________________
Database Name: quickcommerce
```

---

## ✅ Success Criteria

You should have:
- [ ] Database status: "Available"
- [ ] Endpoint copied and saved
- [ ] Username and password saved securely
- [ ] Estimated cost: $0.00/month

---

## 🎉 You're Done!

**Next steps:**
1. Configure security group (allow your IP)
2. Test connection
3. Set up EC2 backend

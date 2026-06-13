# QuickCommerce AWS Architecture

Complete architecture documentation for the AWS-deployed QuickCommerce application.

---

## 📊 High-Level Architecture

```
                                    ┌─────────────────────────────┐
                                    │      AWS Free Tier          │
                                    │                             │
┌──────────────┐                   │  ┌───────────────────────┐ │
│              │                   │  │   AWS Amplify         │ │
│   End User   │◄─────HTTPS────────┼──│   (Frontend Host)     │ │
│   Browser    │                   │  │   React + Vite        │ │
│              │                   │  │                       │ │
└──────────────┘                   │  └──────────┬────────────┘ │
                                    │             │              │
                                    │             │ HTTPS        │
                                    │             │              │
                                    │  ┌──────────▼────────────┐ │
                                    │  │   Amazon EC2          │ │
                                    │  │   Ubuntu 22.04        │ │
                                    │  │   t2.micro/t3.micro   │ │
                                    │  │                       │ │
                                    │  │  ┌─────────────────┐ │ │
                                    │  │  │     Nginx       │ │ │
                                    │  │  │   Port 80/443   │ │ │
                                    │  │  └────────┬────────┘ │ │
                                    │  │           │          │ │
                                    │  │  ┌────────▼────────┐ │ │
                                    │  │  │    Uvicorn      │ │ │
                                    │  │  │  FastAPI (x2)   │ │ │
                                    │  │  │   Port 8080     │ │ │
                                    │  │  └────────┬────────┘ │ │
                                    │  └───────────┼──────────┘ │
                                    │              │            │
                        ┌───────────┼──────────────┼───────────┐│
                        │           │              │           ││
                        │           │  ┌───────────▼────────┐ ││
                        │           │  │  Amazon RDS        │ ││
                        │           │  │  PostgreSQL 15.x   │ ││
                        │           │  │  db.t3.micro       │ ││
                        │           │  │  20 GB Storage     │ ││
                        │           │  └────────────────────┘ ││
                        │           │                         ││
                        │           │  ┌────────────────────┐ ││
                        │           │  │  AWS Bedrock       │ ││
                        │           │  │  Amazon Nova Micro │ ││
                        │           │  │  (LLM Service)     │ ││
                        │           │  └────────────────────┘ ││
                        │           └─────────────────────────┘│
                        └──────────────────────────────────────┘
```

---

## 🔀 Request Flow

### 1. Frontend Request Flow

```
User Action
    │
    ▼
Browser (React App)
    │
    ▼
API Call (axios)
    │
    │ GET/POST http://EC2_IP/api/...
    │ Headers: { Authorization: "Bearer JWT" }
    │
    ▼
AWS Amplify CDN
    │
    ▼
Amazon EC2 (Public IP)
    │
    ▼
Nginx (:80) ──────► Backend Health?
    │                    Yes → Continue
    │                    No → 502 Bad Gateway
    ▼
Reverse Proxy
    │
    ▼
Uvicorn (:8080)
    │
    ▼
FastAPI Router
    │
    ├──► /api/auth/* ──► Auth Router ──► JWT Validation
    │
    ├──► /api/products/* ──► Products Router
    │
    ├──► /api/cart/* ──► Cart Router ──► Database
    │
    ├──► /api/chat ──► Chat Router ──► LLM Service ──► Bedrock
    │
    └──► /api/profile/* ──► Profile Router ──► Database
    
```

### 2. Chat Request Flow (Detailed)

```
User: "Movie night snacks under ₹300"
    │
    ▼
Frontend ChatPage.jsx
    │
    ▼
chatAPI.send(message, history)
    │
    ▼
axios POST /api/chat
    {
      "message": "Movie night snacks under ₹300",
      "history": [...]
    }
    │
    ▼
EC2: Nginx → Uvicorn → FastAPI
    │
    ▼
Chat Router (/api/chat)
    │
    ├──► Verify JWT Token
    │
    ├──► Load User Profile (Dietary Prefs)
    │
    ▼
LLM Service (llm_service.py)
    │
    ├──► Query RAG Service
    │    │
    │    ├──► Load products.json
    │    │
    │    ├──► Apply filters (vegetarian/vegan/protein)
    │    │
    │    └──► Return top 15 relevant products
    │
    ├──► Build System Prompt
    │    │
    │    ├──► Base instructions
    │    │
    │    ├──► User dietary preferences
    │    │
    │    └──► Product catalog (JSON)
    │
    ├──► Format Message History
    │    │
    │    ├──► Filter: Remove leading assistant messages
    │    │
    │    └──► Convert to Bedrock format
    │
    ├──► Call AWS Bedrock
    │    │
    │    POST to Bedrock Converse API
    │    {
    │      "modelId": "amazon.nova-micro-v1:0",
    │      "messages": [...],
    │      "system": [...],
    │      "inferenceConfig": {...}
    │    }
    │    │
    │    ▼
    │   AWS Bedrock (us-east-1)
    │    │
    │    ├──► Process with Nova Micro model
    │    │
    │    └──► Return JSON response
    │
    ├──► Parse Response
    │    │
    │    ├──► Strip markdown code blocks
    │    │
    │    ├──► Parse JSON
    │    │
    │    └──► Validate structure
    │
    └──► Return to Frontend
         {
           "message": "Here are some great movie snacks!",
           "recommendations": [
             { "id": "...", "name": "...", "price": 50, ... }
           ],
           "total": 280,
           "reasoning": "..."
         }
```

### 3. Authentication Flow

```
User Registration
    │
    ▼
POST /api/auth/register
    {
      "username": "john",
      "email": "john@example.com",
      "password": "secret123"
    }
    │
    ▼
Auth Router
    │
    ├──► Validate input (Pydantic)
    │
    ├──► Check if user exists (Query RDS)
    │
    ├──► Hash password (bcrypt)
    │
    ├──► Create user record (RDS INSERT)
    │
    ├──► Create user profile (RDS INSERT)
    │
    └──► Return success
    
User Login
    │
    ▼
POST /api/auth/login
    {
      "username": "john",
      "password": "secret123"
    }
    │
    ▼
Auth Router
    │
    ├──► Query user from RDS
    │
    ├──► Verify password (bcrypt)
    │
    ├──► Generate JWT token
    │    │
    │    └──► jwt.encode({
    │          "sub": user.id,
    │          "exp": datetime + 24h
    │        }, SECRET_KEY)
    │
    └──► Return token
         {
           "access_token": "eyJ...",
           "token_type": "bearer",
           "user": { "id": "...", "username": "..." }
         }

Authenticated Request
    │
    ▼
Any API call with header:
    Authorization: Bearer eyJ...
    │
    ▼
get_current_user() dependency
    │
    ├──► Extract token from header
    │
    ├──► Decode JWT
    │
    ├──► Verify signature and expiration
    │
    ├──► Query user from RDS
    │
    └──► Inject user into route handler
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────┐
│              users                           │
├─────────────────────────────────────────────┤
│ id (PK)              VARCHAR(36)   UUID     │
│ username             VARCHAR        UNIQUE   │
│ email                VARCHAR        UNIQUE   │
│ hashed_password      VARCHAR                │
│ is_active            BOOLEAN       DEFAULT T│
│ created_at           TIMESTAMP     NOW()    │
└─────┬───────────────────────────────────────┘
      │
      │ 1:N
      │
      ├──────────────────────────────┐
      │                              │
      ▼                              ▼
┌───────────────────────┐  ┌─────────────────────────────┐
│   cart_items          │  │   user_profiles             │
├───────────────────────┤  ├─────────────────────────────┤
│ id (PK)      VARCHAR  │  │ id (PK)         VARCHAR     │
│ user_id (FK) VARCHAR  │  │ user_id (FK)    VARCHAR 1:1 │
│ product_id   VARCHAR  │  │ is_vegetarian   BOOLEAN     │
│ quantity     INTEGER  │  │ is_vegan        BOOLEAN     │
│ added_at     TIMESTAMP│  │ is_high_protein BOOLEAN     │
└───────────────────────┘  │ budget_pref     INTEGER     │
                           │ fav_categories  TEXT (JSON) │
                           └─────────────────────────────┘
```

### Sample Queries

**Get user with profile:**
```sql
SELECT u.*, p.is_vegetarian, p.is_vegan, p.budget_preference
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.username = 'john';
```

**Get user cart:**
```sql
SELECT c.product_id, c.quantity, c.added_at
FROM cart_items c
WHERE c.user_id = '123e4567-e89b-12d3-a456-426614174000'
ORDER BY c.added_at DESC;
```

**Update dietary preferences:**
```sql
UPDATE user_profiles
SET is_vegetarian = true, is_vegan = false, budget_preference = 500
WHERE user_id = '123e4567-e89b-12d3-a456-426614174000';
```

---

## 🔐 Security Architecture

### 1. Network Security

```
Internet
    │
    ▼
┌─────────────────────────────────┐
│   AWS Security Groups           │
├─────────────────────────────────┤
│                                 │
│  EC2 Security Group:            │
│  ├─ Inbound                     │
│  │  ├─ SSH (22): YOUR_IP only  │
│  │  ├─ HTTP (80): 0.0.0.0/0    │
│  │  └─ HTTPS (443): 0.0.0.0/0  │
│  └─ Outbound: All              │
│                                 │
│  RDS Security Group:            │
│  ├─ Inbound                     │
│  │  └─ PostgreSQL (5432):      │
│  │     EC2 Security Group only │
│  └─ Outbound: None needed      │
│                                 │
└─────────────────────────────────┘
```

### 2. Application Security

```
┌──────────────────────────────────────┐
│   FastAPI Security Layers            │
├──────────────────────────────────────┤
│                                      │
│  1. CORS Middleware                  │
│     └─ Whitelist allowed origins    │
│                                      │
│  2. JWT Authentication               │
│     ├─ Token generation (login)     │
│     ├─ Token verification (routes)  │
│     └─ Token expiration (24h)       │
│                                      │
│  3. Password Security                │
│     ├─ Bcrypt hashing (cost=12)     │
│     └─ Never store plain passwords  │
│                                      │
│  4. Input Validation                 │
│     ├─ Pydantic schemas              │
│     └─ Type checking                 │
│                                      │
│  5. SQL Injection Prevention         │
│     └─ SQLAlchemy ORM (parameterized)│
│                                      │
│  6. Rate Limiting (Future)           │
│     └─ To be implemented             │
│                                      │
└──────────────────────────────────────┘
```

### 3. Data Security

```
┌──────────────────────────────────────┐
│   Data Protection                    │
├──────────────────────────────────────┤
│                                      │
│  In Transit:                         │
│  ├─ Frontend ↔ Backend: HTTPS       │
│  ├─ Backend ↔ RDS: SSL (optional)   │
│  └─ Backend ↔ Bedrock: HTTPS        │
│                                      │
│  At Rest:                            │
│  ├─ RDS: Encryption enabled         │
│  └─ Secrets: .env file (not in Git) │
│                                      │
│  Access Control:                     │
│  ├─ RDS: Username/password          │
│  ├─ Bedrock: AWS IAM keys           │
│  └─ API: JWT tokens                 │
│                                      │
└──────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current Architecture (Free Tier)

- **EC2**: 1 instance, 2 uvicorn workers
- **RDS**: 1 instance, 5 connections in pool
- **Capacity**: ~50-100 concurrent users

### Scaling Options (Future)

#### Horizontal Scaling

```
                    ┌─────────────────┐
                    │   AWS ALB       │
                    │ Load Balancer   │
                    └────────┬────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
      ┌─────────┐      ┌─────────┐      ┌─────────┐
      │  EC2-1  │      │  EC2-2  │      │  EC2-3  │
      │ FastAPI │      │ FastAPI │      │ FastAPI │
      └────┬────┘      └────┬────┘      └────┬────┘
           │                │                │
           └────────────────┼────────────────┘
                            │
                            ▼
                    ┌─────────────────┐
                    │   Amazon RDS    │
                    │ Read Replicas   │
                    └─────────────────┘
```

#### Caching Layer

```
FastAPI
    │
    ├──► Redis Cache
    │    (Product catalog, user sessions)
    │
    └──► RDS
         (Persistent data)
```

---

## 💾 Data Flow

### Product Recommendation Flow

```
1. User Query
   "Need breakfast for gym"
   
2. RAG Service
   ├─ Load products.json (15K products)
   ├─ Apply filters:
   │  └─ is_high_protein = true (from user profile)
   └─ Return top 15 matches
   
3. LLM Prompt Construction
   System: "You are QuickBot..."
   User Profile: "User prefers high-protein, budget ₹500"
   Catalog: [15 products as JSON]
   User Message: "Need breakfast for gym"
   
4. Bedrock API Call
   POST /converse
   Model: amazon.nova-micro-v1:0
   Temperature: 0.3
   Max Tokens: 2048
   
5. Response Processing
   Raw: "```json\n{...}\n```"
   ├─ Strip markdown
   ├─ Parse JSON
   └─ Validate schema
   
6. Return to Frontend
   {
     "message": "Here's a protein-packed breakfast!",
     "recommendations": [
       { "id": "eggs-12", "name": "Farm Eggs", "price": 96, ... },
       { "id": "oats-1kg", "name": "Quaker Oats", "price": 120, ... },
       ...
     ],
     "total": 285,
     "reasoning": "High protein options within budget"
   }
```

---

## 🔄 CI/CD Pipeline (Current)

### Frontend (AWS Amplify)

```
GitHub Push
    │
    ▼
AWS Amplify Trigger
    │
    ▼
┌────────────────────────────┐
│   Build Phase              │
├────────────────────────────┤
│ 1. Provision               │
│    └─ Allocate build env   │
│                            │
│ 2. Pre-Build               │
│    ├─ cd frontend          │
│    └─ npm ci               │
│                            │
│ 3. Build                   │
│    └─ npm run build        │
│                            │
│ 4. Post-Build              │
│    └─ Create artifacts     │
│                            │
│ 5. Deploy                  │
│    ├─ Upload to S3         │
│    └─ Invalidate CloudFront│
└────────────────────────────┘
    │
    ▼
Live at: https://main.xxx.amplifyapp.com
```

### Backend (Manual - For Now)

```
Local Changes
    │
    ▼
Git Commit & Push
    │
    ▼
Manual Deployment:
    │
    ├─ scp -i key.pem -r backend/ ubuntu@EC2:/var/www/quickcommerce/
    │
    ├─ ssh ubuntu@EC2
    │
    ├─ cd /var/www/quickcommerce/backend
    │
    ├─ source venv/bin/activate
    │
    ├─ pip install -r requirements.txt
    │
    └─ sudo systemctl restart quickcommerce
    
Future: GitHub Actions CI/CD
```

---

## 📊 Monitoring & Logging

### Log Sources

```
┌─────────────────────────────────────────────┐
│   Application Logs                          │
├─────────────────────────────────────────────┤
│                                             │
│  FastAPI Application:                       │
│  └─ sudo journalctl -u quickcommerce -f    │
│                                             │
│  Nginx Access:                              │
│  └─ /var/log/nginx/access.log              │
│                                             │
│  Nginx Error:                               │
│  └─ /var/log/nginx/error.log               │
│                                             │
│  System:                                    │
│  └─ /var/log/syslog                        │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│   AWS CloudWatch (Optional)                 │
├─────────────────────────────────────────────┤
│                                             │
│  EC2 Metrics:                               │
│  ├─ CPU Utilization                         │
│  ├─ Network In/Out                          │
│  └─ Disk I/O                                │
│                                             │
│  RDS Metrics:                               │
│  ├─ Database Connections                    │
│  ├─ CPU Utilization                         │
│  ├─ Free Storage Space                      │
│  └─ Read/Write IOPS                         │
│                                             │
│  Amplify:                                   │
│  ├─ Build Duration                          │
│  └─ Deployment Status                       │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🎯 Performance Characteristics

### Expected Response Times

| Endpoint | Expected Time | Notes |
|----------|---------------|-------|
| `/health` | < 50ms | No DB query |
| `/api/auth/login` | < 200ms | 1 DB query |
| `/api/products` | < 300ms | JSON file read |
| `/api/cart` | < 200ms | 1-2 DB queries |
| `/api/chat` | 3-8 seconds | Bedrock API call |

### Bottlenecks

1. **LLM Calls**: 3-8 seconds (AWS Bedrock latency)
2. **Database**: Connection pool limit (5)
3. **EC2**: Single instance, 2 workers

---

## 💰 Cost Breakdown

### Monthly AWS Costs (After Free Tier)

```
┌──────────────────────────────────────┐
│   Service         Cost/Month         │
├──────────────────────────────────────┤
│   EC2 t2.micro    $8.50              │
│   RDS db.t3.micro $15.00             │
│   EBS Storage     $2.00              │
│   Amplify         $0-5.00            │
│   Bedrock Nova    $1-5.00 (usage)    │
│   Data Transfer   $0-2.00            │
├──────────────────────────────────────┤
│   TOTAL           ~$30-35/month      │
└──────────────────────────────────────┘

Free Tier (First 12 months):
└─ EC2 + RDS + Amplify = $0
└─ Bedrock + Data Transfer = $1-5
└─ TOTAL: ~$1-5/month
```

---

## 🚀 Deployment Topology

### Current Deployment

```
┌───────────────────────────────────────────────────────┐
│                    AWS Region: us-east-1              │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │   Availability Zone A                           │ │
│  │                                                 │ │
│  │   ┌───────────────┐    ┌───────────────┐      │ │
│  │   │   EC2         │    │   RDS         │      │ │
│  │   │   Instance    │───▶│   Primary     │      │ │
│  │   └───────────────┘    └───────────────┘      │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │   Global                                        │ │
│  │   ┌───────────────┐                            │ │
│  │   │   Amplify     │                            │ │
│  │   │   CloudFront  │                            │ │
│  │   └───────────────┘                            │ │
│  └─────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### High Availability (Future)

```
┌───────────────────────────────────────────────────────┐
│                    AWS Region: us-east-1              │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │   Availability Zone A                           │ │
│  │   ┌───────────────┐    ┌───────────────┐      │ │
│  │   │   EC2-1       │───▶│   RDS         │      │ │
│  │   │   Instance    │    │   Primary     │      │ │
│  │   └───────────────┘    └───────────────┘      │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │   Availability Zone B                           │ │
│  │   ┌───────────────┐    ┌───────────────┐      │ │
│  │   │   EC2-2       │───▶│   RDS         │      │ │
│  │   │   Instance    │    │   Read Replica│      │ │
│  │   └───────────────┘    └───────────────┘      │ │
│  └─────────────────────────────────────────────────┘ │
│                    ▲                                  │
│                    │                                  │
│         ┌──────────┴───────────┐                     │
│         │  Application         │                     │
│         │  Load Balancer       │                     │
│         └──────────────────────┘                     │
└───────────────────────────────────────────────────────┘
```

---

## 📚 Technology Stack Summary

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios
- **Routing**: React Router 6
- **Icons**: Lucide React
- **Hosting**: AWS Amplify

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn (ASGI)
- **Reverse Proxy**: Nginx
- **ORM**: SQLAlchemy 2
- **Authentication**: JWT (python-jose)
- **Password Hashing**: Bcrypt (passlib)
- **Validation**: Pydantic
- **Hosting**: Amazon EC2 (Ubuntu 22.04)

### Database
- **RDBMS**: PostgreSQL 15
- **Driver**: psycopg2
- **Hosting**: Amazon RDS

### AI/ML
- **LLM**: Amazon Nova Micro
- **API**: AWS Bedrock Converse API
- **SDK**: boto3

### DevOps
- **CI/CD Frontend**: AWS Amplify
- **CI/CD Backend**: Manual (future: GitHub Actions)
- **Process Manager**: systemd
- **Monitoring**: CloudWatch (optional)

---

**This architecture supports the QuickCommerce application on AWS Free Tier with room for future scaling.**

# 🛒 Amazon Now — Shopping Reimagined with AI

**Amazon Now** is the next generation of quick commerce — where every shopping journey is powered by **Aria**, your intelligent AI shopping companion. Combining conversational commerce, real-time personalization, and contextual intelligence, Amazon Now transforms everyday shopping into a seamless, intuitive, and deeply personalized experience.

> 🔗 **Live Demo:** [https://merge-conflicts-hack-on.vercel.app](https://merge-conflicts-hack-on.vercel.app)

---

## ✨ Amazon, But Smarter. Faster. More Personal.

Imagine if Amazon could understand what you want before you finish typing, negotiate deals on your behalf, plan your meals for the entire week, and recommend products based on your lifestyle, the weather outside, and what's trending right now. That's Amazon Now.

At the heart of the experience is **Aria** — an AI-powered shopping assistant that helps users discover products naturally through conversation, optimize their purchases, and make smarter shopping decisions in real time.

**What makes Amazon Now different:**

- 💬 Natural conversations instead of keyword searches
- 🌦️ Personalized recommendations driven by real-world context (weather, time, events, festivals)
- 🤝 Collaborative shopping experiences for families, roommates, and groups
- 🍽️ Intelligent meal planning that auto-generates a week's grocery list
- 💰 AI-powered bargaining using game theory to negotiate the best prices
- 🔄 Dynamic substitutions when products are out of stock
- 🤒 Emotional intelligence that detects when you're sick, stressed, or celebrating — and assembles a personalized Care Kit

---

## 🧠 Core Features

### 🤖 Aria AI Shopping Assistant

Aria is the conversational backbone of Amazon Now, powered by Groq's **Llama 3.1 8B Instant** LLM with automatic fallback to **Gemma2 9B IT** when rate limits are hit. Instead of typing search queries, users simply talk to Aria:

- *"I'm hosting a party tonight, what should I get?"*
- *"Show me healthy breakfast options under ₹200"*
- *"I'm feeling sick, can you suggest something?"*

Aria understands intent, applies real-world context, and responds with curated product recommendations organized into Amazon-style department categories.

**How it works under the hood:**
1. User message → Intent detection (purchase, bargain, recipe, browse)
2. RAG pipeline queries the product catalog using semantic search
3. Context service injects live weather, time-of-day, and event signals
4. LLM generates a structured JSON response with product recommendations
5. Taxonomy service organizes results into 8 Amazon-style departments

---

### 🎙️ Voice Commerce

Shop completely hands-free using built-in browser speech recognition. Speak your request, and Aria processes it exactly like a text message. The response is also spoken back using text-to-speech, enabling a fully conversational shopping experience.

> **Note:** Voice features require HTTPS. The live deployment on Vercel provides this automatically.

---

### 🤒 Emotional & Situational Intelligence

Amazon Now detects 8 distinct emotional or situational contexts from your messages and assembles a complete, scenario-aware **Care Kit** of products:

| Situation | Trigger Examples | Kit Name |
|-----------|-----------------|----------|
| 🤒 Sick | "I have a fever", "sore throat" | Recovery Care Kit |
| 🎉 Celebrating | "It's my birthday", "got the job" | Celebration Bundle |
| 🫶 Stressed | "bad day", "burnt out" | Comfort & Unwind Kit |
| 🥗 Dieting | "craving something healthy" | Guilt-Free Craving Kit |
| 💪 Workout | "post-workout", "gym day" | Fuel & Recover Kit |
| 📚 Studying | "pulling an all-nighter" | Study Fuel Kit |
| 🥴 Hungover | "drank too much last night" | Morning-After Kit |
| 😴 Lazy | "can't cook tonight" | Zero-Effort Meal Kit |

Each Care Kit respects the user's dietary preferences (vegetarian, vegan, high-protein) and budget constraints.

---

### 💬 AI-Powered Smart Bargaining

A first-of-its-kind **Stackelberg game theory negotiation engine** that lets users haggle with Aria for better prices:

**How the negotiation works:**
- Seller (Aria) sets a price band `[cost floor, list price]` using category-specific margin data
- Buyer makes an offer via natural language (*"Can you do it for ₹500?"*)
- The engine computes the Nash equilibrium payoff and responds intelligently:

| Offer Range | Outcome |
|------------|---------|
| ≥ 95% of list price | ✅ Accepted with round-off discount |
| 90–95% of list | Counter at 8% discount |
| Above cost + margin floor | Counter with product swap or bundle add-on |
| Below cost floor | Politely decline, offer cheapest alternative |

Loyal customers get up to 12% additional flexibility based on their purchase history.

---

### 🤝 Collaborative Group Carts

Shop together with family, roommates, or friends through synchronized group carts:

1. **Create a Group** — generates a unique shareable code
2. **Share the Code** — anyone with the code can join the session
3. **Add Items** — each member can propose products to the shared cart
4. **Vote** — members upvote or downvote proposed items
5. **Checkout** — the group owner can push all approved items into their personal cart

Dietary preferences of all members (vegetarian, vegan) are tracked for consensus-aware recommendations.

---

### 🍽️ AI Meal Planner

Generate a personalized multi-day meal plan (1–7 days) with automatic grocery list generation:

1. User specifies a goal (e.g., *"balanced healthy meals"*, *"high protein"*), number of days, and servings
2. LLM generates structured meal plans (breakfast, lunch, dinner for each day)
3. Every ingredient is automatically mapped to real products in the catalog
4. Quantities are deduplicated and scaled across all meals into a single optimized shopping list
5. Pantry staples (salt, oil, spices) are not over-counted

Respects dietary constraints: vegetarian, vegan, high-protein, and weight-loss modes.

---

### 🧾 Recipe-to-Cart Conversion

Paste any recipe text, and Aria instantly:
1. Parses it into a structured ingredient list using the LLM
2. Matches each ingredient to a real product in the catalog
3. Skips items the user recently purchased (deduplication via order history)
4. Presents the matched products with one-click "Add All to Cart"

---

### 🔍 Semantic Product Discovery

ChromaDB-powered vector search with Sentence Transformers (`all-MiniLM-L6-v2`) understands meaning and intent, delivering highly relevant recommendations beyond traditional keyword matching. Falls back to a lightweight Python-based fuzzy search on resource-constrained environments.

---

### 🔄 Intelligent Product Substitution

When a product is out of stock, the system doesn't just say "unavailable." It:
1. Searches for in-stock alternatives in the same category
2. Matches by tag overlap, price proximity, and rating
3. Clearly labels substitutions with the original product name and the reason for the swap

---

### 🌤️ Context-Aware Recommendations

The **Context Service** injects three layers of real-world intelligence into every recommendation:

**1. Live Weather** (via WeatherAPI.com)
- Rainy → Hot snacks, chai, maggi noodles, soup
- Hot (35°C+) → Cold drinks, ice cream, watermelon, buttermilk
- Cold (≤15°C) → Coffee, tea, hot chocolate, soups

**2. Time of Day**
- Morning → Eggs, milk, bread, coffee, cereal
- Afternoon → Snacks, cold drinks, fruits
- Evening → Tea-time items, cookies, pakoda
- Night → Comfort food, ice cream, instant noodles

**3. Event Detection**
- 🏏 IPL Season (March–May evenings) → Party snacks, chips, popcorn, cold drinks
- 🎉 Weekends → Family groceries, party supplies, baking items
- 🎊 Friday Evening → Party food and celebration snacks
- 🪔 Festival Season (Oct–Nov) → Sweets, dry fruits, gift packs

---

### 💰 Cart Optimization Engine

Proactively monitors the user's cart value against business thresholds:

| Threshold | Amount | Benefit |
|-----------|--------|---------|
| Free Delivery | ₹399 | Save ₹49 delivery charge |
| Coupon Discount | ₹499 | Get ₹75 off |

When the cart is within ₹150 of a threshold, Aria suggests specific products from the user's **frequently purchased items** to cross it — maximizing savings automatically.

---

### 🍷 Smart Pairing Engine (Graph-Traversal BFS)

A **directed weighted graph** models "frequently bought together" relationships across the entire catalog:

- **Nodes** = product IDs
- **Edges** = complementary purchase probability (weight 0–1)
- **Algorithm** = Priority-queue Best-First Search (BFS) up to depth 2

Examples of built-in pairing edges:
- Nachos → Condiments (0.95), Chips → Beverages (0.90)
- Coffee → Dairy (0.93), Smartphones → Mobile Accessories (0.95)
- Mascara → Eyeliner (0.90), Women's Dresses → Heels (0.85)

Results are grouped into visual clusters like "Snack Party Bundle 🍿", "Tech Ecosystem Bundle 📱", or "Beauty Routine Bundle 💄".

---

### 📊 Amazon-Style Department Taxonomy

All 194+ products are organized into **8 top-level Amazon India departments** with tier-2 sub-categories:

| Department | Sub-categories |
|-----------|---------------|
| 📦 Grocery & Gourmet Foods | Grocery & Gourmet |
| 📦 Home & Kitchen | Furniture, Home Décor, Kitchen Tools |
| 📦 Electronics & Accessories | Smartphones, Laptops, Tablets, Mobile Accessories |
| 📦 Clothing, Shoes & Jewelry | Men's Shirts, Men's Shoes, Women's Dresses, Bags, Jewellery, Tops, Sunglasses |
| 📦 Beauty & Personal Care | Makeup & Beauty, Skin Care, Fragrances |
| 📦 Watches & Accessories | Men's Watches, Women's Watches |
| 📦 Sports, Fitness & Outdoors | Sports & Fitness Accessories |

---

### 🛍️ Full E-Commerce Flow

Amazon Now includes a complete end-to-end shopping infrastructure:

- **User Authentication** — JWT-based registration and login with bcrypt password hashing
- **Product Catalog** — Browsable product grid with category filters, search, and sorting
- **Shopping Cart** — Add, remove, update quantities, clear cart
- **Saved Addresses** — CRUD with default address selection (full Indian address format: line1, line2, city, state, pincode)
- **Payment Methods** — Card, UPI, Cash on Delivery, Net Banking, Wallet (demo/mock — no real card data stored)
- **Order Management** — Place orders, view order history, track payment status (pending → paid → completed)
- **User Profiles** — Dietary preferences (vegetarian, vegan, high-protein, weight-loss mode), budget preference, favorite categories

---

## 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                        Frontend (Vercel)                         │
│                                                                  │
│  React 18 + Vite + Tailwind CSS                                  │
│                                                                  │
│  Pages:                                                          │
│  ├── ChatPage        → Aria AI conversation interface            │
│  ├── ProductsPage    → Browsable product catalog                 │
│  ├── MealPlannerPage → Weekly meal plan generator                │
│  ├── GroupCartPage   → Collaborative group shopping              │
│  ├── PaymentPage     → Order payment portal                      │
│  ├── OrdersPage      → Order history                             │
│  ├── AccountPage     → Profile & preferences                     │
│  └── Login/Register  → JWT authentication                        │
│                                                                  │
│  Vercel Serverless Proxy (api/proxy.js)                          │
│  └── Securely forwards /api/* to AWS backend over HTTP           │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS → HTTP Proxy
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                  Backend (AWS Elastic Beanstalk)                  │
│                  Dockerized FastAPI Application                   │
│                                                                  │
│  Routers (13 API modules):                                       │
│  ├── /api/auth/*       → Register, Login, JWT tokens             │
│  ├── /api/chat         → Aria AI chat endpoint                   │
│  ├── /api/products/*   → Catalog browsing & search               │
│  ├── /api/cart/*       → Cart CRUD operations                    │
│  ├── /api/orders/*     → Order creation & history                │
│  ├── /api/profile      → User dietary preferences                │
│  ├── /api/recipe/*     → Recipe-to-cart parsing                  │
│  ├── /api/meal-plan    → AI meal plan generation                 │
│  ├── /api/bargain      → Game-theory price negotiation           │
│  ├── /api/pairing      → Graph-BFS product pairing              │
│  ├── /api/group/*      → Group cart sessions                     │
│  ├── /api/addresses/*  → Saved delivery addresses                │
│  └── /api/payment-methods/* → Saved payment methods              │
│                                                                  │
│  Services (12 AI/business modules):                              │
│  ├── llm_service       → Groq API with model fallback            │
│  ├── agent_service     → Purchase intent + checkout flow         │
│  ├── rag_service       → Semantic product search (ChromaDB)      │
│  ├── bargain_service   → Stackelberg negotiation engine          │
│  ├── emotion_service   → Situational Care Kit assembly           │
│  ├── context_service   → Weather + Time + Event triggers         │
│  ├── pairing_service   → Graph-traversal BFS pairing             │
│  ├── meal_planner_service → Multi-day meal plan + shopping list  │
│  ├── order_service     → Order lifecycle + cart optimization     │
│  ├── product_service   → Product data loading                    │
│  ├── taxonomy_service  → Amazon department tree mapping          │
│  └── group_service     → Group session management                │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │ TCP (Port 5432)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    AWS RDS (PostgreSQL)                           │
│                                                                  │
│  Tables: users, cart_items, user_profiles, orders, order_items,  │
│          addresses, payment_methods, group_sessions,             │
│          group_members, group_items                               │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | Component-based UI library |
| Vite | High-performance build tool and dev server |
| Tailwind CSS | Utility-first CSS framework |
| React Router v6 | Client-side routing with protected routes |
| Axios | Promise-based HTTP client with JWT interceptors |
| GSAP | Micro-animations and page transitions |
| Lucide React | Modern SVG icon library |
| Web Speech API | Browser-native voice recognition and text-to-speech |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | Async Python web framework with auto-generated OpenAPI docs |
| SQLAlchemy | ORM for database models and queries |
| PostgreSQL | Production relational database (SQLite for local dev) |
| Pydantic v2 | Request/response validation with `model_validate` |
| python-jose | JWT token creation and verification |
| bcrypt | Secure password hashing |
| Docker | Containerization for consistent deployments |

### Artificial Intelligence
| Technology | Purpose |
|-----------|---------|
| Groq API | Ultra-fast LLM inference |
| Llama 3.1 8B Instant | Primary language model for recommendations |
| Gemma2 9B IT | Automatic fallback model when rate-limited |
| ChromaDB | Vector database for semantic product search |
| Sentence Transformers | `all-MiniLM-L6-v2` embedding model |
| WeatherAPI.com | Live weather data for contextual recommendations |

### Cloud Infrastructure
| Technology | Purpose |
|-----------|---------|
| AWS Elastic Beanstalk | Managed Docker deployment with health monitoring |
| AWS RDS | Managed PostgreSQL database |
| Vercel | Frontend hosting with Edge CDN and automatic HTTPS |
| Vercel Serverless Functions | Custom API proxy to bridge HTTPS↔HTTP |

---

## 🚀 Quick Start

### Prerequisites

* Python 3.10+
* Node.js 18+
* Docker & Docker Compose
* Groq API Key ([console.groq.com](https://console.groq.com))

---

### Backend Setup

```bash
cd backend
cp .env.example .env
```

Add the following environment variables:

```env
GROQ_API_KEY=your_groq_key
DATABASE_URL=your_database_url
```

Run the backend:

```bash
docker-compose up --build
```

Backend runs on: `http://localhost:8080`
API Documentation: `http://localhost:8080/docs`

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## ☁️ Cloud Deployment

### AWS Elastic Beanstalk (Backend)

```bash
git archive -o amazon-now.zip HEAD frontend backend docker-compose.yml
```

Upload to Elastic Beanstalk Docker Environment and configure:

```env
GROQ_API_KEY=your_key
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### AWS RDS (Database)

Managed PostgreSQL database used for: Users, Carts, Orders, Profiles, Addresses, Payment Methods, Group Sessions

### Vercel (Frontend)

Deploy the `frontend` folder directly through Vercel with root directory set to `frontend`. Custom serverless proxy at `api/proxy.js` bridges HTTPS frontend to HTTP backend. Provides automatic HTTPS, global CDN, and zero-downtime deployments.

---

## 👤 How to Use Amazon Now (Step-by-Step Guide)

### 1. Create Your Account
Open the app and click **Create Account**. Enter your username, email, and password. You are automatically logged in and redirected to Aria.

### 2. Set Your Preferences
Click on the **Account** tab. Set your dietary preferences (Vegetarian, Vegan, High-Protein, or Weight-Loss mode), budget preference, and favorite product categories.

### 3. Start Shopping with Aria
Type or speak to Aria naturally:
- *"Show me snacks under ₹100"*
- *"I need ingredients for butter chicken"*
- *"What should I buy for a rainy evening?"*

Click the **+** button on any product card to add it to your cart.

### 4. Try Voice Shopping
Click the **microphone icon** in the chat, speak your request naturally, and Aria responds with product suggestions. The response is also spoken back to you.

### 5. Negotiate a Better Price
Try saying *"Can you do this for ₹400?"* or *"Any discount on this?"* — Aria will accept, counter-offer, or politely decline based on fair pricing logic.

### 6. Plan Your Meals
Go to the **Meal Planner** tab. Choose your goal, select the number of days (1–7) and servings. Click **Add All to Cart** to instantly add all the required groceries.

### 7. Shop with Friends (Group Cart)
Go to the **Group Cart** tab, create a group, and share the code. Everyone can add products and vote on items. The group owner checks out the agreed items.

### 8. Checkout & Pay
Say *"buy this"* or *"checkout"* to Aria — she will guide you through address and payment selection. Choose Card, UPI, COD, Net Banking, or Wallet and complete your order.

### 9. Track Your Orders
Go to the **Orders** tab to view your complete order history with itemized breakdowns, delivery charges, and payment status.

---

## 💡 Why Amazon Now?

| Traditional E-Commerce | Amazon Now |
|----------------------|-----------|
| Type keywords, scroll through pages | Talk to Aria naturally, get instant results |
| Same recommendations for everyone | Personalized by weather, time, mood, and diet |
| No price negotiation | Bargain with AI using game theory |
| Shop alone | Group carts for families and roommates |
| Manually search for recipe ingredients | Paste a recipe, get the grocery list instantly |
| Discover products by browsing | AI suggests based on your situation (sick, studying, celebrating) |
| Static product suggestions | Dynamic recommendations that change with real-world context |

---

## 📈 Innovation Highlights

### 🎯 Conversational Commerce
Move beyond keyword search into fully natural shopping conversations. Aria understands *"I'm hosting a dinner party for 6"* and recommends a complete set of ingredients, snacks, and beverages — something a search bar could never do.

### 🧠 Contextual Intelligence
Recommendations adapt dynamically based on weather, time, festivals, IPL cricket season, weekends, and the user's emotional state. No two sessions produce the same results.

### 🎲 Game-Theory Bargaining
The Stackelberg negotiation model considers category margins, cost floors, buyer loyalty, and product alternatives to create a fair and engaging haggling experience that feels genuinely human.

### 👥 Collaborative Commerce
Group Carts enable families and roommates to plan and shop together with voting, consensus building, and shared dietary preference tracking — a feature absent from every major e-commerce platform.

### 🔬 Graph-Based Product Discovery
The BFS pairing engine discovers non-obvious product relationships (Nachos → Salsa, Yoga Mat → Protein Shake) that traditional collaborative filtering or vector similarity would miss entirely.

---

**Shopping becomes a conversation. Built for the next generation of commerce.**

---

### ❤️ Built by Team Merge_Conflicts for HackOn
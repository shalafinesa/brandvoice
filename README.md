# ✍️ Brand Voice — Finesa Shala App

> **One prompt. Five platforms. Zero agency needed.**
> AI-powered social media content generator for coaches, freelancers, small businesses and personal brands.

🌐 **Live app:** [finesashala-brandvoice.netlify.app](https://finesashala-brandvoice.netlify.app)

---

## 📌 What is Brand Voice?

Brand Voice is a web application that turns your business description into ready-to-post content for every major social media platform — in seconds.

You fill in your brand profile once (business name, niche, product, audience, tone). Then give it a topic. It writes 5 platform-native posts instantly.

**Who it's for:**
- 🧠 Coaches & Consultants
- 🛍️ Small Business Owners
- ⭐ Personal Brand Builders
- 🚀 Solopreneurs & Founders
- 🎨 Freelancers
- 🌱 Early-Stage Startups

---

## ✅ What's Been Built (v1)

### Frontend
- [x] Full landing page — hero, who it's for, why, how it works, platforms, pricing, FAQ, CTA
- [x] Sticky navigation with scroll links
- [x] 4-step brand profile onboarding flow
- [x] Topic input screen with example prompts
- [x] Modal-based app interface (opens on top of landing page)
- [x] Content results screen with per-platform cards
- [x] One-click copy per platform
- [x] Character count badge per platform
- [x] Loading screen with animated spinner
- [x] "New topic" and "Edit brand" flow (no re-onboarding)
- [x] Fully responsive (mobile + desktop)
- [x] Emoji-rich UI throughout

### Content Generation
- [x] LinkedIn post — hook + paragraphs + CTA + hashtags (5–7)
- [x] Instagram caption + hashtag clusters (15–20)
- [x] X / Twitter post — under 280 chars, max 2 hashtags
- [x] Facebook post — community-style, 120–200 words
- [x] TikTok script — 3-part: hook / body / CTA

### Backend / Infrastructure
- [x] Netlify serverless function as secure API proxy (`/api/generate`)
- [x] Anthropic Claude API integration (claude-sonnet-4)
- [x] API key stored as Netlify environment variable (never exposed to browser)
- [x] Deployed and live on Netlify

### Design
- [x] Deep forest green color palette
- [x] Fraunces (serif display) + Manrope (sans body) font pairing
- [x] Subtle grid background on hero
- [x] Animated pulse dot on hero badge
- [x] Hover states and transitions throughout
- [x] Dark hero/platform sections with light content sections

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 (CDN), vanilla CSS |
| Fonts | Google Fonts — Fraunces + Manrope |
| Backend | Netlify Functions (serverless) |
| AI | Anthropic Claude API |
| Hosting | Netlify |
| Deployment | Manual drag-and-drop / Netlify CLI |

---

## 📁 Project Structure

```
brandvoice/
├── index.html                  # Full frontend (React + CSS + logic)
├── netlify.toml                # Netlify config + redirects
└── netlify/
    └── functions/
        └── generate.js         # Serverless API proxy (hides API key)
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js installed
- Netlify CLI installed: `npm install -g netlify-cli`
- An Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

### Setup

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/brandvoice.git
cd brandvoice

# Create a local environment file
echo "ANTHROPIC_API_KEY=your_key_here" > .env

# Run locally with Netlify Dev (enables serverless functions)
netlify dev
```

App runs at `http://localhost:8888`

### Deploy to Production

```bash
netlify deploy --prod --dir .
```

---

## 🌍 Environment Variables

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key — set in Netlify dashboard under Site Configuration → Environment Variables |

---

## 💳 Pricing Model

| Plan | Price |
|---|---|
| Free Trial | 3 days — no credit card required |
| Monthly | €19.99/month after trial |

> ⚠️ Stripe integration not yet implemented — see roadmap below.

---

## 🗺️ Roadmap — What Still Needs to Be Built

### 🔐 Authentication & User Accounts
- [ ] User sign up / login (email + password)
- [ ] OAuth login (Google, Apple)
- [ ] User sessions and protected routes
- [ ] Database to store user profiles (Supabase recommended)

### 💾 Brand Profile Persistence
- [ ] Save brand profile to database (currently lost on refresh)
- [ ] Allow users to edit their saved brand profile
- [ ] Support multiple brand profiles per user

### 💳 Payments & Subscriptions
- [ ] Stripe integration for €19.99/month subscription
- [ ] 3-day free trial logic tied to account creation date
- [ ] Subscription status check before allowing generation
- [ ] Billing portal (cancel, update payment method)
- [ ] Webhook handling for subscription events

### 📜 Content History
- [ ] Save every generation to user's account
- [ ] View, search and re-use past content
- [ ] Delete individual entries

### ♻️ Regeneration
- [ ] Regenerate a single platform without redoing all 5
- [ ] "Make it shorter / longer / more casual" quick edits

### 📤 Export
- [ ] Export all 5 posts as a .txt or .pdf file
- [ ] Copy-all button (all platforms in one click)

### 📅 Scheduling (Phase 2)
- [ ] Connect Buffer / Later API to schedule posts directly
- [ ] Calendar view of scheduled content

### 📊 Analytics (Phase 2)
- [ ] Track which topics have been generated
- [ ] Usage stats per user (generations per month)
- [ ] Admin dashboard

### 📱 iOS App (Phase 2)
- [ ] React Native (Expo) port of the web app
- [ ] Quick-generate flow optimised for mobile
- [ ] Push notifications for content reminders
- [ ] App Store submission

### 🌐 Other
- [ ] Custom domain setup (brandvoice.app or similar)
- [ ] SEO meta tags + Open Graph image
- [ ] Cookie consent banner (GDPR)
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Email onboarding sequence (welcome, trial ending, etc.)
- [ ] Affiliate / referral program

---

## 🏗️ Building in Public

This project is being built and improved openly. Every feature, decision and lesson is shared on LinkedIn and X.

Follow the journey: **@FinesaShala**

---

## 📄 License

MIT — feel free to fork and adapt for your own projects.

---

*Built by [Finesa Shala](https://github.com/YOUR_USERNAME) · Made for the people too busy running a business to market it 🌱*

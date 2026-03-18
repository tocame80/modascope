# Active Context: ModaScope - AI Fashion Digest

## Current State

**Project Status**: ✅ Completed

Built ModaScope - AI-powered fashion news aggregation platform with landing page, free API, database, user preferences, and Telegram bot.

## Recently Completed

- [x] Set up Next.js 16 project with TypeScript and Tailwind CSS 4
- [x] Create landing page with sections:
  - Hero with tagline and CTA
  - How it works (4-step process)
  - Daily digest preview with sample articles
  - Data sources showcase
  - Personalization features
  - Pricing tiers
  - Early access signup form
- [x] Add free API endpoints:
  - `GET /api/news` - Fashion news with filtering
  - `GET /api/sources` - List of data sources
  - `GET /api/categories` - Available categories
- [x] Add database (Drizzle + SQLite):
  - `subscribers` table for email and Telegram storage
- [x] Add subscribe API: `POST /api/subscribe` - supports email and Telegram
- [x] Add preferences API: `GET/POST /api/preferences` - manage user preferences
- [x] Add preferences page: `/preferences` - UI for customizing brands & categories
- [x] Add Telegram bot with commands: /start, /digest, /preferences, /help
- [x] Add digest sending API: `POST /api/digest/send` - sends digest to all Telegram subscribers

## API Endpoints

### GET /api/news
Query params:
- `brand` (optional) - Filter by brand name
- `category` (optional) - Filter by category
- `limit` (optional, default: 10) - Number of results
- `offset` (optional, default: 0) - Pagination offset

### GET /api/sources
Returns list of monitored fashion sources.

### GET /api/categories
Returns available news categories.

### POST /api/subscribe
Body: `{ email?, telegramChatId?, name?, brandPreferences?, categoryPreferences? }`
Returns: `{ message, token, preferencesUrl }`

### GET /api/preferences
Query params: `email` or `telegram`, `token`

### POST /api/preferences
Body: `{ email?, telegramChatId?, token, name?, brandPreferences?, categoryPreferences? }`

### POST /api/digest/send
Sends digest to all Telegram subscribers (requires TELEGRAM_BOT_TOKEN)

## Database Schema

### subscribers
| Column | Type | Description |
|--------|------|-------------|
| id | integer | Primary key |
| email | text | Unique email (nullable) |
| telegramChatId | integer | Unique Telegram chat ID |
| name | text | User name |
| brandPreferences | text | JSON array of brands |
| categoryPreferences | text | JSON array of categories |
| isVerified | boolean | Verification status |
| verifyToken | text | Token for managing preferences |
| subscribedAt | timestamp | Auto-generated |

## Telegram Bot

- Bot: @ModaScope_bot
- Commands: /start, /digest, /preferences, /help
- Inline buttons for navigation
- Subscribes users via /start command

## Technical Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- React 19
- Drizzle ORM + SQLite
- next/image for optimized images

## Session History

| Date | Changes |
|------|---------|
| Initial | Project created from Next.js template |
| +1 | Built ModaScope landing page |
| +2 | Added free API endpoints |
| +3 | Added database and subscribe endpoint |
| +4 | Added preferences page and API |
| +5 | Added Telegram bot |

## Pending Improvements

- [ ] Real AI-powered news analysis
- [ ] Email subscription/digest service
- [ ] Deploy to production with public URL

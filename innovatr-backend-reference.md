# Innovatr — Full Backend Reference

> Generated from source code. Covers: database schema, data types, access control, API routes, authentication, payments, email notifications, activity tracking, companies, and clients.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Database Schema (All Tables)](#2-database-schema-all-tables)
3. [Access Control System](#3-access-control-system)
4. [Membership Tiers](#4-membership-tiers)
5. [Companies & Clients (Seeded Data)](#5-companies--clients-seeded-data)
6. [Activity & Event Tracking](#6-activity--event-tracking)
7. [Reports System](#7-reports-system)
8. [Brief Submissions & Studies](#8-brief-submissions--studies)
9. [Credits & Ledger System](#9-credits--ledger-system)
10. [Orders & Payments](#10-orders--payments)
11. [Deals System](#11-deals-system)
12. [Case Studies](#12-case-studies)
13. [Email Notifications](#13-email-notifications)
14. [Authentication System](#14-authentication-system)
15. [Full API Route Reference](#15-full-api-route-reference)
16. [Storage Interface (All Methods)](#16-storage-interface-all-methods)
17. [Tag Configuration](#17-tag-configuration)
18. [Industry Options](#18-industry-options)
19. [Environment Variables](#19-environment-variables)

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js / TypeScript |
| Framework | Express.js |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM |
| Validation | Zod + drizzle-zod |
| Auth | HTTP-only session cookies, bcrypt passwords |
| File Storage | Replit Object Storage |
| Payments | PayFast, Zapper, Apple Pay |
| Email | Resend (via Replit integration) |
| Frontend | React + Vite + Tailwind CSS |

---

## 2. Database Schema (All Tables)

### `users`

| Column | Type | Default | Notes |
|---|---|---|---|
| id | varchar (PK) | gen_random_uuid() | |
| username | text | — | unique |
| email | text | — | unique |
| phone | text | null | |
| password | text | — | Legacy — not used for new accounts |
| passwordHash | text | null | bcrypt hash — required for all accounts |
| name | text | null | |
| surname | text | null | |
| company | text | null | Display name of company |
| industry | text | null | |
| referralSource | text | null | How they found Innovatr |
| wantsContact | boolean | false | Opted in for sales contact |
| companyId | varchar | null | FK to companies.id |
| membershipTier | varchar(20) | FREE | FREE / STARTER / GROWTH / SCALE / CUSTOM / ADMIN |
| status | varchar(20) | ACTIVE | ACTIVE / INACTIVE / SUSPENDED |
| role | varchar(20) | MEMBER | ADMIN / DEAL_ADMIN / MEMBER |
| memberType | varchar(20) | companyUser | companyUser / independent |
| isPaidSeat | boolean | false | Whether this user occupies a paid seat |
| creditsBasic | integer | 0 | Personal basic credits (used when no company) |
| creditsPro | integer | 0 | Personal pro credits (used when no company) |
| creditsInheritedFromCompany | boolean | true | Credits come from company pool |
| totalSpend | decimal(10,2) | 0 | Lifetime spend in ZAR |
| firstProjectDate | timestamp | null | |
| lastProjectDate | timestamp | null | |
| lastActivityDate | timestamp | null | |
| internalNotes | text | null | Admin-only notes |
| isActive | boolean | true | Soft-delete / disable flag |
| emailVerified | boolean | false | |
| pulseSubscribed | boolean | true | Subscribed to Pulse newsletter |
| pulseIndustry | text | null | Industry for newsletter targeting |
| trendsLastSeenAt | timestamp | null | Last time user viewed Trends page |
| createdAt | timestamp | now() | |
| updatedAt | timestamp | now() | |
| lastLoginAt | timestamp | null | |

---

### `companies`

| Column | Type | Default | Notes |
|---|---|---|---|
| id | varchar (PK) | gen_random_uuid() | |
| name | text | — | Required |
| domain | text | null | e.g. "acmecorp.com" |
| logoUrl | text | null | |
| industry | text | null | |
| tier | varchar(20) | FREE | FREE / STARTER / GROWTH / SCALE / CUSTOM / ADMIN |
| contractStart | timestamp | null | |
| contractEnd | timestamp | null | Auto-downgrade triggered after this date |
| monthlyFee | decimal(10,2) | null | Recurring fee in ZAR |
| basicCreditsTotal | integer | 0 | Total basic credits purchased |
| basicCreditsUsed | integer | 0 | Basic credits consumed |
| proCreditsTotal | integer | 0 | Total pro credits purchased |
| proCreditsUsed | integer | 0 | Pro credits consumed |
| companySize | text | null | |
| dealDetails | jsonb | null | Arbitrary deal metadata |
| notes | text | null | Admin-only notes |
| pulseIndustry | text | null | Industry for newsletter targeting |
| createdAt | timestamp | now() | |
| updatedAt | timestamp | now() | |

**Helper functions:**
```
getBasicCreditsRemaining(company) = basicCreditsTotal - basicCreditsUsed
getProCreditsRemaining(company)   = proCreditsTotal   - proCreditsUsed
```

---

### `sessions`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| userId | varchar | FK to users.id |
| companyId | varchar | Snapshot at time of login |
| tokenHash | text (unique) | SHA-256 of session token |
| ipAddress | text | |
| userAgent | text | |
| expiresAt | timestamp | 30 days from creation |
| createdAt | timestamp | |
| lastActiveAt | timestamp | |

---

### `password_resets`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| userId | varchar | FK to users.id |
| tokenHash | text | SHA-256 hash of token |
| expiresAt | timestamp | 7 days from creation |
| usedAt | timestamp | null until used |
| createdAt | timestamp | |

---

### `reports`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| title | text | Required |
| slug | text | URL-safe unique identifier |
| category | varchar(50) | Insights / Launch / Inside / IRL |
| series | varchar(50) | Display series name |
| industry | text | Target industry |
| date | timestamp | Publication date |
| teaser | text | Short preview text |
| body | text | Full body content |
| content | jsonb | Structured sections |
| topics | text[] | Array of topic/tag strings |
| videoPaths | text[] | Array of video URLs |
| pdfUrl | text | Downloadable PDF URL |
| thumbnailUrl | text | Card thumbnail |
| coverImageUrl | text | Full cover image |
| dashboardUrl | text | External dashboard link |
| accessLevel | varchar(20) | public / member / tier / paid / companyOnly |
| allowedTiers | text[] | Which tiers can access |
| clientCompanyIds | text[] | Company-specific access |
| creditType | varchar(20) | none / basic / pro |
| creditCost | integer | Credits required to unlock |
| isFeatured | boolean | |
| status | varchar(20) | draft / scheduled / published / archived |
| viewCount | integer | |
| downloadCount | integer | |
| isArchived | boolean | |
| publishAt | timestamp | Scheduled publish datetime |
| unpublishAt | timestamp | Scheduled unpublish datetime |
| industryTag | varchar(50) | Taxonomy tag |
| themeTags | text[] | Theme taxonomy tags |
| methodTags | text[] | Method taxonomy tags |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `client_reports`

Private reports delivered to specific companies (Past Research).

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| companyId | varchar | FK to companies.id |
| title | text | Required |
| description | text | |
| studyType | varchar(50) | Test24 Basic / Test24 Pro |
| industry | varchar(100) | |
| status | varchar(20) | Completed / In Progress / etc. |
| deliveredAt | timestamp | |
| primaryContactEmail | text | |
| pdfUrl | text | Downloadable report PDF |
| dashboardUrl | text | Live data dashboard URL |
| upsiideUrl | text | Upsiide-specific dashboard |
| thumbnailUrl | text | |
| tags | text[] | |
| topIdeaLabel | text | Best performing concept name |
| topIdeaIdeaScore | integer | 0-100 |
| topIdeaInterest | integer | 0-100 |
| topIdeaCommitment | integer | 0-100 |
| lowestIdeaLabel | text | Worst performing concept name |
| lowestIdeaIdeaScore | integer | 0-100 |
| lowestIdeaInterest | integer | 0-100 |
| lowestIdeaCommitment | integer | 0-100 |
| verbatim1 | text | Consumer quote 1 |
| verbatim2 | text | Consumer quote 2 |
| isArchived | boolean | |
| uploadedAt | timestamp | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `brief_submissions`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| submittedByName | text | |
| submittedByEmail | text | |
| submittedByContact | text | Phone/WhatsApp |
| companyId | varchar | FK to companies.id |
| companyName | text | |
| companyBrand | text | Brand within company |
| studyType | text | test24_basic / test24_pro |
| numIdeas | integer | Number of concepts to test |
| researchObjective | text | |
| regions | text[] | Target regions |
| ages | text[] | Target age groups |
| genders | text[] | |
| incomes | text[] | Income brackets |
| industry | text | |
| competitors | text[] | Up to 2 (Basic) or 5 (Pro) |
| files | jsonb | Uploaded file metadata array |
| projectFileUrls | text[] | Legacy file URL array |
| paymentMethod | text | credits / online / invoice |
| paymentStatus | text | pending / completed / failed |
| paymentIntentId | varchar | FK to payment_intents.id |
| basicCreditsUsed | integer | |
| proCreditsUsed | integer | |
| status | text | pending / in_progress / completed |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `studies`

Tracks a Test24 study from brief to delivery.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| companyId | varchar | FK to companies.id |
| companyName | text | |
| title | text | |
| description | text | |
| studyType | text | basic / pro |
| isTest24 | boolean | |
| status | varchar | NEW / IN_PROGRESS / AUDIENCE_LIVE / ANALYSIS / COMPLETED / ON_HOLD / CANCELLED |
| submittedByEmail | text | |
| submittedByName | text | |
| tags | text[] | |
| deliveryDate | timestamp | |
| clientReportId | varchar | FK to client_reports.id (when delivered) |
| createdAt | timestamp | |
| updatedAt | timestamp | |

**Status flow:** `NEW → IN_PROGRESS → AUDIENCE_LIVE → ANALYSIS → COMPLETED`

---

### `credit_ledger`

Immutable log of all credit transactions.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| companyId | varchar | FK to companies.id |
| userId | varchar | Who initiated the transaction |
| creditType | varchar(20) | basic / pro |
| transactionType | varchar(20) | purchase / use / adjustment / refund |
| amount | integer | Positive = credit, Negative = debit |
| balanceAfter | integer | Running balance after this transaction |
| description | text | Human-readable reason |
| orderId | varchar | FK to orders.id (if purchase) |
| briefId | varchar | FK to brief_submissions.id (if usage) |
| metadata | jsonb | Additional context |
| createdAt | timestamp | |

---

### `orders`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| userId | varchar | FK to users.id |
| amount | decimal(10,2) | Total in ZAR |
| currency | varchar(3) | ZAR |
| purchaseType | varchar(50) | Membership type / credit pack description |
| status | varchar(20) | pending / completed / failed / refunded |
| customerName | text | |
| customerEmail | text | Required |
| customerCompany | text | |
| invoiceRequested | boolean | |
| businessRegNumber | text | |
| vatNumber | text | |
| companyAddress | text | |
| invoiceNumber | text | e.g. INV-2025-003 |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `order_items`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| orderId | varchar | FK to orders.id |
| type | varchar(50) | brief_payment / credit_basic / credit_pro / membership |
| referenceId | varchar | Optional reference to related entity |
| quantity | integer | |
| unitAmount | decimal(10,2) | Per-unit price in ZAR |
| description | text | |

---

### `payment_intents`

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| orderId | varchar | FK to orders.id |
| providerKey | varchar(20) | payfast / zapper / applepay |
| providerIntentId | text | Provider-side reference ID |
| status | varchar(20) | pending / completed / failed / refunded |
| metadata | jsonb | Provider-specific payload + pendingOrder data |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `payment_events`

Webhook event log from payment providers.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| intentId | varchar | FK to payment_intents.id |
| providerEventId | text | Provider's event ID |
| eventType | varchar(50) | e.g. payment.completed, subscription.created |
| payload | jsonb | Full webhook payload |
| verifiedSignature | boolean | Whether HMAC signature was validated |
| createdAt | timestamp | |

---

### `subscriptions`

Recurring membership subscriptions via PayFast.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| userId | varchar | FK to users.id |
| payfastToken | text | PayFast subscription token |
| customerName | text | |
| customerEmail | text | |
| customerCompany | text | |
| planType | text | entry_membership / gold_membership / platinum_membership |
| amount | text | Recurring amount in ZAR |
| currency | text | ZAR |
| frequency | integer | 3 = monthly |
| cyclesTotal | integer | Total billing cycles (12 = annual) |
| cyclesCompleted | integer | Payments received so far |
| status | text | active / cancelled / completed |
| nextBillingDate | timestamp | |
| startDate | timestamp | |
| cancelledAt | timestamp | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `deals`

Member offers and exclusive perks.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| title | text | Required |
| description | text | |
| headlineOffer | text | Short CTA text |
| originalPrice | decimal(10,2) | |
| discountedPrice | decimal(10,2) | |
| discountPercent | integer | |
| creditsIncluded | integer | Credits bundled with this deal |
| targetTierKeys | text[] | Which tiers see this deal |
| targetUserIds | text[] | Specific user targeting |
| ownerCompanyId | varchar | Company-specific deal |
| createdByUserId | varchar | FK to users.id (admin who created) |
| dealType | text | exclusive_offer / perk / teaser |
| slotsTotal | integer | null = unlimited |
| slotsRemaining | integer | |
| sortOrder | integer | Display order |
| validFrom | timestamp | |
| validTo | timestamp | null = ongoing |
| isActive | boolean | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `case_studies`

Public-facing client case studies.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| slug | text (unique) | URL identifier |
| client | text | Client brand name |
| industry | text | |
| headline | text | Main heading |
| problemShort | text | Brief problem statement |
| problem | text | Full problem description |
| process | text | How Innovatr solved it |
| results | text | Outcomes / key stats |
| phases | text[] | strategy / innovation / execution |
| duration | text | e.g. "6 weeks" |
| highlight | text | Pull quote or key stat |
| bgColor | text | Hex color for card background |
| gifAsset | text | cooking / airplanes / pen / default |
| sortOrder | integer | |
| isActive | boolean | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `activity_events`

Fine-grained user activity log used for admin analytics.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| userId | varchar | FK to users.id |
| companyId | varchar | Snapshot at time of event |
| actionType | text | See action types below |
| metadata | jsonb | Additional context (e.g. report slug, IP) |
| createdAt | timestamp | |

**Action types tracked:**
- `login` — successful login
- `login_failed` — failed login attempt
- `password_reset_requested`
- `password_reset_completed`
- `view_dashboard`
- `view_trends`
- `view_report`
- `view_client_report`
- `view_credits`
- `view_settings`
- `report_view`
- `report_download`

---

### `report_events`

Per-report analytics events.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| reportId | varchar | FK to reports.id or slug |
| userId | varchar | null for guests |
| eventType | text | view / download |
| memberTier | text | Snapshot at time of event |
| companyId | varchar | |
| ipAddress | text | |
| userAgent | text | |
| createdAt | timestamp | |

---

### `report_last_viewed`

Tracks the most recent viewer per user per report.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| reportId | varchar | |
| userId | varchar | |
| userName | text | |
| userEmail | text | |
| memberTier | text | |
| companyName | text | |
| viewedAt | timestamp | Updated on each view (upsert) |

---

### `report_requests`

Member requests for new research topics.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| name | text | Requester name |
| email | text | |
| industry | text | |
| topic | text | Requested topic |
| reason | text | Why they want it |
| status | text | pending / reviewed / accepted / declined |
| adminNotes | text | |
| createdAt | timestamp | |
| updatedAt | timestamp | |

---

### `brief_files`

File attachments uploaded during brief submission.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| briefId | varchar | FK to brief_submissions.id |
| userId | varchar | Uploader |
| companyId | varchar | |
| fileName | text | Original filename |
| fileSize | integer | Bytes |
| mimeType | text | MIME type |
| storagePath | text | Path in Replit Object Storage |
| url | text | Public access URL |
| createdAt | timestamp | |

---

### `coupon_claims`

One-time coupon signup captures.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| name | text | |
| email | text | |
| couponCode | text | |
| claimedAt | timestamp | |

---

### `mailer_subscriptions`

Newsletter / Pulse mailing list signups.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| name | text | |
| email | text (unique) | |
| company | text | |
| industry | text | |
| subscribedAt | timestamp | |

---

### `inquiries`

Contact/consult inquiry forms.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| name | text | |
| email | text | |
| company | text | |
| industry | text | |
| message | text | |
| type | text | contact / consult / general |
| createdAt | timestamp | |

---

### `insight_mailers`

Admin-managed Pulse/newsletter mailer records.

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| subject | text | Email subject line |
| industry | text | Target industry filter |
| reportSlug | text | Linked report |
| status | text | draft / sent |
| sentAt | timestamp | |
| createdAt | timestamp | |

---

### `admin_preferences`

Per-admin UI preferences (e.g. default tab).

| Column | Type | Notes |
|---|---|---|
| id | varchar (PK) | |
| userId | varchar (unique) | FK to users.id |
| preferences | jsonb | Arbitrary key-value preferences |
| updatedAt | timestamp | |

---

## 3. Access Control System

### Tier Hierarchy (`shared/access.ts`)

```
FREE(0) < STARTER(1) < GROWTH(2) < SCALE(3) < CUSTOM(4)
```

### Content Access Levels

```
PUBLIC(0) = accessible to anyone, logged in or not
STARTER(1) = requires any paid membership (STARTER+)
GROWTH(2)  = requires GROWTH or SCALE tier
SCALE(3)   = requires SCALE tier only
```

### Key Access Functions

| Function | Purpose |
|---|---|
| `canAccessTier(userTier, requiredTier)` | Returns true if user meets required tier |
| `isFreeUser(tier, role)` | Returns true for FREE tier (not admin) |
| `isPaidMember(tier)` | Returns true for STARTER+ |
| `hasPaidSeatAccess(isPaidSeat, isAdmin)` | Admins always true; else checks isPaidSeat |
| `isAdminUser(email, role)` | True if role=ADMIN or email is a known admin email |
| `isFreeContent(report)` | Checks if a report is publicly accessible |
| `getEffectiveAccessLevel(report)` | Returns the resolved access level for a report |
| `checkContentAccess(report, user)` | Full access check returning reason + requiredTier |

### Free (Public) Content

These specific slugs and category rules make content public without a login:

- **Category `Inside`** — all Inside issues are always free/public
- **Hardcoded free slugs:**
  - `banking-monogamy-is-dead`
  - `simplicity-has-status`
  - `from-vegan-to-vital`
  - `cadbury-pocket-sized-joy`
  - `the-oat-based-breakfast-revolution`
  - `the-return-of-the-third-place`
  - All `innovatr-inside-*` slugs

---

## 4. Membership Tiers

| Tier | Level | Typical Access |
|---|---|---|
| FREE | 0 | Can browse locked content cards; cannot open any report |
| STARTER | 1 | Access to all reports; basic credit discounts |
| GROWTH | 2 | All STARTER benefits + exclusive deals |
| SCALE | 3 | All GROWTH benefits + priority turnaround |
| CUSTOM | 4 | Bespoke arrangement |
| ADMIN | — | Full access to all content + admin portal |

**Auto-downgrade:** When `/api/auth/me` is called, the server checks if the company's `contractEnd` has passed. If it has, the company and all its members are downgraded to FREE automatically.

---

## 5. Companies & Clients (Seeded Data)

The database is seeded with these companies on first boot:

| Company | Industry | Tier | Basic Credits | Pro Credits | Notes |
|---|---|---|---|---|---|
| **Innovatr** | Market Research | SCALE | 25 | 4 | Internal team — admin accounts |
| **Rugani Juice** | Beverages | GROWTH | 10 (used 2) | 2 | Parent: Greenway Farms |
| **Greenway Farms** | Agriculture | GROWTH | 10 | 2 | Parent group of Rugani Juice |
| **Nando's South Africa** | Quick Service Restaurant | GROWTH | 5 (used 5) | 0 | 1 active study ongoing |
| **DGB** | Wine & Spirits | STARTER | 1 (used 1) | 0 | Durbanville Hills pilot |
| **Revlon** | Beauty & Cosmetics | SCALE | 0 | 0 | No reports yet |
| **Mitchum** | Personal Care | SCALE | 0 | 0 | No reports yet |
| **Elizabeth Arden** | Beauty & Cosmetics | SCALE | 0 | 0 | No reports yet |

### Seeded Users

| Name | Email | Company | Tier | Role |
|---|---|---|---|---|
| HannaH Steven | hannah@innovatr.co.za | Innovatr | SCALE | ADMIN |
| Richard Lawrence | richard@innovatr.co.za | Innovatr | SCALE | ADMIN |
| Simone Kakana | simone.kakana@nandos.co.za | Nando's | GROWTH | MEMBER |
| Tymon | tymon@rugani.co.za | Rugani Juice | GROWTH | MEMBER |
| Simonne | simonne@rugani.co.za | Rugani Juice | GROWTH | MEMBER |
| Duncan Buhr | duncan@greenwayfarm.co.za | Greenway Farms | GROWTH | MEMBER |
| Wesley Browne | Wesley@greenwayfarm.co.za | Greenway Farms | GROWTH | MEMBER |

### Seeded Studies

| Title | Company | Type | Status |
|---|---|---|---|
| Nando's Menu Test | Nando's SA | Test24 Basic | AUDIENCE_LIVE |
| Rugani x Clicks Wellness Beverage Positioning | Rugani Juice | Test24 Pro | COMPLETED |
| Rugani New Key Visual Optimisation | Rugani Juice | Test24 Pro | COMPLETED |
| Durbanville Hills Test24 Basic Pilot | DGB | Test24 Basic | COMPLETED |

---

## 6. Activity & Event Tracking

Every significant user action is logged to `activity_events`.

**Where it's called from:** `logActivity()` in the frontend sends a POST to `/api/activity`, and the backend also directly logs events for auth flows.

**Events logged:**
- All portal page views (dashboard, trends, credits, settings)
- Login / login failures
- Password reset request and completion
- Report views and downloads

**Admin stats endpoints use this data for:**
- Total logins this month
- Login failures this month
- Active users in last 30 days
- Users who have never logged in
- Users inactive for 30+ days
- Total non-admin report views

---

## 7. Reports System

### Categories

| Category | Description |
|---|---|
| **Insights** | Deep dives into consumer behaviour and market shifts |
| **Launch** | Case studies of new product launches |
| **Inside** | Behind-the-scenes of innovation processes (always free) |
| **IRL** | Real-world applications and cultural trends |

### Access Levels

| accessLevel value | Who can access |
|---|---|
| `public` | Everyone (no login required) |
| `member` | Any paid member (STARTER+) |
| `tier` | Tier specified in `allowedTiers[]` |
| `paid` | Any paying user with a paid seat |
| `companyOnly` | Only companies listed in `clientCompanyIds[]` |

### Scheduling

Reports support automated publish/unpublish:
- `publishAt` — set to schedule future publication
- `unpublishAt` — set to auto-archive on a date
- Processed by `storage.processScheduledReports()` which is called periodically

### Report Analytics

For each report, the system tracks:
- `viewCount` / `downloadCount` — lifetime totals on the report row
- `report_events` table — individual timestamped events with user metadata
- `report_last_viewed` — upserted per user, shows most recent viewers per report
- Admin can query views for `today`, `30d`, or `12m` windows

---

## 8. Brief Submissions & Studies

### Brief Flow

```
User fills brief form → POST /api/briefs
→ Credits deducted (if payment method = credits)
→ BriefSubmission created
→ Study created (status = NEW)
→ Confirmation email to user
→ Admin notification email
```

### Payment Methods for Briefs

| Method | Flow |
|---|---|
| `credits` | Deducts from company credit pool atomically |
| `online` | Creates PayFast checkout; brief marked pending until webhook confirms |
| `invoice` | Brief submitted immediately; invoice sent manually by admin |

### Brief Pricing (Pay Online)

| Type | Member Price | Standard Price |
|---|---|---|
| Test24 Basic (per concept) | R 5,000 | R 5,500 |
| Test24 Pro (per concept) | R 45,000 | R 50,000 |

### Study Status Flow

```
NEW → IN_PROGRESS → AUDIENCE_LIVE → ANALYSIS → COMPLETED
                                              → ON_HOLD
                                              → CANCELLED
```

### File Uploads for Briefs

- **Max file size:** 20 MB per file
- **Allowed types:** PDF, DOCX, XLSX, PPTX, TXT, images (JPEG/PNG/GIF/WebP), video (MP4/MOV/WebM), audio (MP3/M4A)
- **Storage:** Replit Object Storage under `briefs/` prefix
- **Security:** Files are deleted from storage if payment fails (webhook-triggered cleanup)

---

## 9. Credits & Ledger System

Credits are held at the **company** level (not per-user).

### Credit Types

| Type | Use case | Typical price |
|---|---|---|
| `basic` | Test24 Basic study | R 5,000 / credit (member) |
| `pro` | Test24 Pro study | R 45,000 / credit (member) |

### Credit Packages Available

| Type | Qty | Member Price | Regular Price | Saving |
|---|---|---|---|---|
| Basic | 1 | R 5,000 | R 10,000 | 50% |
| Basic | 10 | R 45,000 | R 100,000 | 55% |
| Pro | 1 | R 45,000 | R 50,000 | 10% |
| Pro | 3 | R 120,000 | R 150,000 | 20% |

### How Credits Work

1. When a brief is submitted using credits, `atomicDeductCredits()` is called
2. This increments `companies.basicCreditsUsed` (or proCreditsUsed) atomically
3. A `credit_ledger` entry is written with `transactionType = 'use'`
4. If the company doesn't have enough credits, submission is rejected with an error
5. When credits are purchased, a `credit_ledger` entry with `transactionType = 'purchase'` is written

### Demo Account Protection

Admin accounts (`hannah@innovatr.co.za`, `richard@innovatr.co.za`) always display a minimum of:
- **25 Basic credits**
- **4 Pro credits**

This prevents the demo from showing 0 credits during client presentations.

---

## 10. Orders & Payments

### Payment Providers

| Provider | Use case | Environment |
|---|---|---|
| **PayFast** | Primary SA payment gateway; cards, EFT, subscriptions | Sandbox + Production |
| **Zapper** | QR-code payments | Sandbox + Production |
| **Apple Pay** | Mobile payments (via PayFast) | Production |

### Order Lifecycle

```
POST /api/checkout → creates Order (pending) + PaymentIntent
→ User redirected to PayFast / Zapper
→ Provider sends webhook to /api/webhooks/payfast
→ Signature verified → Order updated to "completed"
→ Credits added to company / membership upgraded
→ Emails sent to admin + customer
```

### Subscription Events (PayFast)

| Event | Action |
|---|---|
| `subscription.created` | New Subscription record created |
| `subscription.payment` | cyclesCompleted incremented, nextBillingDate advanced |
| `subscription.cancelled` | Subscription status set to "cancelled" |

### Invoice Generation

If `invoiceRequested = true` on an order:
- A PDF invoice is generated server-side with `generateInvoicePdf()`
- The PDF is attached to the customer confirmation email
- Invoice number format: `INV-{YEAR}-{sequence}`

---

## 11. Deals System

Deals are member-facing promotional offers managed by admins.

### Deal Types

| dealType | Description |
|---|---|
| `exclusive_offer` | Discounted pricing or bundle |
| `perk` | Non-monetary benefit (e.g. free report) |
| `teaser` | Teaser offer to encourage upgrade |

### Targeting

Deals can be targeted by:
- `targetTierKeys[]` — e.g. `["GROWTH", "SCALE"]`
- `targetUserIds[]` — specific user IDs
- `ownerCompanyId` — company-only deal

### Slot Limiting

- `slotsTotal` — null = unlimited; integer = limited slots
- `slotsRemaining` — decremented when claimed

---

## 12. Case Studies

Public case studies shown on the marketing site.

### Fields of Note

- `phases[]` — can include: `strategy`, `innovation`, `execution`
- `gifAsset` — one of: `cooking`, `airplanes`, `pen`, `default`
- `sortOrder` — controls display order

---

## 13. Email Notifications

All emails sent via **Resend** (Replit integration). From address configured in the Resend connector.

### Emails Sent

| Trigger | Recipients | Email |
|---|---|---|
| New signup | User | Welcome / account created email |
| Password reset request | User | Reset link (valid 7 days) |
| Password reset complete | User | Success confirmation |
| Order completed | Admin team | Order notification with line items |
| Order completed | Customer | Order confirmation (+ PDF invoice if requested) |
| Brief submitted (credits) | User | Brief confirmation email |
| Brief submitted (credits) | Admin | Brief admin notification with full details |
| Brief payment completed (online) | User | Brief confirmation email |
| Brief payment completed (online) | Admin | Brief admin notification |
| Contact form submitted | Admin | Contact form message |

### Admin Email List

Configured via `ADMIN_EMAILS` environment variable (comma-separated).
Default: `hannah@innovatr.co.za`

---

## 14. Authentication System

### Password Hashing

- Algorithm: **bcrypt** with 12 salt rounds
- Legacy accounts: plaintext passwords are auto-migrated to bcrypt on next login
- Password requirements: 8+ chars, uppercase, lowercase, number

### Session Management

- Sessions stored in `sessions` table
- Session token: 48-byte cryptographically random `base64url` string
- Token stored as **SHA-256 hash** — never in plaintext
- Cookie: `session`, HTTP-only, `SameSite=lax`, secure in production
- Session lifetime: 30 days
- Auto-expired sessions are cleaned up on next auth check

### Password Reset

- Token: 32-byte `hex` string
- Stored as SHA-256 hash
- Expires: 7 days
- One-use: `usedAt` is set after first use

### Middleware

| Middleware | Use |
|---|---|
| `requireAuth` | Validates session cookie; attaches `req.user` |
| `requireAdmin` | Calls `requireAuth` then checks `role=ADMIN` or admin email |
| `redactUser(user)` | Strips password/hash fields before returning to client |

---

## 15. Full API Route Reference

### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Register new user; creates company if new |
| POST | `/api/auth/login` | Public | Login with email + password; sets session cookie |
| GET | `/api/auth/me` | Cookie | Returns current session user; runs auto-downgrade check |
| POST | `/api/auth/logout` | Cookie | Destroys session; clears cookie |
| POST | `/api/auth/password-reset/request` | Public | Sends password reset email |
| POST | `/api/auth/password-reset/confirm` | Public | Validates token; sets new password |
| POST | `/api/auth/change-password` | Auth | Changes password for logged-in user |

### Member Portal

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/member/activity` | Auth | Returns user's study/credit activity stats |
| GET | `/api/member/company` | Auth | Returns user's company data |
| GET | `/api/member/deals` | Auth | Returns active deals visible to this user |
| GET | `/api/trends/has-new` | Auth | Returns `{ hasNew: boolean }` for new trends badge |
| POST | `/api/trends/mark-seen` | Auth | Marks trends as seen (updates trendsLastSeenAt) |

### Reports

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/reports` | Public | Returns all live/published reports |
| GET | `/api/reports/:id` | Public | Returns a single report by ID or slug |
| POST | `/api/reports` | Admin | Creates a new report |
| PATCH | `/api/reports/:id` | Admin | Updates a report |
| DELETE | `/api/reports/:id` | Admin | Deletes a report |
| POST | `/api/reports/:id/upload` | Admin | Uploads PDF/PPTX/image for a report |
| POST | `/api/reports/:id/track-view` | Public | Records a view event |
| POST | `/api/reports/:id/track-download` | Public | Records a download event |
| GET | `/api/report-requests` | Admin | Lists all report requests |
| POST | `/api/report-requests` | Public | Submits a new report request |
| PATCH | `/api/report-requests/:id` | Admin | Updates request status |

### Briefs

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/briefs` | Auth | Submits a new brief (deducts credits if applicable) |
| GET | `/api/briefs` | Admin | Lists all briefs |
| GET | `/api/briefs/:id` | Auth | Gets a specific brief |
| PATCH | `/api/briefs/:id` | Admin | Updates brief status / admin fields |
| DELETE | `/api/briefs/:id` | Admin | Deletes a brief |
| POST | `/api/briefs/:briefId/checkout` | Public | Creates PayFast checkout for online brief payment |
| POST | `/api/briefs/upload` | Auth | Uploads files for a brief |

### Client Reports (Past Research)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/client-reports` | Admin | Lists all client reports |
| POST | `/api/client-reports` | Admin | Creates a client report |
| PATCH | `/api/client-reports/:id` | Admin | Updates a client report |
| DELETE | `/api/client-reports/:id` | Admin | Deletes a client report |
| GET | `/api/member/client-reports` | Auth | Returns client reports for user's company |

### Companies

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/companies` | Admin | Lists all companies |
| POST | `/api/companies` | Admin | Creates a company |
| GET | `/api/companies/:id` | Admin | Gets a company |
| PATCH | `/api/companies/:id` | Admin | Updates company (tier, credits, notes, etc.) |
| DELETE | `/api/companies/:id` | Admin | Deletes company and all associated users |
| GET | `/api/companies/:id/users` | Admin | Lists all users in a company |
| GET | `/api/companies/:id/studies` | Admin | Lists all studies for a company |

### Users (Admin)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | Lists all users |
| POST | `/api/admin/users` | Admin | Creates a user |
| GET | `/api/admin/users/:id` | Admin | Gets a user by ID |
| PATCH | `/api/admin/users/:id` | Admin | Updates user (tier, role, credits, company, etc.) |
| DELETE | `/api/admin/users/:id` | Admin | Deletes a user |
| GET | `/api/users/email/:email` | Admin | Looks up user by email |
| POST | `/api/admin/users/:id/reset-password` | Admin | Sends password reset for a user |

### Studies

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/studies` | Admin | Lists all studies |
| GET | `/api/studies/:id` | Auth | Gets a specific study |
| PATCH | `/api/studies/:id` | Admin | Updates study (status, delivery date, etc.) |

### Orders & Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/checkout` | Public | Creates a checkout session (order + payment intent) |
| GET | `/api/orders` | Admin | Lists all orders |
| GET | `/api/orders/me` | Auth | Lists orders for current user |
| PATCH | `/api/orders/:id` | Admin | Updates an order |
| POST | `/api/webhooks/payfast` | Public | PayFast payment webhook |
| POST | `/api/webhooks/zapper` | Public | Zapper payment webhook |
| POST | `/api/webhooks/applepay` | Public | Apple Pay webhook |

### Deals

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/deals` | Admin | Lists all deals |
| POST | `/api/deals` | Admin | Creates a deal |
| PATCH | `/api/deals/:id` | Admin | Updates a deal |
| DELETE | `/api/deals/:id` | Admin | Deletes a deal |

### Case Studies

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/case-studies` | Public | Lists all active case studies |
| GET | `/api/case-studies/:slug` | Public | Gets a case study by slug |
| POST | `/api/case-studies` | Admin | Creates a case study |
| PATCH | `/api/case-studies/:id` | Admin | Updates a case study |
| DELETE | `/api/case-studies/:id` | Admin | Deletes a case study |

### Admin Analytics

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/engagement-stats` | Admin | Total users, companies, studies, active users |
| GET | `/api/admin/auth-activity` | Admin | Login stats, failures, resets for last 30 days |
| GET | `/api/admin/test24-stats` | Admin | Test24 study counts by type and status |
| GET | `/api/admin/brief-stats` | Admin | Brief pipeline stats |
| GET | `/api/admin/report-engagement` | Admin | Global report view/download totals |
| GET | `/api/admin/settings-stats` | Admin | Platform-wide stats for Settings page |

### Miscellaneous

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/coupon-claims` | Public | Claim a coupon |
| POST | `/api/mailer-subscriptions` | Public | Subscribe to newsletter |
| GET | `/api/mailer-subscriptions` | Admin | Lists all newsletter subscribers |
| POST | `/api/contact` | Public | Submits contact form |
| POST | `/api/inquiries` | Public | Submits consult inquiry |
| GET | `/api/inquiries` | Admin | Lists all inquiries |
| POST | `/api/activity` | Auth | Logs a frontend activity event |
| POST | `/api/report-requests` | Public | Submits a report topic request |

### File Serving

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/files/:path*` | Public | Serves a file from Replit Object Storage |

---

## 16. Storage Interface (All Methods)

The `IStorage` interface defines every database operation. Implemented by `DatabaseStorage`.

```
Users
  getUser(id)
  getUserByUsername(username)
  getUserByEmail(email)
  getAllUsers()
  createUser(user)
  updateUser(id, updates)
  deleteUser(id)
  getUsersByCompanyId(companyId)

Sessions
  createSession(session)
  getSessionByTokenHash(tokenHash)
  deleteSession(id)
  deleteUserSessions(userId)

Password Resets
  createPasswordReset(reset)
  getPasswordResetByTokenHash(tokenHash)
  markPasswordResetUsed(id)

Companies
  createCompany(company)
  getCompany(id)
  getCompanyByName(name)
  getAllCompanies()
  updateCompany(id, updates)
  deleteCompany(id)

Reports
  createReport(report)
  getReport(id)
  getAllReports()
  updateReport(id, updates)
  deleteReport(id)
  processScheduledReports()

Client Reports
  createClientReport(report)
  getClientReport(id)
  getClientReportsByCompanyId(companyId)
  getAllClientReports()
  updateClientReport(id, updates)
  deleteClientReport(id)

Brief Submissions
  createBriefSubmission(brief)
  getBriefSubmission(id)
  getBriefSubmissionsByEmail(email)
  getBriefSubmissionsByCompanyId(companyId)
  getAllBriefSubmissions()
  updateBriefSubmission(id, updates)
  deleteBriefSubmission(id)

Studies
  createStudy(study)
  getStudy(id)
  getStudyByBriefId(briefId)
  getStudiesByCompanyId(companyId)
  getStudiesByEmail(email)
  getAllStudies()
  updateStudy(id, updates)
  updateStudyStatus(id, status)

Orders
  createOrder(order)
  getOrder(id)
  getAllOrders()
  getOrdersByEmail(email)
  updateOrder(id, updates)
  createOrderItem(item)
  getOrderItems(orderId)

Payment Intents
  createPaymentIntent(intent)
  getPaymentIntent(id)
  getPaymentIntentByProviderIntentId(providerIntentId)
  updatePaymentIntent(id, updates)
  createPaymentEvent(event)
  getPaymentEvents(intentId)

Subscriptions
  createSubscription(subscription)
  getSubscription(id)
  getSubscriptionByToken(token)
  getSubscriptionsByEmail(email)
  getSubscriptionsByUserId(userId)
  updateSubscription(id, updates)
  getAllSubscriptions()

Credits / Ledger
  createCreditLedgerEntry(entry)
  getCreditLedgerByCompanyId(companyId)
  getCompanyCreditBalance(companyId, creditType)
  atomicDeductCredits(companyId, creditType, amount)
  submitBriefWithCredits(params)

Deals
  createDeal(deal)
  getDeal(id)
  getAllDeals()
  updateDeal(id, updates)
  deleteDeal(id)

Case Studies
  getCaseStudies()
  getCaseStudyBySlug(slug)
  createCaseStudy(caseStudy)
  updateCaseStudy(id, updates)
  deleteCaseStudy(id)

Report Analytics
  createReportEvent(event)
  getReportEvents(reportId, options)
  getReportAnalytics(reportId, range)          → today / 30d / 12m
  upsertReportLastViewed(data)
  getReportViewers(reportId)
  getGlobalReportEngagement(since)

Activity Events
  createActivityEvent(event)
  getActivityEventsByCompany(companyId, from, to)
  getActivityEventsByUser(userId, from, to)
  getActivityEventsSince(since)

Report Requests
  createReportRequest(request)
  getReportRequest(id)
  getAllReportRequests()
  updateReportRequest(id, updates)

Mailer
  getAllInsightMailers()
  getInsightMailer(id)
  createInsightMailer(mailer)
  updateInsightMailer(id, updates)
  deleteInsightMailer(id)
  getPulseSubscribersByIndustry(industry)

Misc
  createCouponClaim(claim)
  getCouponClaimByEmail(email)
  createMailerSubscription(subscription)
  getMailerSubscriptionByEmail(email)
  getAllMailerSubscriptions()
  createInquiry(inquiry)
  getAllInquiries()
  getUserReportDownloadCount(userId)

Admin Preferences
  getAdminPreferences(userId)
  upsertAdminPreferences(userId, prefs)
```

---

## 17. Tag Configuration

Used in report creation and for related-content logic.

### Industry Tags
`Food`, `Beverage`, `Alcohol`, `Financial`, `Services`, `Beauty`, `FMCG`, `Agency`

### Theme Tags
- Calm and control
- Indulgence and reward
- Value and fairness
- Simplicity and clarity
- Convenience and on demand
- Moderation and balance
- Trust and believability
- Local and cultural
- Health and vitality
- Status and identity
- Connection and community
- Innovation and experimentation

### Method Tags
- Behavioural testing
- Market simulation
- Automated reporting
- Qual depth
- Analysis engine
- Platform overview
- Research setup
- Respondent experience

---

## 18. Industry Options

Used across signup, settings, brief forms, and company management:

Food & Beverage, Retail, Financial Services, Banking & Fintech, Insurance, Technology, Telecoms & Connectivity, Media & Entertainment, FMCG / Packaged Goods, Alcohol & Beverages, Beauty & Personal Care, Household & Homecare, Quick Service Restaurants & Fast Food, Automotive & Mobility, Travel & Tourism, Healthcare & Pharma, Education, Non-profit & NGOs, Government & Public Sector, E-commerce & Marketplaces, Real Estate & Property, Other

---

## 19. Environment Variables

| Variable | Used for |
|---|---|
| `DATABASE_URL` | PostgreSQL (Neon) connection string |
| `PAYFAST_SANDBOX` | `"true"` = sandbox mode |
| `PAYFAST_MERCHANT_ID` | PayFast merchant ID |
| `PAYFAST_MERCHANT_KEY` | PayFast merchant key |
| `PAYFAST_PASSPHRASE` | PayFast passphrase for signature |
| `PAYFAST_SANDBOX_MERCHANT_ID` | Sandbox-specific override |
| `PAYFAST_SANDBOX_MERCHANT_KEY` | Sandbox-specific override |
| `PAYFAST_SANDBOX_PASSPHRASE` | Sandbox-specific override |
| `PAYFAST_PRODUCTION_MERCHANT_ID` | Production-specific override |
| `PAYFAST_PRODUCTION_MERCHANT_KEY` | Production-specific override |
| `PAYFAST_PRODUCTION_PASSPHRASE` | Production-specific override |
| `ZAPPER_MERCHANT_ID` | Zapper merchant ID |
| `ZAPPER_SITE_ID` | Zapper site ID |
| `ZAPPER_API_KEY` | Zapper API key |
| `ZAPPER_SANDBOX` | `"true"` = Zapper sandbox |
| `APPLE_PAY_MERCHANT_ID` | Apple Pay merchant ID |
| `ADMIN_EMAILS` | Comma-separated admin email recipients |
| `FRONTEND_URL` | e.g. `https://www.innovatr.co.za` |
| `NODE_ENV` | `production` enables secure cookies |
| `RESEND_API_KEY` | Managed via Replit Resend integration |

---

*End of backend reference.*

# Innovatr Website Design Guidelines

## Design Approach
**Reference-Based Approach**: Premium SaaS platform aesthetic (Stripe, Linear, Notion) combined with tech-forward energy. This is NOT an agency brochure—it's a conversion-driven digital product platform.

## Core Design Principles
- **Speed & Clarity**: Clear buying paths with minimal friction
- **Tech-Forward Premium**: Modern, analytical, high-credibility
- **Conversion-Focused**: Every section drives toward purchase/membership decisions

## Visual Identity

### Color Palette
- **Base**: Clean white backgrounds with charcoal text
- **Accent**: Neon accent color (Innovatr brand palette) for CTAs, highlights, and interactive elements
- **Hierarchy**: Use accent sparingly for maximum impact on conversion points

### Typography
- **Headlines**: Bold, large, confident—emphasis on speed and outcomes
- **Body**: Clean, readable, modern sans-serif
- **Hierarchy**: Clear distinction between hero headlines (XL), section headers (L), and body text

### Layout System
- **Spacing**: Use Tailwind units of 4, 8, 12, 16, 20, 24 for consistent rhythm
- **Containers**: max-w-7xl for full sections, max-w-6xl for content areas
- **Grid**: Flexible grid system for pricing cards and service sections

## Component Library

### Navigation
- Clean header with minimal links
- Prominent dual CTAs: "Run a Test Now" + "See Membership Plans"
- Sticky navigation on scroll

### Hero Section
- **Layout**: Centered content with large headline, subline, dual CTAs
- **Background**: Motion graphic/video loop showing swipe testing interactions (muted autoplay)
- **CTA Buttons**: Blurred backgrounds for buttons over video, high contrast
- **Headlines**: "Smart Research in 24 Hours" or "Test Ideas Today. Get Answers Tomorrow"
- **Subline**: "AI-powered, decision-centric testing. Local insights. Market-ready answers—all within 24 hours."

### Stats Counter Strip
- Horizontal band with 4-5 columns
- Animated number counters (count-up effect on scroll into view)
- Stats: "+200 Studies", "+10 Markets", "+10 Industries", "+45,000 Consumer Responses", "50% YoY Growth"
- Label above: "Brands who trust Innovatr"

### Trust Bar
- Infinite horizontal auto-scroll of client logos
- Logos: Heineken, Discovery Bank, Rain, DGB, PepsiCo, Tiger Brands, Mondelez, ooba
- Subtle grayscale/colored treatment

### Service Cards
- 2x2 grid on desktop (single column mobile)
- Each card includes: Icon, Service name, 3-4 bullet points
- Cards: Innovatr Intelligence, Test24 Basic, Test24 Pro, Innovatr Consult
- Subtle hover lift effect

### Pricing Section
**Two-Part Structure:**

**A. Pay-As-You-Go Cards** (side-by-side):
- Test24 Basic: R10,000 per idea
- Test24 Pro: R50,000 per study
- Include feature bullets beneath price
- "Buy Now" CTA with Stripe integration

**B. Membership Tiers** (3-column grid):
- Entry (R60k/year), Gold (R120k/year), Platinum (R195k/year)
- Badge treatments: "Most Popular" on Gold, "Best Value" on Platinum
- Feature comparison lists with checkmarks
- Highlight savings messaging: "Save up to 40%"
- "Become a Member" CTAs

### Methodology Section
- Two-column split layout
- Left: Text block with "04 — The Proof" headline and description
- Right: Embedded Upsiide video (16:9 ratio, autoplay muted)
- Below: Row of 5 icons representing testing methods (Swipe Testing, Trade-off Pairs, AI Qual, Market Simulator, Private Dashboard)

### Promo Banner
- Full-width attention-grabbing band
- Updatable content: "This Month: Run 2 Test24 Basic Ideas, Get 1 Free"
- CTA: "View Deals"
- High contrast background with accent color

### Contact Section
- Split layout: Form left, contact details right
- Simple fields: Name, Email, Company, Message
- "Book a 30-min Demo" secondary CTA
- Email: richard@innovatr.co.za

### Footer
- Multi-column layout with navigation, legal links
- Credit: "Powered by Just Design Group"
- Social media links

## Animations & Interactions

### Micro-Animations (Subtle)
- Number counters (count-up on scroll into view)
- Horizontal logo scroll (smooth, continuous)
- Card hover states (subtle lift + shadow)
- CTA button hover (scale 1.02, enhanced glow)

### NO Heavy Animations
- Avoid distracting scroll effects
- No parallax overuse
- No complex page transitions

## Responsive Behavior
- Mobile: Single column stacking, maintain CTA prominence
- Tablet: 2-column grids where appropriate
- Desktop: Full multi-column layouts, max-w-7xl containers

## Images
- **Hero**: Motion video loop (swiping interactions, testing interface preview) - Full viewport height with overlay gradient for text readability
- **Client Logos**: Clean logo marks in horizontal scrolling banner
- **Service Icons**: Modern, minimalist iconography for each service offering
- **No stock photos**: Keep focus on product/platform interface visuals

## Key UX Priorities
1. **Clear Value Prop**: Immediately communicate 24hr research benefit
2. **Dual Path**: Make both PAYG and Membership paths equally visible
3. **Trust Signals**: Stats, client logos, methodology proof points
4. **Friction-Free Purchase**: Direct Stripe checkout integration
5. **Member Portal Preview**: Show what members unlock (dashboard, credits, reports)

## Tone in All Copy
- Fast, confident, expert
- Outcome-focused
- "Speed. AI intelligence. Affordability. Decision-centric. Local insight. 24hr delivery."
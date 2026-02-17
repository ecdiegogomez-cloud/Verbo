# WEDDING SPEECH SAVIOR — Hosting & Domain Strategy

**Comparative Analysis of Hosting Providers & Domain Registrars**
*for a Next.js + Gemini AI Application*

Prepared for: Diego Gomez Juan | Date: February 2026 | Version 1.1

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Requirements](#technical-requirements)
3. [Hosting Providers Comparison](#hosting-providers-comparison)
   - Vercel | Railway | Netlify | Hostinger VPS | DigitalOcean | Render | Cloudflare
4. [Quick Comparison Matrix](#quick-comparison-matrix)
5. [Domain Registrars Comparison](#domain-registrars-comparison)
6. [12-Month Cost Projection](#12-month-cost-projection)
7. [Security Features Comparison](#security-features-comparison)
8. [Strategic Recommendations](#strategic-recommendations)

---

## Executive Summary

This document provides a comprehensive comparison of hosting providers and domain registrars for the Wedding Speech Savior application, a bilingual (EN/ES) speech generator built with Next.js and Google Gemini AI.

The application requires server-side rendering (SSR), API routes with streaming capabilities, and support for Node.js runtime. These technical requirements narrow the hosting options to platforms that support full-stack Next.js deployments, ruling out basic shared hosting for production use.

This report evaluates **7 hosting platforms** across pricing, performance, security, scalability, and ease of deployment, along with **4 domain registrars** for securing your custom domain.

---

## Technical Requirements

| Component | Technology / Requirement |
|---|---|
| **Framework** | Next.js (App Router) |
| **AI Engine** | Google Gemini API with streaming responses |
| **Runtime** | Node.js (server-side required for API routes) |
| **i18n** | next-intl (English / Spanish) |
| **Rendering** | SSR + Dynamic routes + API streaming endpoint |
| **Environment** | GEMINI_API_KEY via .env.local |
| **Build Output** | Mixed: Static pages + Dynamic server routes |

> **Key constraint:** The `/api/generate` endpoint uses Gemini AI streaming, which requires persistent server connections and cannot run on purely static hosting. Any hosting solution must support Node.js server runtime, not just static file serving.

---

## Hosting Providers Comparison

### Vercel (Recommended for MVP)

Vercel is the company behind Next.js, offering the most seamless deployment experience. Zero-configuration deployment, automatic SSR, edge functions, and preview environments for every Git push.

| Aspect | Details |
|---|---|
| **Hobby Plan (Free)** | 100 GB bandwidth, 150K function invocations/mo, 6,000 build minutes. Non-commercial use only. |
| **Pro Plan** | $20/user/month. 1 TB bandwidth, $20 included credit, Turbo builds (30 vCPU), team collaboration. |
| **Next.js Support** | Native, zero-config. ISR, SSR, Edge Functions, streaming API routes all work out of the box. |
| **Security** | Automatic HTTPS/SSL, DDoS protection, WAF (basic on free tier), environment variable encryption. |
| **Uptime** | 99.99% SLA on Enterprise. High reliability on all plans with global CDN. |
| **Scalability** | Automatic. Scales serverless functions on demand. No manual configuration needed. |
| **Limitations** | Costs can spike with high traffic. Serverless function timeout: 60s (Hobby), 300s (Pro). Per-seat pricing for teams. |

### Railway

Railway is a container-based PaaS with excellent developer experience. Auto-detects Next.js projects, offers managed databases, preview environments, and transparent usage-based pricing. Widely recommended as the best Vercel alternative for production apps.

| Aspect | Details |
|---|---|
| **Hobby Plan** | $5/month (includes $5 usage credit). One-click Next.js deployment. |
| **Pro Plan** | $20/month per seat. Pay for actual CPU/memory usage. Typical Next.js app: $8-15/mo. |
| **Next.js Support** | Full SSR, API routes, streaming. Container-based (no serverless limits). Add databases in same platform. |
| **Security** | Automatic SSL, private networking between services, environment variable management. |
| **Scalability** | Scale-to-zero available. Add services (Redis, PostgreSQL) easily. Predictable pricing at scale. |
| **Limitations** | No edge deployment. Smaller community vs Vercel/Netlify. No built-in CDN (pair with Cloudflare). |

### Netlify

Netlify is a popular Jamstack platform with strong CI/CD pipelines, serverless functions, and a generous free tier. Its OpenNext integration has improved Next.js support significantly in recent updates.

| Aspect | Details |
|---|---|
| **Free Tier** | 100 GB bandwidth/mo, 300 build minutes, 100 form submissions. Commercial use allowed. |
| **Pro Plan** | $19/user/month. Increased limits, background functions, advanced analytics. |
| **Next.js Support** | Via OpenNext runtime. Supports SSR and API routes through serverless functions. Edge Functions available. |
| **Security** | Automatic SSL, role-based access, form spam filtering, identity provider (GoTrue API). |
| **Scalability** | Serverless scaling. Global CDN distribution. Built-in form handling and authentication. |
| **Limitations** | Next.js integration not as tight as Vercel. Credit-based pricing since Sep 2025 makes costs harder to predict. |

### Hostinger VPS

Hostinger VPS provides full root access to a virtual private server. Most cost-effective option for long-term production use, though it requires Linux administration knowledge.

| Aspect | Details |
|---|---|
| **KVM 1 Plan** | $4.99/mo. 1 vCPU, 4 GB RAM, 50 GB NVMe SSD, 4 TB bandwidth. |
| **KVM 2 Plan** | $6.99/mo. 2 vCPU, 8 GB RAM, 100 GB NVMe SSD, 8 TB bandwidth. |
| **Next.js Support** | Full support via manual setup. Install Node.js, configure Nginx reverse proxy, PM2 process manager. |
| **Security** | DDoS protection, firewall management, free dedicated IP. Manual SSL setup (Let's Encrypt). Weekly backups included. |
| **Uptime** | 99.9% uptime guarantee. AMD EPYC processors, NVMe storage. |
| **Scalability** | Vertical scaling (upgrade plan). Manual horizontal scaling. Upgrade takes minutes through dashboard. |
| **Limitations** | Requires Linux/sysadmin knowledge. Manual deployment (CI/CD must be configured). No phone support. |

### DigitalOcean App Platform

DigitalOcean App Platform is a managed PaaS that auto-detects Next.js projects and provides automatic builds, scaling, and managed databases. Balances flexibility with ease of use.

| Aspect | Details |
|---|---|
| **Starter** | Free for static sites. Basic Droplet from $5/mo (512 MB RAM). $200 in credits for 60 days (new accounts). |
| **Professional** | From $12/mo (1 GB RAM). Per-second billing with 60s minimum. Managed PostgreSQL from $15/mo. |
| **Next.js Support** | Auto-detects Next.js. Automatic builds from Git. Full SSR and API route support. |
| **Security** | Free SSL, DDoS protection, VPC networking, automated backups available. |
| **Limitations** | Components billed separately. Total cost depends on architecture. Less Next.js-specific optimization than Vercel. |

### Render

Render is a cloud platform offering simple deployment for web services, databases, and background workers. Supports Next.js through Docker-based deployments with persistent services.

| Aspect | Details |
|---|---|
| **Free Tier** | Free static sites with global CDN. 750 web service hours/mo (services sleep after inactivity). |
| **Starter Plan** | $7/mo for web services. PostgreSQL from $7/mo. Redis and cron jobs available. |
| **Next.js Support** | Container-based deployment. Full SSR, API routes, WebSockets. Good for long-running connections. |
| **Limitations** | Free tier services sleep after inactivity (cold starts). Less Next.js-specific than Vercel. 90-day free DB expiration. |

### Cloudflare Pages + Workers

Cloudflare Pages provides edge deployment with Workers for server-side logic. Excellent performance for cost-sensitive projects with global traffic, using the OpenNext framework for Next.js compatibility.

| Aspect | Details |
|---|---|
| **Free Tier** | Unlimited bandwidth, 500 builds/mo, 100K Worker requests/day. Very generous. |
| **Paid Plan** | $5/mo for Workers Paid (10M requests/mo included). R2 storage from $0.015/GB. |
| **Next.js Support** | Via OpenNext adapter. Edge deployment for ultra-low latency. Some Next.js features may have constraints. |
| **Limitations** | Worker execution limits. Not all Next.js features fully supported. Requires OpenNext configuration. |

---

## Quick Comparison Matrix

| Provider | Free Tier | Paid From | Next.js | Ease | Scale | Best For |
|---|---|---|---|---|---|---|
| **Vercel** | Yes | $20/user/mo | 5/5 | 5/5 | 4/5 | MVP / Launch |
| **Railway** | $5 credit | $5/mo | 4/5 | 4/5 | 4/5 | Production |
| **Netlify** | Yes | $19/user/mo | 4/5 | 4/5 | 4/5 | Jamstack |
| **Hostinger VPS** | No | $4.99/mo | 3/5 | 2/5 | 3/5 | Budget / Control |
| **DigitalOcean** | $200 credit | $5/mo | 4/5 | 3/5 | 4/5 | Full-stack cloud |
| **Render** | Yes (limited) | $7/mo | 3/5 | 3/5 | 3/5 | WebSockets |
| **Cloudflare** | Yes | $5/mo | 3/5 | 2/5 | 5/5 | Edge / Global |

---

## Domain Registrars Comparison

| Registrar | .com 1st Year | .com Renewal | WHOIS Privacy | Best For | Rating |
|---|---|---|---|---|---|
| **Cloudflare** | ~$10.46 | ~$10.46 | Free (WHOIS redaction) | Long-term savings | 5/5 |
| **Namecheap** | ~$6.49 | ~$18.48 | Free (WhoisGuard) | Beginners | 4/5 |
| **Porkbun** | ~$9.73 | ~$11.08 | Free | Best UX + Support | 4/5 |
| **Hostinger** | From $0.99 | ~$15.99 | Free (with hosting) | Bundled with hosting | 3/5 |

### Recommendations

- **Best Long-Term Value:** Cloudflare Registrar sells domains at cost with zero markup. Registration and renewal prices are identical, making it the cheapest option from year 3 onwards.
- **Best for Beginners:** Namecheap offers an intuitive interface, strong community support, and competitive first-year pricing. Renewals are higher, but the user experience is excellent.
- **Best Combo with Hosting:** If using Hostinger VPS, registering the domain with Hostinger simplifies DNS management. Free domain included with annual hosting plans.
- **Pro Tip:** Always calculate 5-year total cost of ownership. A cheap first year means nothing if renewals are 3x higher. Cloudflare consistently wins on long-term pricing.

---

## 12-Month Cost Projection

| Scenario | Hosting/yr | Domain/yr | Total/yr | Monthly Avg |
|---|---|---|---|---|
| **Vercel Hobby + Cloudflare** | $0 | ~$10.46 | **~$10.46** | ~$0.87 |
| **Railway Hobby + Cloudflare** | $60 | ~$10.46 | **~$70.46** | ~$5.87 |
| **Hostinger VPS + Hostinger** | $59.88 | Free (1st yr) | **~$59.88** | ~$4.99 |
| **Vercel Pro + Cloudflare** | $240 | ~$10.46 | **~$250.46** | ~$20.87 |
| **DigitalOcean + Cloudflare** | $60-144 | ~$10.46 | **~$70-154** | ~$5.87-12.87 |

---

## Security Features Comparison

| Feature | Vercel | Railway | Netlify | Hostinger | DO | Cloudflare |
|---|---|---|---|---|---|---|
| **Auto SSL/TLS** | Yes | Yes | Yes | Manual | Yes | Yes |
| **DDoS Protection** | Yes | Basic | Basic | Yes | Yes | Best |
| **WAF** | Basic | No | No | No | No | Best |
| **Env Var Encryption** | Yes | Yes | Yes | Manual | Yes | N/A |
| **Auto Backups** | Git-based | Yes | Git-based | Weekly | Optional | N/A |

---

## Strategic Recommendations

### Phase 1: MVP Launch (Months 1-3)

1. **Deploy to Vercel (Free Hobby tier)** for zero-cost, zero-config deployment. Perfect for validating the product with real users.
2. **Register domain with Cloudflare** (~$10.46/year for .com) for the best long-term pricing and free DNS/CDN/SSL.
3. **Total monthly cost: ~$0.87/month** (domain only). Ideal for testing market fit.

### Phase 2: Growth (Months 4-12)

4. **If traffic grows:** Upgrade to Vercel Pro ($20/mo) for commercial use and higher limits, or migrate to Railway ($5-15/mo) for more predictable costs.
5. **If budget is priority:** Migrate to Hostinger VPS ($4.99/mo) for maximum cost control. Requires manual setup but offers the lowest ongoing cost.

### Phase 3: Scale (Year 2+)

6. **For high traffic:** Railway Pro or Hostinger VPS KVM 2 offer the best value. Use Cloudflare CDN in front of any provider for global performance.
7. **At scale, avoid Vercel:** Per-seat pricing and bandwidth overages can make costs unpredictable. A VPS handling millions of requests costs ~$7-18/month vs potentially $500+ on Vercel.

### Final Recommendation

> **For Wedding Speech Savior, the optimal strategy is to start with Vercel's free tier + Cloudflare domain for the MVP phase.** This combination delivers zero-friction deployment, zero cost, and the ability to validate the product before committing to any paid infrastructure. Once the app gains traction, evaluate Railway or Hostinger VPS based on traffic patterns and budget priorities.
>
> *Remember: don't optimize costs before you have users. Developer time spent fighting infrastructure is more expensive than hosting.*

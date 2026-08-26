# Graph Report - /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai  (2026-08-26)

## Corpus Check
- 60 files · ~88,779 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 203 nodes · 252 edges · 33 communities detected
- Extraction: 79% EXTRACTED · 21% INFERRED · 0% AMBIGUOUS · INFERRED: 53 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]

## God Nodes (most connected - your core abstractions)
1. `addToast()` - 20 edges
2. `POST()` - 18 edges
3. `apiFetch()` - 17 edges
4. `GET()` - 14 edges
5. `handleBotMessage()` - 12 edges
6. `createClient()` - 9 edges
7. `useCountUp()` - 8 edges
8. `PATCH()` - 7 edges
9. `sendWhatsAppMessage()` - 7 edges
10. `runReminders()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `addToast()` --calls--> `loadRecentRx()`  [INFERRED]
  /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/app/dashboard/page.tsx → /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/components/PrescriptionView.tsx
- `StatCard()` --calls--> `useCountUp()`  [INFERRED]
  /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/components/NoShowView.tsx → /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/lib/hooks.ts
- `updateStatus()` --calls--> `updateAppointment()`  [INFERRED]
  /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/app/dashboard/page.tsx → /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/lib/api.ts
- `sendMsg()` --calls--> `sendMessage()`  [INFERRED]
  /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/app/dashboard/page.tsx → /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/lib/api.ts
- `addToast()` --calls--> `sendLink()`  [INFERRED]
  /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/app/dashboard/page.tsx → /Users/taaqibmasood/Documents/Web Dev & Saas/reva-ai/components/DepositsView.tsx

## Communities

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (22): addInvoice(), remindOne(), sendAllReminders(), handleManualSign(), handleReminder(), handleSaveTemplate(), handleSend(), sendLink() (+14 more)

### Community 1 - "Community 1"
Cohesion: 0.11
Nodes (13): handleSkip(), update(), DELETE(), GET(), getClinic(), handleStatusUpdate(), PATCH(), POST() (+5 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (8): StatCard(), StatCard(), StatCard(), useCountUp(), StatCard(), loadRecentRx(), StatCard(), AnimatedStat()

### Community 3 - "Community 3"
Cohesion: 0.11
Nodes (2): goNext(), handler()

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (17): apiFetch(), createAppointment(), createInvoice(), createPatient(), getAppointments(), getClinic(), getConversations(), getFollowUps() (+9 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (11): confirmAndBook(), generateSlots(), goToShowDoctors(), handleBotMessage(), matchesKeyword(), nextDays(), reply(), saveState() (+3 more)

### Community 6 - "Community 6"
Cohesion: 0.16
Nodes (3): buildDaySlots(), formatTime(), selectDay()

### Community 7 - "Community 7"
Cohesion: 0.5
Nodes (0): 

### Community 8 - "Community 8"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Community 9"
Cohesion: 0.67
Nodes (0): 

### Community 10 - "Community 10"
Cohesion: 0.67
Nodes (0): 

### Community 11 - "Community 11"
Cohesion: 0.67
Nodes (0): 

### Community 12 - "Community 12"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Community 13"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "Community 14"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **Thin community `Community 12`** (2 nodes): `Home()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 13`** (2 nodes): `handleSubmit()`, `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (2 nodes): `Navbar()`, `Navbar.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 15`** (2 nodes): `Features()`, `Features.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 16`** (2 nodes): `getInitials()`, `ReferralView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 17`** (2 nodes): `BriefButton()`, `BriefButton.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 18`** (2 nodes): `createClient()`, `client.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `server.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `next.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `Hero.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `Pricing.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `HowItWorks.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `ReviewsView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `Testimonials.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `FollowUpView.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `CTA.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `types.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `addToast()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `useCountUp()` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `StatCard()` connect `Community 2` to `Community 6`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Are the 15 inferred relationships involving `addToast()` (e.g. with `sendLink()` and `addInvoice()`) actually correct?**
  _`addToast()` has 15 INFERRED edges - model-reasoned connections that need verification._
- **Are the 7 inferred relationships involving `POST()` (e.g. with `createClient()` and `sendWhatsAppMessage()`) actually correct?**
  _`POST()` has 7 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `handleBotMessage()` (e.g. with `POST()` and `createClient()`) actually correct?**
  _`handleBotMessage()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
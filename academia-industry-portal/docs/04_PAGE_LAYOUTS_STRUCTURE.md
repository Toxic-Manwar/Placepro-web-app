# Page Layouts & Structure Specifications
## Academia-Industry Collaboration Portal

---

## PAGE LAYOUT CONVENTIONS

### Global Structure
```
┌─────────────────────────────────────────────────────────────┐
│ HEADER (Fixed/Sticky)                                       │
│ [Logo] [Menu] [Search] [Notifications] [User Profile]      │
├─────────────────────────────────────────────────────────────┤
│ SIDEBAR (if applicable)               MAIN CONTENT          │
│ [Navigation Links]                    [Page Content]        │
│                                                              │
│ [Profile]                            [Widgets/Components]  │
│ [Dashboard]                                                 │
│ [Opportunities]                                            │
│ [Tests]                                                    │
│ [Portfolio]                                                │
│ [Settings]                                                 │
├─────────────────────────────────────────────────────────────┤
│ FOOTER                                                      │
│ [Links] [Social] [Copyright]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. HOME PAGE STRUCTURE (`/`)

### Section 1: Hero Section (Full Width)
```
[Background Image]
┌────────────────────────────────────┐
│      PORTAL HEADING                │
│  "Connect Academia & Industry"     │
│                                    │
│  Subheading: Bridge the skills gap│
│                                    │
│  [Get Started] [Learn More]        │
│                                    │
│  Quick Portal Links:               │
│  [Student] [Company] [Faculty]     │
│  [Institution]                     │
└────────────────────────────────────┘
```

### Section 2: Key Statistics (4 Columns)
```
┌──────────┬──────────┬──────────┬──────────┐
│ 10,000+  │ 500+     │ 5,000+   │ 95%      │
│ Students │ Companies│ Jobs     │ Placement│
└──────────┴──────────┴──────────┴──────────┘
```

### Section 3: How It Works (3 Step Cards)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 1. Assess    │→ │ 2. Match     │→ │ 3. Apply     │
│ Your Skills  │  │ With Jobs    │  │ & Interview  │
│              │  │              │  │              │
│ [Icon]       │  │ [Icon]       │  │ [Icon]       │
│ Description  │  │ Description  │  │ Description  │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Section 4: Featured Companies (Carousel)
```
┌─────────────────────────────────────────┐
│ Featured Hiring Companies               │
│                                         │
│ [Company 1] [Company 2] [Company 3]    │
│ [Company 4] [Company 5] [Company 6]    │
│                                         │
│ ◄ Carousel Navigation ►                 │
└─────────────────────────────────────────┘
```

### Section 5: Latest Opportunities (Horizontal Scroll)
```
┌─────────────────────────────────────────┐
│ Latest Opportunities                    │
│                                         │
│ [Opp Card] [Opp Card] [Opp Card]       │
│   [Logo]     [Logo]     [Logo]          │
│   Title      Title      Title           │
│   Company    Company    Company         │
│   [View]     [View]     [View]          │
└─────────────────────────────────────────┘
```

---

## 2. STUDENT DASHBOARD (`/student/dashboard`)

### Layout: 2 Column (Sidebar + Main)

**Left Sidebar (Fixed):**
```
┌──────────────────────────┐
│ STUDENT MENU             │
├──────────────────────────┤
│ ☰ Dashboard (Active)     │
│ 👤 My Profile            │
│ 💼 Skills Assessment      │
│ 🎯 Skill Mapping          │
│ 💼 Internships            │
│ 👔 Jobs                   │
│ 📝 Mock Tests             │
│ 🎓 Learning               │
│ 📂 Portfolio              │
│ 📋 Applications           │
│ ⚙️  Settings              │
│ 🚪 Logout                │
└──────────────────────────┘
```

**Main Content Area:**
- Profile completion bar
- 4 Quick Stats (Applications, Shortlists, Offers, Interviews)
- Skill overview & radar readiness
- Recommended Jobs & Internships with match percentages
- Upcoming application deadlines

---

## 3. SKILL ASSESSMENT PAGE (`/student/skill-assessment`)
- Pre-assessment instructions & rules
- Live timed testing environment with question palette & countdown
- Comprehensive diagnostics report & skill-gap radar chart

---

## 4. INTERNSHIP & JOB LISTINGS (`/student/internships`, `/student/jobs`)
- Sticky multi-filter sidebar (category, location, stipend range, remote toggle, skills)
- Sortable card grid with 1-click modal apply & match calculation

---

## 5. COMPANY DASHBOARD & CANDIDATE ATS (`/industry/dashboard`, `/industry/candidates`)
- Metrics overview cards (Postings, Active applicants, Interview stage, Hired)
- Candidate management table & Kanban ATS board with direct stage transition controls

---

## 6. DIGITAL PORTFOLIO (`/student/portfolio`)
- Verified badge showcase
- Project showcase with live links & GitHub repository embeds
- Verified certificates & shareable public portfolio link with QR code

---

## 7. INSTITUTION ANALYTICS (`/institution/analytics`)
- Tabbed dashboard for batch stats, department placement %, average CTC, and top recruiter benchmarks.

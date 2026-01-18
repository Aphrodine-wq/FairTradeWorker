# FairTradeWorker | Developer Quick Reference
**Last Updated:** January 4, 2026

---

## Project Structure Quick Reference

```
fairtradeworker/
├── components/              # React UI components (28 total)
│   ├── ui/
│   │   ├── Layout.tsx       # Main app shell with navigation & theming
│   │   └── VideoPlayer.tsx  # Media player component
│   ├── *Dashboard.tsx       # Role-specific dashboards (6 types)
│   ├── JobPoster.tsx        # Multimodal job creation
│   ├── JobMarketplace.tsx   # Bid listing & discovery
│   ├── Operations.tsx       # Scheduling & dispatch
│   ├── Settings.tsx         # User settings (NEW: Advanced Theme tab)
│   ├── Wallet.tsx          # Fintech UI & payouts
│   ├── Estimates.tsx       # Estimate generation
│   ├── CRM.tsx             # Customer pipeline
│   ├── EliteVoiceHub.tsx   # Voice assistant
│   └── ... (12+ more)
│
├── services/
│   └── geminiService.ts    # All Google GenAI API calls (9 functions)
│
├── App.tsx                 # Main router & global state
├── types.ts               # TypeScript interfaces (source of truth)
├── index.tsx              # React DOM entry point
├── index.html             # HTML shell with Tailwind CDN
│
├── README.md              # Project overview (UPDATED)
├── PROJECT_SPEC.md        # Technical specification (UPDATED)
├── SYSTEM_ANALYSIS_SUMMARY.md  # Detailed analysis (NEW)
├── DEVELOPER_GUIDE.md     # This file (NEW)
└── package.json           # Dependencies & scripts
```

---

## Key Files & Their Purposes

### Core Application

**App.tsx (220 lines)**
- Main React component
- Holds all global state (profile, theme, nav, jobs)
- Renders role-specific views based on currentView
- Routes between dashboard, marketplace, settings, etc.

**Key State:**
```typescript
profile: UserProfile;        // User identity + role
themeSettings: ThemeSettings; // UI customization
currentView: View;           // Current screen
userJobs: Job[];             // Posted/assigned jobs
customNavConfig: NavItemConfig[] | null; // Nav visibility
```

**How to add a new view:**
1. Add to `View` type in `types.ts`
2. Add case in `renderContent()` switch
3. Create component for that view
4. Add navigation button in `Layout.tsx`

---

### Type Definitions (types.ts - 259 lines)

**Critical Interfaces:**

```typescript
// User System
enum UserRole { HOMEOWNER, CONTRACTOR, SUBCONTRACTOR, CREW_MEMBER, FRANCHISE_OWNER, ADMIN }
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tier: 'FREE' | 'STARTER' | 'PRO' | 'ELITE' | 'ENTERPRISE';
  preferences: UserPreferences;
}

// Marketplace
interface Job {
  id: string;
  title: string;
  category: ServiceCategory; // Plumbing, Electrical, etc.
  description: string;
  location: string;
  budgetRange: string;
  status: JobStatus;
  stage: JobStage; // POSTED → BIDDING → SCHEDULED → WORKING → REVIEW → COMPLETE
  images: string[];
  videos?: string[];
  postedDate: string;
  bidCount?: number;
  aiAnalysis?: { complexityScore, estimatedDuration, riskFactors, materialsList };
}

// Theme System (NEW)
interface ThemeSettings {
  color: ThemeColor; // 12 options
  radius: BorderRadius; // 5 options
  density: InterfaceDensity; // 2 options
  font: AppFont; // 2 options
  fontSize: FontSize; // 3 options
  contrast: ContrastMode; // 2 options
  darkMode?: boolean;
  glassStrength?: 'low' | 'medium' | 'high' | 'opaque';
  texture: BackgroundPattern; // 15 options
  animationSpeed?: 'instant' | 'fast' | 'normal' | 'slow';
  soundEnabled?: boolean;
  hapticsEnabled?: boolean;
}
```

---

### AI Service Integration (geminiService.ts - 336 lines)

**9 AI Functions Available:**

```typescript
// 1. Analyze job from photos/video/audio
analyzeJobMultimodal(
  base64Images: string[],
  userNotes: string,
  base64Audio?: string,
  base64Videos?: string[],
  category?: string
): Promise<{ title, scope, materials, budget, complexity, duration, riskFactors }>

// 2. Score lead quality
scoreLeadQuality(description: string, imageCount: number): Promise<LeadScore>

// 3. Chat with AI business coach
chatWithCopilot(history: any[], newMessage: string, profile: UserProfile): Promise<string>

// 4. Get local market intelligence
getTerritoryMarketIntelligence(locationName: string, zipCode: string): Promise<{ text, sources }>

// 5. Generate daily briefing
generateDailyBriefing(profile: UserProfile, date: string, city: string): Promise<DailyBriefing>

// 6. Generate estimate line items
generateEstimate(description: string): Promise<EstimateItem[]>

// 7. Suggest competitive bid
generateBidSuggestion(job: Job): Promise<{ amount, rationale }>

// 8. Analyze call logs
analyzeCallLogsIntelligence(calls: CallLog[]): Promise<{ sentimentTrend, topIssues, followUpActions, revenueOpportunity }>

// 9. Analyze home health
analyzeHomeHealth(systems: any[]): Promise<{ predictions, overallHealthScore }>
```

**Models Used:**
- Voice: `gemini-2.5-flash-native-audio-preview-09-2025` (real-time audio)
- Vision: `gemini-3-flash-preview` (images + multimodal)
- Text: `gemini-3-flash-preview` (general) or `gemini-3-pro-preview` (advanced reasoning)

---

## Settings.tsx Enhancement (NEW)

**Advanced Theme Tab Added**

**Location:** `components/Settings.tsx` (now 626 lines)

**New Section: Advanced Theme**
- Entry point: Settings > "Advanced Theme" tab
- 7 customization panels:
  1. **Corner Radius** - 5 preset options with visual preview
  2. **UI Density** - Comfortable vs Compact
  3. **Font Family** - Sans Serif vs Monospace
  4. **Glass Effect Strength** - Low/Medium/High/Opaque
  5. **Animation Speed** - Instant/Fast/Normal/Slow
  6. **Dark Mode Toggle** - Full-screen dark mode
  7. **Live Preview** - Real-time theme visualization

**How it works:**
```typescript
// User clicks Advanced Theme tab
activeSection === 'ADVANCED_THEME' → Renders theme panel

// User adjusts setting
onClick={() => setThemeSettings({ ...themeSettings, radius: 'full' })}

// Theme updates globally via Layout.tsx className injection
<Layout themeSettings={themeSettings} />
```

**To add a new customization:**
1. Add new property to `ThemeSettings` interface in `types.ts`
2. Add control panel section in Settings.tsx ADVANCED_THEME block
3. Update `Layout.tsx` to apply new setting via CSS classes

---

## Common Development Tasks

### Add a New User Role

1. **Add to enum** (`types.ts`):
```typescript
export enum UserRole {
  // ...existing...
  NEW_ROLE = 'NEW_ROLE',
}
```

2. **Create dashboard** (`components/NewRoleDashboard.tsx`)

3. **Add routing** (`App.tsx`):
```typescript
if (profile.role === UserRole.NEW_ROLE)
  return <NewRoleDashboard />;
```

4. **Add nav items** (`App.tsx`, `roleNavConfig`):
```typescript
const specificNav = [
  { id: 'DASHBOARD', label: 'Home', visible: true },
  { id: 'NEW_FEATURE', label: 'Feature', visible: true },
];
```

---

### Add AI Analysis Feature

1. **Create function** in `geminiService.ts`:
```typescript
export const analyzeNewFeature = async (data: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze: ${JSON.stringify(data)}`,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error(error);
    return null;
  }
};
```

2. **Call in component**:
```typescript
const result = await analyzeNewFeature(data);
setAnalysisResult(result);
```

3. **Add error handling** - All AI functions should have try/catch + fallback

---

### Add New Theme Color

1. **Add to type** (`types.ts`):
```typescript
export type ThemeColor = 'blue' | 'emerald' | '...' | 'mycolor';
```

2. **Add to THEMES array** (`Settings.tsx`):
```typescript
{ id: 'mycolor', label: 'My Color', color: 'bg-mycolor-600', ring: 'ring-mycolor-600' },
```

3. **Add Tailwind class** (`index.html` or tailwind config)

---

## State Management Pattern

**Current:** useState in App.tsx (will need refactoring at scale)

**Flow:**
```
App.tsx (holds state)
  ├─ setProfile()
  ├─ setThemeSettings()
  ├─ setCurrentView()
  ├─ setUserJobs()
  └─ setCustomNavConfig()

  → passes down to Layout
    → passes down to individual components
      → components call setState via props
        → bubbles back up to App
```

**Why this works for MVP:**
- Simple, no external dependencies
- Easy to debug
- Works fine for <5KB state

**Why this breaks at scale:**
- Components become tightly coupled
- Prop drilling becomes annoying
- Hard to implement undo/redo
- Difficult to persist state

**Recommended refactor:**
```typescript
// Use Context + useReducer
const [state, dispatch] = useReducer(appReducer, initialState);
<AppContext.Provider value={state}>
  <DispatchContext.Provider value={dispatch}>
    {children}
  </DispatchContext.Provider>
</AppContext.Provider>
```

---

## Testing Guide

### Mock Data Location

**Jobs:** `components/JobMarketplace.tsx` line 13 (MOCK_JOBS)
**Contractors:** `components/JobMarketplace.tsx` line 22 (MOCK_PROS)
**Transactions:** `components/Wallet.tsx` line 10 (MOCK_TRANSACTIONS)

To test marketplace:
1. Switch user role to CONTRACTOR
2. Click "Lead Radar" (JobMarketplace)
3. Hover jobs, submit bids
4. Check "My Bids" to see submissions

### Testing New Theme

1. Go to Settings > Appearance
2. Click "Advanced Theme" tab
3. Try each customization option
4. Watch live preview update
5. Verify dark mode toggle works

---

## Performance Optimization Tips

1. **Image optimization** - JobPoster uploads large images
   - Compress before base64 encoding
   - Consider image resizing library

2. **Audio streaming** - EliteVoiceHub uses WebSocket
   - Monitor buffer sizes
   - Implement exponential backoff for reconnects

3. **Bundle size** - Current: ~500KB (estimated)
   - Check lucide-react icons used
   - Consider tree-shaking unused icons
   - Consider lazy loading dashboard components

4. **Re-renders** - Every state change re-renders App
   - Implement React.memo on heavy components
   - Use useMemo for expensive calculations

---

## Deployment Checklist

- [ ] Set `GEMINI_API_KEY` environment variable
- [ ] Test all AI features work with real API key
- [ ] Verify microphone/camera permissions work
- [ ] Run `npm run build` and test output
- [ ] Check production bundle size with `npm run preview`
- [ ] Test on mobile devices (Safari, Chrome)
- [ ] Verify dark mode works across all components
- [ ] Test all 8 theme presets
- [ ] Check network tab for unnecessary requests

---

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| Theme not applying | Verify `themeSettings` passed to Layout, check Tailwind class names |
| AI API 401 error | Check `GEMINI_API_KEY` env var is set in vite.config.ts |
| Bid not submitting | Check `JobMarketplace.tsx` handleSubmitBid, verify state updates |
| Dark mode not working | Verify `darkMode` property set in themeSettings |
| Component not rendering | Check View type in types.ts, verify case in App.tsx renderContent() |
| Microphone not working | Check browser permissions, verify EliteVoiceHub has permission request |

---

## Next Priorities for Development

### Immediate (This Sprint)
- [ ] Implement BidContract interface
- [ ] Add job completion workflow
- [ ] Add dispute resolution system
- [ ] Implement blind bidding

### Short-term (2-3 weeks)
- [ ] Refactor state to Context/useReducer
- [ ] Add contractor verification system
- [ ] Implement analytics tracking
- [ ] Create API service layer

### Medium-term (1-2 months)
- [ ] Add real backend API
- [ ] Implement authentication
- [ ] Add database (Firestore/Postgres)
- [ ] Multi-region deployment

---

## Resources & Documentation

- **Gemini API Docs:** https://ai.google.dev/
- **React 19 Docs:** https://react.dev/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs/
- **Lucide Icons:** https://lucide.dev/

**Project Docs:**
- `README.md` - Overview & features
- `PROJECT_SPEC.md` - Technical spec & architecture
- `SYSTEM_ANALYSIS_SUMMARY.md` - Detailed analysis & gaps
- `DEVELOPER_GUIDE.md` - This file

---

**Last Updated:** January 4, 2026
**Maintained By:** Claude Code
**Questions?** Check GitHub issues or project email

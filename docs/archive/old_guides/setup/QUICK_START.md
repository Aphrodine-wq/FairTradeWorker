# ⚡ Quick Start & Developer Reference

This guide provides technical details for developing, testing, and troubleshooting FairTradeWorker locally.

---

## 🛠️ Development Environment

### Core Commands

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start Backend** | `npx tsx backend/server.ts` | Runs Express API on port 3001 |
| **Start Frontend** | `npm run dev` | Runs Vite Dev Server on port 3000 |
| **Install Deps** | `npm install` | Installs both backend and frontend packages |
| **Lint** | `npm run lint` | Checks for code style issues |

### File Structure Key

*   **`src/`**: React Frontend
    *   `components/`: Reusable UI elements
    *   `hooks/`: Custom logic (useAuth, useJobs)
    *   `services/`: API clients (apiClient.ts, geminiService.ts)
    *   `types.ts`: Shared TypeScript interfaces
*   **`backend/`**: Node.js API
    *   `server.ts`: Entry point
    *   `services/`: Business logic (auth, jobs, payments)
    *   `data/`: **Local JSON Database** (stores users, jobs, etc.)
*   **`docs/`**: Documentation Library

---

## 🧪 Testing & Verification

### 1. Backend Health Check
Verify the API is running:
```bash
curl http://localhost:3001/health
# Response: {"status":"ok", ...}
```

### 2. Frontend Connection
Check the browser console (F12) for "API Connection Success" messages. If you see CORS errors, check that `CORS_ORIGIN` in `.env` matches your frontend URL.

### 3. AI Features (Mock Mode)
The app runs in **Mock Mode** by default if no `GEMINI_API_KEY` is provided.
*   **Test:** Go to "Job Analysis" or "Daily Briefing".
*   **Result:** You should see data appear instantly (simulated AI response).
*   **Debug:** Check terminal logs for "Mocking analyzeJobMultimodal..."

---

## 🐛 Troubleshooting

### Common Issues

**1. "Address already in use" (EADDRINUSE)**
*   **Cause:** A previous server instance is still running.
*   **Fix:**
    *   Find the PID: `netstat -ano | findstr :3001` (Windows) or `lsof -i :3001` (Mac/Linux)
    *   Kill it: `taskkill /PID <PID> /F` (Windows) or `kill -9 <PID>` (Mac/Linux)

**2. "Module not found: @/types"**
*   **Cause:** TypeScript path alias configuration issue.
*   **Fix:** Ensure `tsconfig.json` and `vite.config.ts` both have the correct alias mappings. (This was recently fixed).

**3. "useAuth must be used within AuthProvider"**
*   **Cause:** Component is rendered outside the Context Provider.
*   **Fix:** Ensure `index.tsx` wraps the App in `<AuthProvider>`. (This was recently fixed).

**4. "Database file corrupt or invalid JSON"**
*   **Cause:** The local JSON files in `backend/data/` might be malformed.
*   **Fix:** Delete the problematic `.json` file in `backend/data/`. The server will recreate it with an empty array on restart.

---

## 🔐 Credentials (Development)

**Test Accounts:**
*   **Homeowner:** `homeowner@example.com` / `password123`
*   **Contractor:** `contractor@example.com` / `password123`

*(Note: If these don't exist, just register a new account on the login screen. It works!)*

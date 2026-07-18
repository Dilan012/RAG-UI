# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Dev server: `npm run dev` (Vite)
- Typecheck + build: `npm run build` (`tsc -b && vite build`)
- Typecheck only: `npx tsc -b --noEmit`
- Lint: `npm run lint` (oxlint)
- Preview production build: `npm run preview`
- No test suite is configured yet.

## Environment

- `VITE_API_BASE_URL` — optional, base URL for the backend API. Defaults to `http://localhost:3000` (see `src/api/axios-client.ts`). The backend is the sibling `RAG/` project.

## Architecture

React 19 + Vite + TypeScript SPA, routed with `react-router-dom`, state managed with Redux Toolkit (`@reduxjs/toolkit` + `react-redux`), backend calls made through a shared `axios` instance. Talks to the `RAG/` Express backend, which wraps every response in `{ success: true, data }` / `{ success: false, error, code }` — see `RAG/CLAUDE.md`.

Request flow for any backend call: **page/component** → dispatches a **thunk** (via `useApiRequest`, not `dispatch` directly) → thunk calls an **api function** (`src/api/*.ts`) → api function calls `apiClient` (axios) → response unwrapped from the `{ success, data }` envelope → thunk updates the **slice** → component re-renders from `useAppSelector`.

## Folder structure

```
src/
  api/
    axios-client.ts       # shared axios instance: base URL, auth header injection, global error interceptor
    auth-api.ts            # authApi.signup / authApi.login
    chat-api.ts             # chatApi.sendMessage
  store/
    store.ts                # configureStore — one reducer key per feature slice
    hooks.ts                 # useAppDispatch, useAppSelector, useApiRequest
    extract-error-message.ts # shared axios-error -> string helper, used by every slice's thunks
    auth/
      auth-slice.ts          # user/token state, signup/login thunks, persists to localStorage
    chat/
      chat-slice.ts          # conversations/messages state, sendChatMessage thunk
  types/
    api.ts                   # ApiSuccessResponse<T> — mirrors the backend's success envelope
    auth.ts                  # AuthUser, AuthResponse, SignupPayload, LoginPayload
    chat.ts                  # ChatMessage, Conversation, ChatPayload, ChatReply, SendChatMessagePayload
  errors/
    error-codes.ts           # ERROR_CODES — mirrors RAG/src/errors/error-codes.ts (data only, no classes)
  pages/
    LoginPage.tsx / SignupPage.tsx / ChatPage.tsx / ServerErrorPage.tsx
  components/
    chat/                    # Sidebar, MessageThread, Composer — presentational, used only by ChatPage
    common/
      ProtectedRoute.tsx      # redirects to /login if no auth token
  utils/
    make-id.ts                # makeId() — client-side id generator for optimistic local entities
  App.tsx                    # route table only
  main.tsx                   # Provider(store) + BrowserRouter + App
```

## API layer (`src/api/`)

- `axios-client.ts` exports the one `apiClient` every api file uses — never call `axios` directly or create a second instance.
  - Request interceptor attaches `Authorization: Bearer <token>` from `localStorage` automatically.
  - Response interceptor: any error with no `response` (network/CORS failure) or `status >= 500` redirects the whole page to `/500` via `window.location.assign` (not `useNavigate` — the interceptor runs outside React, with no router context) and never resolves its promise, since the page is navigating away regardless. Everything else (400/401/409/...) is rejected normally so callers handle it.
- One file per backend resource (`auth-api.ts`, `chat-api.ts`), each exporting a plain object of functions. Every function: calls `apiClient`, types the response as `ApiSuccessResponse<T>`, and returns `res.data.data` — i.e. api functions already unwrap the envelope, so nothing above this layer ever sees `{ success, data }` directly.
- **When adding a new backend call**: add the payload/response types to the matching `types/<resource>.ts`, add a function to `api/<resource>-api.ts` following the exact shape above — don't call `apiClient` from a component or a slice's thunk body inline.

## Redux store (`src/store/`)

- One slice per feature/domain, in its own subfolder: `store/<feature>/<feature>-slice.ts`. `store.ts` wires every slice's reducer into `configureStore` under a matching key.
- **Async work is always a `createAsyncThunk`, never a plain action + manual `apiClient` call inside a component.** Thunk signature: `createAsyncThunk<Returned, Arg, { rejectValue: string }>('<feature>/<action>', async (arg, { rejectWithValue }) => { try { return await someApi.call(arg) } catch (error) { return rejectWithValue(extractErrorMessage(error, 'fallback message')) } })`.
- Always use the shared `extractErrorMessage` (`store/extract-error-message.ts`) inside a thunk's catch block — don't re-implement axios error unwrapping per-slice.
- `extraReducers` handles `.fulfilled`/`.rejected` for each thunk; synchronous state changes (e.g. selecting a conversation, logging out) are plain `reducers` on the slice.
- A thunk's original argument is available in `action.meta.arg` inside `extraReducers` — use it to know *which* entity a fulfilled/rejected result belongs to (see `chat-slice.ts`'s `sendChatMessage.fulfilled`/`.rejected`, which key off `action.meta.arg.conversationId`) instead of threading extra IDs through the payload.
- Persisted client state (e.g. auth token/user) reads/writes `localStorage` directly inside the slice file (`loadPersistedAuth`/`persistAuth`/`clearPersistedAuth` in `auth-slice.ts`), not in components.

### Calling a thunk from a component: use `useApiRequest`, not raw `dispatch`

`store/hooks.ts` exports `useApiRequest(thunk)` — this is the standard way a component triggers a thunk. It returns `{ send, loading, error }`:

```tsx
const { send, loading, error } = useApiRequest(login)
...
await send({ email, password })   // instead of dispatch(login({ email, password }))
```

- `send(arg)` dispatches the thunk and `.unwrap()`s it, so a rejection throws — wrap the call in `try { await send(...) } catch { /* error already in state */ }` when the caller doesn't need to react to the exception itself (see `LoginPage.tsx`, `ChatPage.tsx`).
- `loading`/`error` are local component state derived from the request, not redux state — don't duplicate them in a slice.
- Use raw `useAppDispatch()` only for **synchronous** slice actions (`dispatch(logout())`, `dispatch(conversationSelected(id))`, etc.) — never wrap a thunk in a plain `dispatch(...)` call outside `useApiRequest`.

## Error handling

- Backend error responses are `{ success: false, error: string, code: string }`. `extractErrorMessage` reads `error.response.data.error` for the human-readable message; `code` exists for future branching (e.g. showing a specific hint for `EMAIL_ALREADY_EXISTS`) but nothing consumes it yet.
- 5xx/network failures never reach a slice's `rejected` case — the axios interceptor intercepts them first and redirects to `/500` (see API layer above). Slices only ever see 4xx-class errors in their thunks' `catch`.
- `errors/error-codes.ts` must stay in sync with `RAG/src/errors/error-codes.ts` by hand — it's a data-only mirror (no shared package), so add to both when adding a new error code.

## Pages & components

- `pages/` — one file per route, wired in `App.tsx`'s `<Routes>`. A page owns its data (via `useAppSelector`/`useApiRequest`) and composes components; it's the only layer allowed to `dispatch`.
- `components/<feature>/` — presentational components scoped to the page(s) that use them (e.g. `components/chat/*` is only used by `ChatPage`). Props in, callbacks out — no `useAppSelector`/`useApiRequest` inside a component; the owning page passes everything down.
- `components/common/` — cross-feature components (currently just `ProtectedRoute`).
- Client-side-only entities (e.g. a new local conversation before the server knows about it) get an id from `utils/make-id.ts`, not `crypto.randomUUID()` or a new ad-hoc generator.

## Development practices

- **Interfaces/types over inline shapes**: every payload/response crossing the api layer has a named type in `types/`, imported wherever needed — no inline `{ ... }` object type literals for API data.
- **No component ever imports `apiClient` or an `api/*.ts` function directly** — components only see thunks (via `useApiRequest`) and slice state (via `useAppSelector`). This is what keeps `ChatPage`/`LoginPage`/`SignupPage` free of axios-specific error handling.
- **Don't add a new axios instance, a new error-handling approach, or a new hand-rolled loading/error `useState` pair for an API call** — `apiClient` + `useApiRequest` already cover it; follow the existing pattern instead of introducing a parallel one.

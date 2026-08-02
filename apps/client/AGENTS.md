# AGENTS.md

This file provides guidance to agents coding when working with code in this app.

This is `apps/client` (`@jw-tracker/client`), the Expo Router mobile/web app in the `jw-service-tracker` pnpm monorepo. Root-level rules that also apply here live in `/Users/franco/projects/jw-service-tracker/AGENTS.md` (symlinked as `CLAUDE.md`) — exact dependency versions (`-E`), always use `luxon` for dates, and read `apps/api/openapi.json` before touching backend-related contracts.

## Commands

Run from `apps/client/` (or via `pnpm --filter @jw-tracker/client <script>` from the repo root):

- `pnpm start` — `expo start -c` (dev server, cache cleared)
- `pnpm lint` — `eslint . --fix`
- `pnpm prettier` — `prettier --write .`
- `pnpm build` — web export (`expo export --platform web`), output copied into `dist/app`
- `pnpm android` — `expo run:android` (emulator/dev)
- `pnpm ios` — `expo run:ios --device` (dev, physical device)
- `pnpm android:release` — Release build installed on a USB-connected Android device
- `pnpm ios:release` — Release build installed on "iPhone de Franco" (physical device)
- `pnpm apk` — builds `@jw-tracker/shared` first, then produces a standalone release APK at `android/app/build/outputs/apk/release/app-release.apk`
- `pnpm xcode` — prebuilds iOS and opens the Xcode workspace

There is no test suite/script in this app currently — don't invent one.

Full deployment/CI details: `docs/deployment.md`. CI/CD (GitHub Releases) fires automatically when a `v*` branch PR merges into `main`.

### Environment

Requires `EXPO_PUBLIC_API_URL` (see `.env.example`) pointing at the `apps/api` backend.

## Architecture

### Routing vs. app code split

Navigation lives under `app/` (Expo Router, file-based):
- `app/_layout.tsx` — root layout; wraps everything in `SafeAreaProvider` + `AuthProvider`, renders a `Slot`.
- `app/(auth)/` — `login.tsx`, `register.tsx`, unauthenticated routes.
- `app/(app)/_layout.tsx` — gate: redirects to `/login` if no `user`, otherwise wraps children in `DashboardProvider` and renders the bottom `Tabs` (Inicio/Historial/Perfil) plus the always-mounted `EntryDialog` and `ConfirmDeleteDialog` modals.
- `app/(app)/home.tsx`, `history.tsx`, `account.tsx` — tab screens.

All actual logic (providers, services, storage, feature components) lives in `src/`, imported by the thin route files. `src/App.tsx` is a legacy/unused root component — the real entry point is `index.js` → `expo-router/entry`.

### Providers as the state layer

There is no external state library. Two React Context providers hold effectively all app state:
- `src/features/auth/AuthProvider.tsx` — session bootstrap (refresh-token based), login/logout, exposes `useAuth()`.
- `src/features/dashboard/DashboardProvider.tsx` — all dashboard state: entries, monthly stats, pagination, month navigation, the add/edit entry form, settings modal, delete confirmation, and clipboard/share export. Exposes `useDashboard()`. This file is intentionally large/monolithic — when editing it, keep changes scoped rather than trying to split it up unprompted.

### Offline-first data flow

This is the most important architectural pattern in the app — most bugs and most feature work touch it:

1. `src/services/baseApi.ts` (`BaseService`) — shared fetch wrapper (auth header injection, `NetworkError` on fetch failure, non-2xx → thrown `Error`). All `*Api` classes (`AuthApi`, `EntriesApi`, `UserApi`, `ReleasesApi`) extend it.
2. `src/storage/offlineStorage.ts`:
   - `StorageDriver` — low-level key/value store. Uses `expo-secure-store` on native, `localStorage` on web (`Platform.OS === 'web'`), and falls back to an in-memory cache if the native module is unavailable. Maintains its own keys index since SecureStore has no `getAllKeys`.
   - `OfflineStorage` — caches the user profile and per-`(monthOffset, page)` dashboard data (entries/stats/total) on top of `StorageDriver`.
3. `src/services/offlineSync.ts` (`OfflineSyncService`) — detects online/offline (`NetInfo` on native, `navigator.onLine` on web) and maintains a mutation queue (`CREATE_ENTRY`/`UPDATE_ENTRY`/`DELETE_ENTRY`/`UPDATE_SETTINGS`) in `StorageDriver`. Queueing coalesces redundant mutations (e.g. an `UPDATE_ENTRY` against a not-yet-synced `temp_*` entry gets merged into its pending `CREATE_ENTRY`). `syncOfflineRequests()` refreshes the auth token, batch-creates queued entries via `EntriesApi.createMany`, replays the rest individually, and remaps `temp_*` IDs to server IDs (including inside the cache) as creates succeed.
4. `DashboardProvider` calls `OfflineSyncService.isOffline()` before every mutation: if offline, it applies an optimistic local update (including synthesizing `temp_*` entries) and queues the mutation instead of calling the API directly. A `NetInfo` listener triggers `syncOfflineRequests()` + a data refetch automatically when connectivity is restored.

When adding a new mutating action, follow this same three-step shape: try the API call, on `NetworkError` fall back to an optimistic local update + `OfflineSyncService.queueMutation(...)`, and keep `OfflineStorage`'s cache in sync with whatever you show in the UI.

### Cross-workspace packages

- `@jw-tracker/shared` (`packages/shared`) — DTOs, domain interfaces (`Entry`, `User`, `OfflineMutation`, etc.), enums (`SessionType`, `PreacherType`), date helpers (`getCurrentIsoDate`, `isoDateToMillis`, `millisToIsoDate`), and the `phone.schema` validator. Import types/DTOs from here rather than redefining them; this must stay a source of truth shared with `apps/api`.
- `@jw-tracker/ui` (`packages/ui`) — currently just exports Tailwind/NativeWind design tokens (`tokens.ts`), consumed as `require('@jw-tracker/ui/preset')` in `tailwind.config.js`.

### Styling

NativeWind (Tailwind for React Native) with `darkMode: 'class'`. The color palette is a fixed set of semantic tokens (`background`, `foreground`, `card`, `card-foreground`, `primary`, `primary-foreground`, `muted`, `muted-foreground`, `border`) defined in `tailwind.config.js` and documented in `/Users/franco/projects/jw-service-tracker/docs/style-manifest.md`. That manifest is binding: never use raw/generic Tailwind colors (`bg-gray-100`, `bg-blue-500`, `bg-white`, etc.) — always use the semantic token classes. It also specifies border-radius conventions (`rounded-2xl`/`rounded-3xl` for cards/modals, `rounded-xl`/`rounded-2xl` for buttons/inputs, `rounded-full` for badges/circular icons) and requires interactive `Pressable`s to have an active-state style (e.g. `active:bg-primary/90`).

### Platform branching

Several modules branch on `Platform.OS === 'web'` for things native-only APIs don't support on web: storage (`expo-secure-store` vs `localStorage`), connectivity detection (`NetInfo` vs `navigator.onLine`), and error dialogs (`Alert.alert` vs `window.alert`). Follow this pattern rather than assuming one platform.

### Localization / copy

All user-facing strings are in Spanish (Peru/Lima locale conventions — e.g. `DateTime.now().setZone('America/Lima')` in the export-report flow of `DashboardProvider`). Keep new UI copy in Spanish.

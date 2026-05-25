# AGENTS.md — react-native-clean-initial (Cashi)

## Stack
- **Framework:** React Native 0.81.5 + Expo SDK 54
- **Router:** Expo Router (file-based routing under `app/`)
- **Language:** TypeScript strict, path alias `@/*` → root `./*`
- **Package manager:** Yarn v1 (do NOT use npm)
- **Entrypoint:** `expo-router/entry` (defined in `package.json` `main`)
- **Validation:** Zod v4 (`import * as z from 'zod'`)
- **Persistence:** `@react-native-async-storage/async-storage` (no backend)
- **UUIDs:** `expo-crypto` `Crypto.randomUUID()`

## Commands
```sh
yarn start          # expo start
yarn android        # expo run:android
yarn ios            # expo run:ios
yarn web            # expo start --web
yarn lint           # expo lint (ESLint flat config)
```
No test runner or typecheck script configured.

## Architecture
- **`app/_layout.tsx`** — Root Stack: `index` (login) → `(tabs)`
- **`app/(tabs)/_layout.tsx`** — Bottom tabs: Balance, Categorías, Transacciones, Perfil
- Each tab has its own `_layout.tsx` with a Stack for `index`, `create`, `[id]` (edit)
- Dynamic route screens (`categories/[id]`, `transactions/[id]`) must be registered with `href: null` in their tab layout to prevent showing as tabs
- **Login:** hardcoded credentials `admin@cashi.com` / `123456` in `hooks/useLogin.ts`
- **Hooks:** `useCategories`, `useTransactions`, `useCategoryForm`, `useTransactionForm`, `useLogin`
- **Types** in `types/`, **schemas** in `schemas/`

## Gotchas
- Always use `yarn add` (not `npm install`). The lockfile is `yarn.lock`.
- Zod v4 uses `result.error.issues` (not `.errors`) — current schemas use `result.error.flatten()`.
- No test framework is installed. Do not add tests without asking.
- `StyleSheet.create()` must be **outside** the component function.
- `SafeAreaView` + `KeyboardAvoidingView` are required on form screens for notch/keyboard.
- Dynamic route navigation may need `as any` to bypass Expo Router's strict route types.
- Use `useFocusEffect` (empty deps `[]`) to reload data when screen gains focus.
- `expo-env.d.ts` is gitignored (auto-generated).
- `.history/` folder exists locally — not part of the source.

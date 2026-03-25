# picklehub-web

PickleHub for Web.

## Tech Stack

- Framework: Next.js 16 (App Router)
- Language: TypeScript 5
- UI: React 19
- Styling: Tailwind CSS 4
- Components: shadcn/ui, Radix UI, Base UI
- State Management: Jotai
- Data Fetching and Caching: TanStack Query
- Forms and Validation: React Hook Form, Zod
- HTTP Client: Axios
- Authentication: Google OAuth, magic link flow, iron-session
- Charts and Visualization: Recharts
- Notifications: Sonner
- Tooling: ESLint, Prettier, Husky, lint-staged
- Package Manager: pnpm

## Project Structure

```text
.
|-- public/                      # Static assets
|-- src/
|   |-- app/                     # Next.js App Router pages and route groups
|   |   |-- (auth)/              # Authentication routes (login, register, verify-email)
|   |   |-- (protected)/         # Protected app routes (groups, settings, set-password)
|   |   `-- invitation/          # Invitation acceptance flow
|   |-- components/              # Shared app components
|   |   |-- providers.tsx        # App-level providers
|   |   `-- ui/                  # Reusable UI primitives
|   |-- config/                  # App configuration
|   |-- features/                # Feature-first modules
|   |   |-- auth/                # Auth actions, api, schemas, store, types, components
|   |   `-- groups/              # Groups domain modules
|   |-- hooks/                   # Shared React hooks
|   |-- lib/                     # Utilities, API clients, session helpers
|   |-- styles/                  # Global styles
|   `-- proxy.ts                 # Proxy/server-related setup
|-- components.json              # shadcn/ui configuration
|-- next.config.ts               # Next.js configuration
|-- tsconfig.json                # TypeScript configuration
`-- README.md
```

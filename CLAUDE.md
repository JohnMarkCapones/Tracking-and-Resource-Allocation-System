# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is the **ToolSync** project - a Tracking and Resource Allocation System. The main application code lives in the `ToolSync/` subdirectory.

```
Tracking-and-Resource-Allocation-System/
├── docs/                    # Project documentation (Contributing Guidelines)
├── README.md                # Repository overview
└── ToolSync/                # Laravel 12 + React 19 application
```

## Tech Stack

- **Backend**: Laravel 12 (PHP 8.2+) with Inertia.js v2
- **Frontend**: React 19 with TypeScript, Tailwind CSS 4, Vite 7
- **Routing**: Laravel Wayfinder for type-safe route generation
- **Testing**: Pest 4 (PHP testing framework)
- **Database**: MySQL (`tracking_resource_system`)

## Development Commands

All commands should be run from the `ToolSync/` directory.

### Initial Setup
```bash
cd ToolSync
composer run setup    # Installs deps, creates .env, runs migrations, builds assets
```

### Development Server
```bash
composer run dev      # Runs Laravel server + queue worker + Vite dev server concurrently
```

### Testing
```bash
php artisan test                              # Run all tests
php artisan test --compact                    # Compact output
php artisan test --compact --filter=TestName  # Run specific test
```

### Backend API Testing (REST)

This project uses Inertia for the main app, but it also includes REST endpoints in `ToolSync/routes/api.php`.

- API base path: `/api` (example: `http://127.0.0.1:8000/api/tools`)
- Run the backend: `composer run dev` (or `php artisan serve`)
- List API routes: `php artisan route:list --path=api`

#### Quick manual checks (Windows-friendly)

PowerShell (`Invoke-RestMethod` / `irm`):

```powershell
irm http://127.0.0.1:8000/api/tool-categories

irm -Method Post `
  -Uri http://127.0.0.1:8000/api/tool-categories `
  -ContentType application/json `
  -Body (@{ name = "IT Equipment" } | ConvertTo-Json)
```

If you prefer curl on Windows, use `curl.exe` (PowerShell aliases `curl`):

```bash
curl.exe http://127.0.0.1:8000/api/tools
```

#### Authenticated endpoint (`/api/user`)

`GET /api/user` is protected by Sanctum (`auth:sanctum`). For quick local testing you can create a token:

```bash
php artisan tinker
```

```php
$user = \App\Models\User::factory()->create();
$token = $user->createToken('dev')->plainTextToken;
```

Then call:

```bash
curl.exe http://127.0.0.1:8000/api/user -H "Authorization: Bearer <token>"
```

#### Pest patterns for API endpoints

Use `getJson/postJson/putJson/deleteJson` in Feature tests:

```php
$this->getJson('/api/tools')
    ->assertOk()
    ->assertJsonStructure(['data']);
```

### Code Formatting
```bash
composer lint         # Format PHP with Pint
npm run lint          # Fix JS/TS with ESLint
npm run format        # Format JS/TS/CSS with Prettier
npm run types         # TypeScript type checking
```

### Build
```bash
npm run build         # Production build
npm run build:ssr     # SSR build
```

## Architecture

### Inertia.js Integration
This is a server-side routed SPA using Inertia.js:
- Controllers return `Inertia::render('PageName', $props)` instead of Blade views
- React pages receive props directly from PHP - no REST API needed
- Pages live in `resources/js/pages/`

### Wayfinder Type-Safe Routes
Laravel routes are available as TypeScript functions:
- Import controllers: `import StorePost from '@/actions/.../StorePostController'`
- Import named routes: `import { show } from '@/routes/...'`
- Use with Inertia forms: `form.submit(store())`
- Regenerate: `php artisan wayfinder:generate`

### Project Structure (ToolSync/)
```
app/
├── Http/Controllers/     # Inertia page controllers
├── Models/               # Eloquent models
resources/
├── js/
│   ├── pages/           # React page components
│   ├── actions/         # Generated Wayfinder controller routes
│   ├── routes/          # Generated Wayfinder named routes
│   └── lib/             # Utilities
routes/
├── web.php              # Web routes
bootstrap/
├── app.php              # Middleware, exceptions, routing config
├── providers.php        # Service providers
database/
├── migrations/          # Schema changes
├── factories/           # Model factories for testing
tests/
├── Feature/             # Integration tests
├── Unit/                # Unit tests
```

## Key Conventions

### Git Workflow
- Uses Git Flow: `develop` -> `staging` -> `main`
- Branch naming: `<type>/<ticket-id>-<description>` (e.g., `feature/CF-123-user-auth`)
- Conventional Commits format (see `docs/Contributing Guidelines`)

### PHP
- Use constructor property promotion
- Always use explicit return types and parameter type hints
- Run `vendor/bin/pint --dirty` before committing
- Create Form Request classes for validation (not inline)
- Use `Model::query()` instead of `DB::`

### Frontend
- TypeScript required
- Tailwind CSS for styling (classes sorted by Prettier plugin)
- Check existing components before creating new ones

### Testing
- Most tests should be Feature tests (`php artisan make:test --pest {name}`)
- Use model factories for test data
- Run tests with `php artisan test --compact`

## CI/CD

GitHub Actions run on PR to develop/main:
- **lint.yml**: PHP Pint, Prettier, ESLint
- **tests.yml**: Pest tests on PHP 8.4 and 8.5

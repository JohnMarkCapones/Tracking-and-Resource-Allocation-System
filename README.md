# ToolSync

A Tracking and Resource Allocation System built with Laravel and React.

## Tech Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Build Tool**: Vite 7
- **Database**: MySQL
- **Testing**: Pest 4

## Prerequisites

- PHP 8.2 or higher (8.3+ recommended for lock file)
- Composer
- Node.js 22+
- MySQL

**PHP extensions required:** `openssl`, `mbstring`, `fileinfo`, `pdo_mysql` (enable in `php.ini` if you get "undefined function mb_split" or "openssl required").

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/JohnMarkCapones/Tracking-and-Resource-Allocation-System.git
   cd Tracking-and-Resource-Allocation-System/ToolSync
   ```

2. Run the setup command:
   ```bash
   composer run setup
   ```

   This will:
   - Install PHP dependencies
   - Create `.env` file from `.env.example`
   - Generate application key
   - Run database migrations
   - Install Node dependencies
   - Build frontend assets

3. Configure your database password in `.env`:
   ```env
   DB_PASSWORD=your_password
   ```

4. Run migrations:
   ```bash
   php artisan migrate
   ```

## Development

Start the development server:
```bash
composer run dev
```

This runs the Laravel server, queue worker, and Vite dev server concurrently.

## Testing

```bash
php artisan test
```

## Testing the API

Start the dev server (from the `ToolSync` folder):

```bash
cd ToolSync
composer run dev
```

The API runs at `http://127.0.0.1:9000`. Test the Tool CRUD with:

**List all tools**
```bash
curl http://127.0.0.1:9000/api/tools
```

**Get one tool**
```bash
curl http://127.0.0.1:9000/api/tools/1
```

**Create a tool**
```bash
curl -X POST http://127.0.0.1:9000/api/tools \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Tool\",\"description\":\"A test\",\"category_id\":1,\"quantity\":1}"
```

**Update a tool**
```bash
curl -X PUT http://127.0.0.1:9000/api/tools/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Updated Name\",\"description\":\"Updated\",\"category_id\":1,\"quantity\":2}"
```

**Delete a tool**
```bash
curl -X DELETE http://127.0.0.1:9000/api/tools/1
```

**Filter tools** (by category or search)
```bash
curl "http://127.0.0.1:9000/api/tools?category_id=1"
curl "http://127.0.0.1:9000/api/tools?search=Laptop"
```

**Tool Allocations (borrow/return)** — `GET/POST /api/tool-allocations`, `GET/PUT/PATCH/DELETE /api/tool-allocations/{id}`. List with `?tool_id=1`, `?user_id=1`, or `?status=BORROWED`. Create with JSON: `tool_id`, `user_id`, `borrow_date`, `expected_return_date`, optional `note`.

On Windows PowerShell, use `Invoke-RestMethod` or escape the JSON (e.g. `\"name\":\"Test\"`). You can also use the Scribe API docs at `http://127.0.0.1:9000/docs` after generating them with `php artisan scribe:generate`.

## Code Quality

```bash
composer lint         # Format PHP
npm run lint          # Fix JS/TS
npm run format        # Format with Prettier
npm run types         # TypeScript check
```

## Contributing

Please read the [Contributing Guidelines](docs/Contributing%20Guidelines) before submitting pull requests.

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

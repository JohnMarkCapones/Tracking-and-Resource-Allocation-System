# ToolSync

A Tracking and Resource Allocation System built with Laravel and React.

## Tech Stack

- **Backend**: Laravel 12, PHP 8.2+
- **Frontend**: React 19, TypeScript, Tailwind CSS 4
- **Build Tool**: Vite 7
- **Database**: MySQL
- **Testing**: Pest 4

## Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js 22+
- MySQL

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

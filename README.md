# HujesisAI - AI Image Generation Platform

A full-stack AI image generation platform built with Next.js, Express.js, TypeScript, and PostgreSQL.

![HujesisAI](https://via.placeholder.com/800x400?text=HujesisAI)

## Features

- 🎨 **AI Image Generation** - Generate stunning images using AI prompts
- 💡 **Prompt Helper** - Intelligent suggestions for crafting perfect prompts
- 📚 **Prompts Library** - Save, organize, and manage your prompts
- 🖼️ **Image Gallery** - Browse and manage your generated images
- ⭐ **Favorites** - Mark your favorite prompts and images
- 🔐 **Authentication** - Secure JWT-based authentication
- 📱 **Responsive Design** - Beautiful UI that works on all devices

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS
- **Headless UI** - Accessible UI components
- **Phosphor Icons** - Beautiful icon library
- **React Hook Form** - Form handling
- **Yup** - Schema validation

### Backend
- **Express.js** - Fast, minimalist web framework
- **TypeScript** - Type-safe server code
- **TypeORM** - Database ORM
- **PostgreSQL** - Relational database
- **Redis** - Caching (optional)
- **JWT** - Authentication tokens
- **Winston** - Logging

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis (optional)
- Docker & Docker Compose (for containerized deployment)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/hujesis-ai.git
cd hujesis-ai
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Environment Variables

#### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=hujesis_ai

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Redis (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=http://localhost:3000
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Project Structure

```
hujesis-ai/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middleware/     # Express middleware
│   │   ├── modules/        # Feature modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── users/      # User management
│   │   │   ├── prompts/    # Prompts CRUD
│   │   │   └── images/     # Image generation
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Base UI components
│   │   │   └── layout/     # Layout components
│   │   ├── context/        # React Context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API service layer
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/dashboard` - Get dashboard stats

### Prompts
- `GET /api/prompts` - List prompts
- `POST /api/prompts` - Create prompt
- `GET /api/prompts/:id` - Get prompt
- `PUT /api/prompts/:id` - Update prompt
- `DELETE /api/prompts/:id` - Delete prompt
- `POST /api/prompts/:id/favorite` - Toggle favorite
- `POST /api/prompts/:id/duplicate` - Duplicate prompt

### Images
- `GET /api/images` - List images
- `POST /api/images/generate` - Generate image
- `GET /api/images/:id` - Get image
- `DELETE /api/images/:id` - Delete image
- `POST /api/images/:id/favorite` - Toggle favorite

## Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Linting
```bash
# Backend
cd backend && npm run lint

# Frontend
cd frontend && npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Express.js](https://expressjs.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Headless UI](https://headlessui.com/)
- [Phosphor Icons](https://phosphoricons.com/)



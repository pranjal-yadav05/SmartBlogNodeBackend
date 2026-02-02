<p align="center">
  <img src="./repo_logo/repo_logo.png" alt="SmartBlogNodeBackend Logo" width="800" style="border-radius: 50px;"/>
</p>


This is the Node.js/Express implementation of the SmartBlog backend, providing the same API as the Spring Boot version. It's designed to work with the same frontend and database without any changes.

## Features

- 🔐 JWT Authentication
- 🔑 Google OAuth2 Login
- 📝 Blog Posts with CRUD Operations
- 📋 Drafts Management
- 💬 Comments System
- 👏 Claps/Likes
- 📧 Email Service (Welcome, Subscription, Newsletter)
- 📰 Weekly Newsletter Scheduler
- 🖼️ Cloudinary Image Upload
- 🤖 AI-Powered Article Suggestions (OpenRouter)
- 📊 Pagination and Search

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MySQL (Sequelize ORM)
- **Authentication**: JWT + Passport.js (Google OAuth)
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer (Gmail SMTP)
- **AI**: OpenRouter API
- **Scheduler**: node-cron

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL Database (same as Spring Boot backend)

### Installation

1. Clone the repository:
   ```bash
   cd SmartBlogNodeBackend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env` (or update the existing `.env`)
   - Update the values as needed

4. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

5. The server will start on `http://localhost:8080`

## API Endpoints

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user |
| POST | `/login` | No | Login user |
| GET | `/profile` | Yes | Get user profile |
| PUT | `/profile` | Yes | Update profile |
| GET | `/` | No | Search users |
| GET | `/search` | No | Paginated search |
| GET | `/by-initial/:initial` | No | Users by initial |

### Blog Posts (`/api/posts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Get all posts |
| GET | `/paginated` | No | Paginated posts |
| GET | `/:id` | No | Get post by ID |
| GET | `/category/:category` | No | Posts by category |
| GET | `/categories/counts` | No | Category counts |
| GET | `/user/:email/paginated` | No | User's posts |
| POST | `/create` | No | Create post |
| PUT | `/:id` | Yes | Update post |
| DELETE | `/:id` | Yes | Delete post |
| POST | `/:id/view` | No | Increment views |
| POST | `/:id/claps` | No | Increment claps |
| GET | `/:id/comments` | No | Get comments |
| POST | `/:id/comments` | Yes | Add comment |
| POST | `/suggestions` | No | AI suggestions |

### Drafts (`/api/posts/drafts`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/user/:email` | No | Get user's drafts |
| GET | `/:id` | Yes | Get draft |
| POST | `/:id/publish` | Yes | Publish draft |
| PUT | `/:id` | Yes | Update draft |
| DELETE | `/:id` | Yes | Delete draft |

### Newsletter (`/api/newsletter`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/subscribe?email=` | Subscribe |
| POST | `/unsubscribe?email=` | Unsubscribe |
| POST | `/send-test-newsletter` | Send test |

### Contact (`/api`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/contact` | Submit contact form |

### OAuth

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/oauth2/authorization/google` | Start OAuth |
| GET | `/api/oauth2/success` | OAuth success |
| GET | `/api/oauth2/failure` | OAuth failure |

## Environment Variables

```env
PORT=8080
DATABASE_HOST=your-mysql-host
DATABASE_PORT=3306
DATABASE_NAME=your-database
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8080
CLOUDINARY_URL=cloudinary://...
EMAIL=your-email@gmail.com
APP_PASSWORD=your-gmail-app-password
OPENROUTER_API_KEY=your-openrouter-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SESSION_SECRET=your-session-secret
```

## Docker

```bash
# Build image
docker build -t smartblog-node-backend .

# Run container
docker run -p 8080:8080 --env-file .env smartblog-node-backend
```

## License

MIT

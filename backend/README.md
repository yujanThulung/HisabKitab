# Backend API - Hisab Kitab

##  Deployment to Vercel

### Prerequisites
- Vercel account
- MongoDB database (MongoDB Atlas recommended)
- Cloudinary account for image uploads

### Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Build the project**:
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Set Environment Variables in Vercel Dashboard**:
   - Go to your project settings on Vercel
   - Add the following environment variables:
     - `MONGO_URI` - Your MongoDB connection string
     - `JWT_ACCESS_SECRET` - Secret for access tokens
     - `JWT_REFRESH_SECRET` - Secret for refresh tokens
     - `CLIENT_URL` - Your frontend URL
     - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
     - `CLOUDINARY_API_KEY` - Cloudinary API key
     - `CLOUDINARY_API_SECRET` - Cloudinary API secret
     - `NODE_ENV` - Set to `production`

5. **Redeploy** after setting environment variables:
   ```bash
   vercel --prod
   ```

##  Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file** with required variables (see `.env.example`)

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Expenses
- `POST /api/expanse/create` - Create expense (requires auth + image)
- `GET /api/expanse` - Get all expenses (requires auth, supports pagination & date filtering)
- `PUT /api/expanse/update/:id` - Update expense (requires auth + ownership)
- `DELETE /api/expanse/delete/:id` - Delete expense (requires auth + ownership)

### Query Parameters for GET /api/expanse
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `from` - Start date filter (optional)
- `to` - End date filter (optional)

## 🔒 Security Features
- JWT-based authentication with access + refresh tokens
- Refresh tokens are hashed before storage
- httpOnly cookies for refresh tokens
- Authorization checks for resource ownership
- Input validation with Zod
- bcrypt password hashing (salt rounds: 12)
- Timing attack mitigation in login

## 📦 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **File Upload**: Multer + Cloudinary
- **Deployment**: Vercel

## 🐛 Troubleshooting

### Build fails on Vercel
- Make sure all dependencies are in `dependencies`, not `devDependencies`
- Ensure `dist/` folder is committed to git
- Check that all environment variables are set

### MongoDB connection issues
- Whitelist Vercel IP addresses in MongoDB Atlas (or allow all: 0.0.0.0/0)
- Verify `MONGO_URI` is correct and includes database name

### CORS issues
- Set `CLIENT_URL` environment variable to your frontend domain
- Check CORS configuration in `server.ts`

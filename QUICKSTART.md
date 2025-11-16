# Quick Start Guide - Alancarmo Corretor Angular App

## Prerequisites
- Node.js 20+ and npm
- Git

## Installation & Running

### 1. Install Dependencies
```bash
# Install root dependencies (Express server)
npm install

# Install Angular dependencies
cd frontend
npm install
cd ..
```

### 2. Build & Run Production

```bash
# Build Angular and start server (single command)
npm start
```

The app will be available at: **http://localhost:3000**

### 3. Development Mode

For development with hot reload:

#### Terminal 1 - Start Backend Server
```bash
npm run dev
```

#### Terminal 2 - Start Angular Dev Server
```bash
npm run dev:angular
```

- Backend API: **http://localhost:3000**
- Angular Dev: **http://localhost:4200** (with proxy to backend)

## Project Structure

```
sanpaa/
├── frontend/          # Angular application
│   ├── src/app/       # Application code
│   └── dist/          # Build output (generated)
├── data/              # JSON database
├── uploads/           # Uploaded images
├── server.js          # Express API server
└── package.json       # Project scripts
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Build Angular + start production server |
| `npm run dev` | Start backend API server only |
| `npm run dev:angular` | Start Angular dev server with hot reload |
| `npm run build` | Build Angular app |
| `npm run build:prod` | Build Angular for production |

## Features

### Completed ✅
- Home page with property listings
- Responsive header with mobile menu
- Footer with contact information
- Property cards with WhatsApp integration
- API services (Property, AI, Auth)
- TypeScript models and interfaces
- Client-side routing

### Legacy Access
- Old admin panel: **http://localhost:3000/admin-legacy**

## API Endpoints

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get single property
- `POST /api/properties` - Create property (auth required)
- `PUT /api/properties/:id` - Update property (auth required)
- `DELETE /api/properties/:id` - Delete property (auth required)

### AI
- `POST /api/ai/suggest` - Get AI suggestions for property data

### Upload
- `POST /api/upload` - Upload property images

### Auth
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

## Default Admin Credentials
- **Username**: admin
- **Password**: admin123
- ⚠️ **IMPORTANT**: Change these in production!

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Server won't start
```bash
# Check if dependencies are installed
npm install

# Check if port 3000 is available
lsof -i :3000

# Kill process if needed
kill -9 $(lsof -t -i :3000)
```

### Angular dev server issues
```bash
# Clear Angular cache
cd frontend
rm -rf .angular/cache
ng serve --proxy-config proxy.conf.json
```

## Next Steps

1. **Add Properties**: Use the legacy admin panel to add properties
2. **Customize**: Update contact information in components
3. **Deploy**: Follow deployment guide in README_ANGULAR.md
4. **Extend**: Add more features as needed

## Documentation

- **README_ANGULAR.md**: Full documentation
- **MIGRATION_SUMMARY.md**: Migration details and metrics

## Support

For issues or questions:
- Check documentation files
- Review code comments
- Contact: contato@alancarmocorretor.com.br

---

**Version**: 2.0.0 (Angular)
**Last Updated**: November 2024

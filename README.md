# Appointment Booking System

A full-stack appointment booking application for a small clinic built with modern web technologies.

<img width="1898" height="965" alt="Image" src="https://github.com/user-attachments/assets/c38679b6-431c-4235-9d67-596b4802b038" />

<img width="1887" height="958" alt="Image" src="https://github.com/user-attachments/assets/d235a980-423b-4075-80f4-9deabf1fda13" />

<img width="1902" height="959" alt="Image" src="https://github.com/user-attachments/assets/7a797aa2-ad43-4094-b677-262af50a6de0" />

<img width="1904" height="950" alt="Image" src="https://github.com/user-attachments/assets/600d12de-059b-42f8-8291-fa59022be41d" />

## Tech Stack

- **Frontend**: React + Vite, Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT with role-based access control
- **Deployment**: Vercel (Frontend) + Render (Backend)

### Trade-offs

- **MongoDB Atlas**: Chosen for its free tier and ease of setup, though PostgreSQL would be better for relational data like bookings
- **JWT Authentication**: Simple to implement but requires careful token management
- **Vite**: Faster development experience compared to Create React App

## Live URLs

- Frontend URL: [To be deployed]
- API URL: [To be deployed]

## Submission Checklist

- [ ] Frontend URL: _______
- [ ] API URL: _______
- [ ] Patient: patient@example.com / Passw0rd!
- [ ] Admin: admin@example.com / Passw0rd!
- [ ] Repo URL: _______
- [ ] Run locally: README steps verified
- [ ] Postman/curl steps included
- [ ] Notes on trade-offs & next steps

## Test Credentials

- **Patient**: patient@example.com / Passw0rd!
- **Admin**: admin@example.com / Passw0rd!

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

- `POST /api/register` - Register new patient
- `POST /api/login` - Login user
- `GET /api/slots` - Get available slots
- `POST /api/book` - Book a slot
- `GET /api/my-bookings` - Get user's bookings (patient only)
- `GET /api/all-bookings` - Get all bookings (admin only)

## Architecture Notes

### Folder Structure
```
├── backend/          # Express.js API server
│   ├── controllers/  # Route handlers
│   ├── middleware/   # Auth and validation middleware
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   └── utils/        # Helper functions
└── frontend/         # React + Vite application
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Page components
    │   ├── hooks/       # Custom React hooks
    │   ├── context/     # React context for auth
    │   └── utils/       # Helper functions
```

### Authentication & RBAC
- JWT tokens stored in localStorage
- Role-based middleware for protected routes
- Admin and patient roles with different permissions

### Concurrency & Atomicity
- MongoDB unique indexes prevent double booking
- Atomic operations ensure data consistency

### Error Handling
- Centralized error handling middleware
- Consistent error response format
- Client-side error display with toast notifications

## Verification Commands

```bash
# Register a new patient
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"Passw0rd!"}'

# Login
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Passw0rd!"}'

# Get available slots
curl -X GET "http://localhost:5000/api/slots?from=2024-01-01&to=2024-01-07" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Book a slot
curl -X POST http://localhost:5000/api/book \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"slotId":"SLOT_ID"}'

# Get my bookings
curl -X GET http://localhost:5000/api/my-bookings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Deployment Steps

1. **Backend Deployment (Render)**
   - Connect GitHub repository
   - Set environment variables
   - Deploy with Node.js buildpack

2. **Frontend Deployment (Vercel)**
   - Connect GitHub repository
   - Set environment variables
   - Deploy with Vite build command

## Known Limitations

- No email notifications
- No appointment cancellation
- No recurring appointments
- Basic UI without advanced styling

## Future Improvements (2+ hours)

- Email notifications for bookings
- Appointment cancellation functionality
- Calendar view for better UX
- Admin dashboard with analytics
- Mobile-responsive design improvements
- Unit and integration tests

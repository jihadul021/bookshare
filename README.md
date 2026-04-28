# 📚 BookShare

BookShare is a full-stack web application designed to facilitate the sharing, buying, selling, and exchanging of books. The platform supports user authentication, real-time chat, order management, book exchange requests, Stripe card payments, and an admin dashboard for managing users, books, orders, and coupons. Built with a modern React frontend and a Node.js/Express backend, BookShare provides a seamless and secure experience for both buyers and sellers.

## **Live Demo:** [https://booksharenet.vercel.app/](https://booksharenet.vercel.app/) 

![BookShare](https://img.shields.io/badge/BookShare-v1.0.0-blue)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb)

---

## Features

- **User Authentication** — Secure registration, login, email verification and profile management using JWT
- **Book Listings** — Add, edit, browse, and search for books with images
- **Cart & Wishlist** — Add books to cart or wishlist for easy management
- **Book Exchange** — Request to exchange your books with other users
- **Order Management** — Place orders, track order history, and manage seller orders
- **Payment Integration** — Cash on delivery and Stripe card payment (test mode)
- **Coupon & Discounts** — Apply discount codes at checkout
- **Real-Time Chat** — In-app messaging between buyers and sellers via Socket.io with AES encrypted messages stored in the database
- **Reviews & Ratings** — Rate and review books after purchase
- **Admin Dashboard** — Manage users, books, orders, and coupons
- **Saved Addresses** — Save and reuse shipping addresses at checkout
- **Responsive Design** — Mobile-friendly and accessible UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Styling | CSS, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT (JSON Web Tokens) |
| Real-Time | Socket.io |
| Payments | Stripe |

---

## 📁 Project Structure

```
BookShare/
├── client/                   # Frontend React application
│   ├── public/
│   ├── src/
│   │   ├── components/       
│   │   ├── utils/            
│   │   ├── api.js            
│   │   └── main.jsx          
│   ├── .env                
│   └── vite.config.js
│
├── server/                   # Backend Node.js application
│   ├── config/               # Database connection
│   ├── controllers/          
│   ├── middleware/            
│   ├── models/               # Mongoose models
│   ├── routes/               
│   ├── uploads/              # Uploaded book images
│   ├── .env                  
│   └── index.js             
│
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js
- npm or yarn
- MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- Stripe account (for payment - test account works)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/jihadul021/bookshare.git
cd bookshare
```

**2. Install backend dependencies**
```bash
cd server
npm install
```

**3. Install frontend dependencies**
```bash
cd ../client
npm install
```

---

### Environment Variables

**Backend — create `server/.env`**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=3000
CLIENT_URL=http://localhost:5173
CHAT_ENCRYPTION_SECRET=your_long_random_secret_key

SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER=user_email
SMTP_PASS=email_app_password
SMTP_FROM="BookShare <user_email>"

```

**Frontend — create `client/.env`**
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_publishable_key
```

> Get your Stripe test keys from [dashboard.stripe.com](https://dashboard.stripe.com/test/apikeys) — no real payment setup needed for testing.

---

### Running the App

**Start the backend**
```bash
cd server
npm run dev
```

**Start the frontend** (in a new terminal)
```bash
cd client
npm run dev
```

**Access the app**
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)

---

##  Test Payments

BookShare uses Stripe in test mode. Use these test card numbers to simulate payments — no real money is involved.

| Card Number | Result |
|---|---|
| `4242 4242 4242 4242` | ✅ Payment success |
| `4000 0000 0000 0002` | ❌ Payment declined |
| `4000 0025 0000 3155` | 🔐 Requires authentication |

Use any future expiry date and any 3-digit CVC.

---

## Developer

**Jihadul Amin**
- GitHub: [@jihadul021](https://github.com/jihadul021)

---

# BookShare

BookShare is a full-stack web application designed to facilitate the sharing, buying, and selling of books. The platform supports user authentication, real-time chat, order management, and an admin dashboard for managing users, books, orders, and coupons. Built with a modern React frontend and a Node.js/Express backend, BookShare provides a seamless and secure experience for both buyers and sellers.

## Features

- **User Authentication**: Secure registration, login, and profile management
- **Book Listings**: Add, edit, browse, and search for books
- **Cart & Wishlist**: Add books to cart or wishlist for easy management
- **Order Management**: Place orders, view order history, and manage seller orders
- **Admin Dashboard**: Manage users, books, orders, and coupons
- **Coupons**: Apply discount codes at checkout
- **Real-Time Chat**: In-app messaging between buyers and sellers
- **Responsive Design**: Mobile-friendly and accessible UI

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Communication**: Socket.io

## Project Structure

```
BookShare/
├── client/           # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── api.js        # API calls
│   │   └── ...
│   ├── public/
│   └── ...
├── server/           # Backend Node.js application
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Express middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── ...
└── README.md         # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/BookShare.git
   cd BookShare
   ```

2. **Install dependencies:**
   - For the backend:
     ```bash
     cd server
     npm install
     ```
   - For the frontend:
     ```bash
     cd ../client
     npm install
     ```

3. **Configure environment variables:**
   - Create a `.env` file in the `server/` directory. Example:
     ```env
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     PORT=3000
     ```

4. **Start the development servers:**
   - Backend:
     ```bash
     cd server
     npm run dev
     ```
   - Frontend:
     ```bash
     cd ../client
     npm run dev
     ```

5. **Access the app:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:3000](http://localhost:3000)

## Scripts

- **Frontend**
  - `npm run dev` — Start the React development server
  - `npm run build` — Build for production
  - `npm run preview` — Preview production build
- **Backend**
  - `npm run dev` — Start the backend with nodemon
  - `npm start` — Start the backend in production


This project is licensed under the MIT License.

## Contact

For questions or support, please contact the maintainer at [your.email@example.com](mailto:your.email@example.com).

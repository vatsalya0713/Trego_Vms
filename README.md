# Trego - Medicine Delivery & Vendor Management Platform

Trego is a comprehensive B2B platform designed to streamline medicine delivery and vendor management. It connects administrators, vendors (pharmacies and medical stores), and delivery riders into a seamless ecosystem. With a robust backend and an intuitive, modern frontend, Trego enables efficient inventory tracking, order management, and user administration.

## 🚀 Key Features

*   **Role-Based Access Control:** Secure authentication and authorization for Admins, Vendors, and Riders using JWT.
*   **Admin Dashboard:** Comprehensive overview of business metrics using Recharts, plus tools to verify vendors, manage admins, and oversee operations.
*   **Vendor Management:** Dedicated portals for vendors to track business details, manage their medicine buckets, and place orders.
*   **Medicine & Inventory System:** 
    *   Browse and search a central medicine database.
    *   Dynamic shopping cart and checkout flow tailored for B2B orders.
    *   Vendors can easily add medicines to their local inventory/bucket.
*   **Order & Delivery Management:** Tools for tracking order statuses and managing rider assignments for seamless deliveries.
*   **SMS Integrations:** Built-in Twilio integration for notifications and OTP-based verification.
*   **Responsive & Modern UI:** Designed with React, Tailwind CSS, and Material UI for a polished, responsive user experience across devices.

## 🛠️ Tech Stack

**Frontend (`/src`)**
*   **Framework:** React 18, Vite
*   **Styling:** Tailwind CSS, PostCSS
*   **UI Components:** Material UI (@mui/material), Flowbite, Lucide React, React Icons
*   **Data Visualization:** Recharts
*   **Routing:** React Router DOM
*   **State Management/Forms:** React Hook Form

**Backend (`/backend`)**
*   **Environment:** Node.js, Express.js
*   **Database:** MySQL (mysql2)
*   **Authentication:** JWT (jsonwebtoken), bcrypt
*   **File Uploads:** Multer, Cloudinary
*   **Communications:** Twilio

## 📂 Project Structure

```text
Trego/
├── backend/                  # Node.js Express server
│   ├── controllers/          # API business logic
│   ├── middleware/           # Express middleware (auth, uploads, etc.)
│   ├── routes/               # API endpoints (admin, auth, newMedicines, rider, vendor)
│   ├── utils/                # Helper functions
│   ├── db.js                 # MySQL database connection
│   └── index.js              # Server entry point
├── src/                      # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (Dashboard, Vendors, Medicine, etc.)
│   │   ├── auth/             # Authentication pages (Login, etc.)
│   │   └── ...
│   ├── package.json          # Frontend dependencies
│   └── tailwind.config.js    # Tailwind configuration
└── README.md                 # Project documentation
```

## ⚙️ Prerequisites

Before you begin, ensure you have met the following requirements:
*   [Node.js](https://nodejs.org/en/) (v16.x or higher recommended)
*   [MySQL](https://www.mysql.com/) server running locally or remotely
*   A package manager (npm or yarn)

## 💻 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/vatsalya0713/Trego_Vms.git
cd Trego
```

### 2. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment variables.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD2=your_mysql_password
DB_NAME2=your_database_name
JWT_SECRET=your_jwt_secret_key

# Twilio Configuration (Optional/Required for SMS)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

Start the backend development server:
```bash
npm run dev
# Server will start on http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and start the Vite development server.

```bash
cd src
npm install
npm run dev
```
The frontend should now be running on `http://localhost:5173` (or the port specified by Vite).

## 📝 License

This project is licensed under the ISC License.

# 🏥 Healthcare Appointment Management System

A full-stack Healthcare Appointment Management System that allows patients to book appointments, doctors to manage and update appointment status, and admins to oversee the entire system.

Built using React (Vite) + Material UI on the frontend and Node.js + Express + MongoDB on the backend.

---

## 🚀 Live Demo

Frontend (Netlify):  
https://healthcareport.netlify.app/

---

## 🧑‍💻 Tech Stack

### Frontend
- React (Vite)
- Material UI (MUI)
- React Router
- JWT Authentication
- Fetch API

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- bcrypt (Password hashing)

### Deployment
- Frontend: Netlify
- Backend: Render
- Database: MongoDB Atlas

---

## 👥 User Roles & Features

### 👨‍⚕️ Patient
- Secure login
- View available doctors
- Book appointments with date & time
- Track appointment status
- View doctor notes after approval

### 🩺 Doctor
- Secure login
- View assigned appointments
- Approve or reject appointments
- Add notes for patients
- Search and filter appointments

### 🧑‍💼 Admin
- Secure login
- View all users (patients & doctors)
- View all appointments
- Manage doctors and patients

---

## 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (Admin / Doctor / Patient)
- Protected frontend routes
- Backend authorization middleware
- Password hashing using bcrypt

---

## 🏗️ Application Architecture

Frontend (React + MUI)  
⬇️ REST API (JWT secured)  
Backend (Node.js + Express)  
⬇️  
MongoDB Atlas

---

## 📂 Project Structure

healthcare-portal/


├── frontend/

 ├── src/

 │ ├── pages/ # Dashboards (Admin, Doctor, Patient)

 │ ├── components/ # Protected routes, shared UI

 │ ├── utils/ # API utilities

 │ └── App.jsx

 └── public/



 ├── backend/

 ├── controllers/ # Business logic

 ├── routes/ # API routes

 ├── models/ # MongoDB schemas

 ├── middleware/ # Auth middleware

 ├── config/ # DB connection

 └── server.js


└── README.md

---

## ⚙️ Environment Variables

### Frontend (Netlify)
VITE_API_URL=https:https://healthcare-portal-34ea.onrender.com

### Backend (Render)
MONGO_URI=your_mongodb_atlas_connection_string

JWT_SECRET=your_jwt_secret

FRONTEND_URL=https://healthcareport.netlify.apps


---

## 🛠️ Local Setup

### Clone Repository
git clone https://github.com/VISHALRDY/healthcare-portal.git

cd healthcare-portal

### Backend
cd backend

npm install

npm run dev

### Frontend
cd frontend

npm install

npm run dev

---

## 🎯 Why Material UI (MUI)?
- Faster UI development
- Responsive design
- Built-in accessibility
- Clean and professional dashboard layouts

---

## 📈 Future Enhancements
- Email notifications
- Doctor availability scheduling
- Appointment rescheduling
- Pagination & analytics dashboard
- Automated testing

---

## 👤 Author

**Vishal Reddy**  
GitHub: https://github.com/VISHALRDY

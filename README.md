# ClubPortal - College Club Management & Opportunity Portal

A modern, responsive, and secure web application designed to centralize, streamline, and moderate student activities, organizations, recruitment drives, and event scheduling inside educational institutions.

---

## 📖 Project Description

### The Problem It Solves
On modern college campuses, communication between student-led organizations and the general student body is often fragmented. Information about recruitments, events, technical hackathons, and announcements is scattered across physical notice boards, group chats, and social media channels. This makes it difficult for students to discover opportunities and cumbersome for club owners to manage applications, track member participation, and secure administrative approvals.

### What the Project Does
**ClubPortal** centralizes campus student life. It provides:
1. A unified directory of all officially approved student clubs.
2. A simplified application portal where student clubs can post open roles (e.g., developers, content writers, designers) and students can apply.
3. An event tracker for workshops, sports events, and festivals with built-in registration mechanisms.
4. A moderated administrative flow ensuring all profiles and announcements are vetted by faculty advisors or system admins.

### Target Users
* **Students**: Looking to discover matching interest groups, join clubs, attend events, and apply for student leadership or technical positions.
* **Club Owners / Student Leaders**: Seeking a centralized platform to manage club profiles, announce events, post job opportunities, review candidate portfolios, and accept applications.
* **Faculty Advisors / Administrators**: Administering the system to ensure postings, event flyers, and student organizations comply with university regulations.

### Key Objectives
* Enhance student engagement and campus-wide coordination.
* Provide an intuitive application and recruit portal to simulate real-world hiring workflows.
* Keep student data secure while ensuring transparency in selection procedures.

---

## ✨ Features

- **User Authentication & Authorization**: Roles-based access control (Student, Club Owner, Admin) with secure password hashing (bcrypt) and JSON Web Tokens (JWT).
- **Club Directory**: Interactive, responsive listings categorized by type (Technical, Cultural, Sports, Literary) with search and filter capabilities.
- **Job & Position Postings**: Ability for club owners to list open roles. Students can view responsibilities, submit custom applications, and monitor progress.
- **Unified Event Registration**: Calendar and detail views of all campus events. RSVP system to track participation.
- **Student Dashboard**: Personalized workspace for student applicants to track their submitted applications and event RSVPs.
- **Club Owner Dashboard**: Analytical workspace to update club details, draft event RSVPs, list recruit openings, and manage student applications.
- **Admin Panel**: Elevated control panel to approve/reject pending club registrations, review users, and maintain portal safety.
- **Responsive UI**: Sleek styling built on mobile-first design principles. Works flawlessly across monitors, tablets, and mobile screens.
- **Toast Notifications**: Interactive state alerts using `react-hot-toast` for streamlined feedback.

---

## 🛠️ Tech Stack

### Frontend
* **React** (v18.3.1)
* **TypeScript**
* **Vite** (Next-generation frontend tooling)
* **Tailwind CSS** (Utility-first styling frame)
* **React Router Dom** (Single Page App routing)
* **Lucide React** (Vector icons library)
* **Axios** (HTTP client)

### Backend
* **Node.js**
* **Express.js** (Web application framework)

### Database
* **MongoDB** (NoSQL document database)
* **Mongoose** (Object data modeling for MongoDB)

### Other Tools
* **JSON Web Tokens (JWT)** (Secure stateless session handling)
* **Bcrypt.js** (Password hashing standard)
* **Nodemailer** (Automated email alerts/notifications integration)
* **Git & GitHub** (Version control)

---

## 📁 Folder Structure

```text
project/
├── .bolt/                  # Development sandbox config
├── dist/                   # Production build outputs
├── public/                 # Static assets (Favicons, web manifests)
├── src/                    # Frontend source folder
│   ├── assets/             # College images and project logo
│   ├── components/         # Shared React components (Navbar, Footer, ProtectedRoutes)
│   ├── context/            # AuthContext and state management
│   ├── lib/                # API wrapper client settings
│   ├── pages/              # Page components
│   │   ├── admin/          # Admin specific panels
│   │   ├── auth/           # Login, Register, Forgot Password
│   │   ├── clubOwner/      # Dashboard, Event, and Job managers
│   │   └── student/        # Browse clubs and student dashboards
│   ├── App.tsx             # Root routing layout
│   ├── index.css           # Tailwind base styles and custom animations
│   └── main.tsx            # App entry mounting point
├── server/                 # Backend source folder
│   ├── src/
│   │   ├── middleware/     # JWT authentication, role guards
│   │   ├── models/         # MongoDB Schemas (User, Club, Job, Event, Application)
│   │   ├── routes/         # Express API route endpoints
│   │   ├── utils/          # Database seeding scripts, mail configurations
│   │   └── index.js        # Main express server entry file
│   ├── .env                # Server configuration secrets
│   └── package.json        # Backend dependencies
├── eslint.config.js        # Linter rules
├── package.json            # Frontend dependencies
├── tailwind.config.js      # CSS configuration file
└── tsconfig.json           # TypeScript configuration
```

---

## 🚀 Installation & Setup

Follow these steps to run both the frontend and backend servers locally on your machine.

### Prerequisites
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- A running MongoDB instance (Local or MongoDB Atlas cluster)

### 1. Clone the Repository
```bash
git clone https://github.com/tejas-ghule/club-portal.git
cd club-portal/project
```

### 2. Configure Environment Variables
Inside the `server/` directory, create a `.env` file based on the environment configurations:
```bash
# Navigate to the server folder
cd server
touch .env
```
Copy and fill in the variables described in the **Environment Variables** section below.

### 3. Install Dependencies & Start the Backend
From the `server/` directory, execute:
```bash
# Install server modules
npm install

# (Optional) Seed the database with initial clubs and mock data
npm run seed

# Run the server in development watch mode
npm run dev
```
The server will start running on port `5000` (or your customized `PORT` variable).

### 4. Install Dependencies & Start the Frontend
Open a new terminal window, navigate back to the `project/` root, and execute:
```bash
# Install frontend modules
npm install

# Start Vite local development server
npm run dev
```
The application will launch on your default browser at `http://localhost:5173`.

---

## 🔑 Environment Variables

The backend relies on the following configurations inside `server/.env`:

```env
# Server Port
PORT=5000

# MongoDB Connection String (Local database or Cloud Atlas)
MONGODB_URI=mongodb://localhost:27017/clubportal

# JSON Web Token Secret (used to sign session payloads)
JWT_SECRET=your_super_secure_jwt_secret_key_change_me

# Client application URL (for CORS validation)
CLIENT_URL=http://localhost:5173

# Email server configs (Nodemailer setup for SMTP notifications)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password_or_app_specific_token
```

---

## 💡 Usage Guide

### 👨‍🎓 For Students
1. **Sign Up**: Create a new account with the `Student` role.
2. **Browse**: Search through student clubs by category and name.
3. **Apply**: Go to a club's profile, click on "Openings", read requirements, and submit your responses.
4. **Register**: View upcoming events and register to reserve your ticket. Keep track of status from your Dashboard.

### 👩‍💼 For Club Owners / Moderating Managers
1. **Register Club**: Sign up as a `Club Owner`. You will be directed to create a Club Profile.
2. **Review Approval**: Wait for an administrator to review and approve your club profile.
3. **Post Openings**: Publish student openings with description, role types, and deadlines.
4. **Schedule Events**: Add title, date, banner image, and details for upcoming campus events.
5. **Manage Candidates**: Open the dashboard to review candidate applications, move candidate statuses, and contact them.

### 👑 For Administrators
1. **Admin Control**: Sign in using preconfigured admin credentials.
2. **Moderate Clubs**: Approve or reject pending organization requests in the "Pending Clubs" panel.
3. **System Safety**: Monitor and manage registered users and clean up outdated posts.

---

## 📸 Screenshots

> *Below are visual layout mockups of the ClubPortal system:*

### 🏠 Home Page
*Features a dynamic campus background slideshow, statistics counter, about overview, and live clubs grid.*
![Home Page Mockup](https://raw.githubusercontent.com/tejas-ghule/club-portal/main/screenshots/home.png)

### 🔑 Login Page
*Secure interface for role-based system access.*
![Login Page Mockup](https://raw.githubusercontent.com/tejas-ghule/club-portal/main/screenshots/login.png)

### 📈 Student Dashboard
*A space for students to view application review pipelines and active event tickets.*
![Student Dashboard Mockup](https://raw.githubusercontent.com/tejas-ghule/club-portal/main/screenshots/student_dashboard.png)

### 💼 Club Openings Grid
*Browse available internal campus jobs.*
![Job Openings Mockup](https://raw.githubusercontent.com/tejas-ghule/club-portal/main/screenshots/jobs.png)

---

## 🔮 Future Enhancements

- [ ] **Resume Upload Integration**: Store and parse PDF resumes using cloud storage (Cloudinary/AWS S3).
- [ ] **Email Verification & OTP**: Implement email verification on register and Password Reset using automated mail OTPs.
- [ ] **Placement & Engagement Analytics**: Visual analytics showing student registration rates and active recruit metrics.
- [ ] **AI-Powered Recommendation Engine**: Match students to open club positions based on interests and tags.
- [ ] **Unified Scheduling**: Schedule selection interviews directly through the portal using calendar APIs (Google Calendar/Cal.com).
- [ ] **Real-time Live Chat**: Built-in messaging between student applicants and club owners.

---

## 👥 Contributors

* **Developed by**: [Tejas N. Ghule](https://www.linkedin.com/in/tejas-n-ghule/)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

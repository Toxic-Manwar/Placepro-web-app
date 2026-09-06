# PlacePro - Unified Academia & Industry Portal

PlacePro is a comprehensive web application bridging the gap between students, colleges, training institutes, and industry recruiters. It provides dedicated role-based portals for seamless campus placements, internships, skill assessments, and recruitment drives.

## 🚀 Features

- **Multi-Role Portals**: Tailored interfaces for Students, TPOs (Training & Placement Officers), Companies/Recruiters, and College Admins.
- **Job & Internship Matching**: Browse, apply, and manage job drives and internship listings with real-time status tracking.
- **Analytics & Placement Insights**: Rich visual analytics for placement statistics, candidate performance, and company engagement.
- **Assessment & Resume Suite**: Tools for resume building, skill verification, and test scheduling.
- **Modern Responsive UI**: Built with React, Vite, and modern CSS design system.

---

## 📁 Repository Structure

```
Placepro-web app/
├── placepro/                   # Modern React + Vite application
│   ├── src/                    # Components, portal views, and data models
│   ├── public/                 # Static assets
│   ├── package.json
│   └── vite.config.js
├── academia-industry-portal/   # Standalone HTML/CSS/JS portal
├── package.json                # Root package workspace scripts
└── README.md                   # Project documentation
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/placepro.git
   cd "Placepro-web app"
   ```

2. Install dependencies for the React app:
   ```bash
   npm install --prefix placepro
   ```

### Running the Application

To run the React development server:
```bash
npm run dev
# or
npm run dev --prefix placepro
```

Open your browser and navigate to `http://localhost:5173`.

### Building for Production

```bash
npm run build
```

---

## 📄 License

This project is licensed under the MIT License.

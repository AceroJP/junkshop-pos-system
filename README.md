# Junkshop POS System + Online Licensing Platform

A hybrid software system consisting of a Web-based Admin & Licensing Platform and an Offline-first Desktop POS Application.

## 🧠 Overall Concept

This project is designed as a one-time purchase software product. Users buy access online, receive a license key, and install an offline desktop application that runs without internet after activation.

## 🧩 Architecture

- **🌐 Online System (web-admin):** Laravel 11 + MySQL. Handles user registration, payments, license generation, and API for activation.
- **🖥️ Desktop Application (desktop-app):** Electron + React + SQLite. Offline-first POS for daily operations, inventory, and receipt printing.
- **🔗 Shared Module:** Shared utilities and constants.

## 🚀 Technology Stack

### Web System
- **Backend:** Laravel 11
- **Database:** MySQL
- **Frontend:** Blade + Tailwind CSS
- **Payment:** Manual GCash verification

### Desktop System
- **Framework:** Electron.js
- **Frontend:** React.js
- **Database:** SQLite (Local)
- **Printing:** ESC/POS Thermal Printer support

## 🛠️ Installation & Setup

### Web Admin
```bash
cd web-admin
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

### Desktop App
```bash
cd desktop-app
npm install
npm run dev
```

## 🧭 Roadmap
- [x] Phase 1: Project Setup
- [x] Web Admin: Core Logic & Licensing API
- [ ] Phase 2: Core Desktop POS System
- [ ] Phase 3: Receipt Printing System
- [ ] Phase 4: Security & Login System
- [ ] Phase 5: License Activation System
- [ ] Phase 6: Web Platform Features
- [ ] Phase 7: Packaging & Distribution
- [ ] Phase 8: Final Product Launch

# Expense Tracker

A lightweight personal expense and budget tracking web application built with **Node.js**, **Express**, **EJS**, and **SQLite**.

## Features

- User registration & login (with username + full name)
- Create categories and set monthly budgets
- Add, edit, and delete expenses
- Dashboard with spend-vs-budget progress bars
- Month selector on the dashboard
- Admin panel (view all users and their data)
- Dark mode toggle
- Flash success/error messages
- Responsive design

## Tech Stack

- Backend: Node.js + Express
- Database: SQLite (better-sqlite3)
- Templating: EJS
- Authentication: express-session + bcrypt
- Styling: Custom CSS with dark mode support

## Quick Start (Local)

```bash
# 1. Clone the repository
git clone https://github.com/els1823/expense-tracker.git
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Then open .env and set a real SESSION_SECRET

# 4. Seed the database (creates admin + demo accounts)
npm run seed

# 5. Start the server
npm start

Open http://localhost:3000 in your browser.

Enjoy 
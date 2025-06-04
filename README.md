# Sketchboard Art

A collaborative web app where users can draw sketches on a digital canvas and share them with the community.

## Features

- Draw on a digital canvas with different brush sizes, colors, and an eraser.
- Save your sketch with your name.
- View all community sketches displayed in a creative, random layout.
- All sketches are stored in a Neon PostgreSQL database via a Next.js API.

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- Neon PostgreSQL
- Lucide React Icons

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up your database:**
   - Create a Neon PostgreSQL database.
   - Add your connection string to `.env.local` as `DATABASE_URL`.
   - Run the following SQL to create the table:
     ```sql
     CREATE TABLE sketches (
       id SERIAL PRIMARY KEY,
       name TEXT NOT NULL,
       drawing TEXT NOT NULL
     );
     ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000) to view the app.**

## Folder Structure

- `src/components/Sketchboard.jsx` — Main board and gallery
- `src/components/DrawingBoard.jsx` — Drawing modal
- `src/app/api/sketches/route.js` — API for GET/POST sketches

---

Enjoy drawing and sharing your art!

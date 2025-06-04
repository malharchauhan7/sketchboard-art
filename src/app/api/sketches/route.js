import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, drawing FROM sketches ORDER BY id DESC"
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, drawing } = await request.json();
    if (!name || !drawing) {
      return NextResponse.json(
        { error: "Name and drawing are required." },
        { status: 400 }
      );
    }
    const result = await pool.query(
      "INSERT INTO sketches (name, drawing) VALUES ($1, $2) RETURNING id, name, drawing",
      [name, drawing]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

function getNumericDateTimeId() {
  const now = new Date();
  const pad = (n, l = 2) => n.toString().padStart(l, "0");
  return Number(
    pad(now.getDate()) +
      pad(now.getMonth() + 1) +
      now.getFullYear() +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
  );
}

export async function GET() {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, drawing FROM sketches_datetime ORDER BY created DESC"
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
    const id = getNumericDateTimeId();
    const result = await pool.query(
      "INSERT INTO sketches_datetime (id, name, drawing) VALUES ($1, $2, $3) RETURNING id, name, drawing",
      [id, name, drawing]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

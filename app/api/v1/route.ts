import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await getPool().query(
      "SELECT DATABASE() AS db, VERSION() AS version"
    )

    return NextResponse.json({
      success: true,
      message: "Database connected successfully.",
      result: rows,
    })
  } catch (error) {
    console.error("Database connection failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed.",
      },
      { status: 500 }
    )
  }
}

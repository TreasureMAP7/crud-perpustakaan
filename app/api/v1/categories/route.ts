import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"

export async function GET() {
  try {
    const [rows] = await getPool().query("SELECT * FROM tb_categories")

    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori kosong" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diambil",
      data: rows,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { nama } = await request.json()

    if (!nama) {
      return NextResponse.json(
        { success: false, message: "Nama kategori tidak boleh kosong" },
        { status: 400 }
      )
    }

    await getPool().execute("INSERT INTO tb_categories (nama) VALUES (?)", [
      nama,
    ])

    return NextResponse.json(
      { success: true, message: "Kategori berhasil ditambahkan" },
      { status: 201 }
    )
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json(
        { success: false, message: "Kategori sudah terdaftar" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server", error: error },
      { status: 500 }
    )
  }
}

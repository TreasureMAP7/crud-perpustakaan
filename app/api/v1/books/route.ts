import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import type { ResultSetHeader } from "mysql2"

// GET: Mendapatkan semua buku
export async function GET() {
  try {
    const [rows] = await getPool().query("SELECT * FROM tb_books")

    if (Array.isArray(rows) && rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Buku kosong" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Daftar buku berhasil diambil",
      data: rows,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan server",
        error: error,
      },
      { status: 500 }
    )
  }
}

// POST: Menambahkan buku
export async function POST(request: Request) {
  try {
    const {
      judul,
      deskripsi,
      penulis,
      penerbit,
      tahun_terbit,
      stok,
      category_id,
    } = await request.json()

    if (judul !== undefined && !judul.trim()) {
      return NextResponse.json(
        { success: false, message: "Judul tidak boleh kosong" },
        { status: 400 }
      )
    }

    if (penulis !== undefined && !penulis.trim()) {
      return NextResponse.json(
        { success: false, message: "Penulis tidak boleh kosong" },
        { status: 400 }
      )
    }

    if (stok !== undefined && (!Number.isInteger(stok) || stok < 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Stok harus bilangan bulat dan tidak kurang dari 0",
        },
        { status: 400 }
      )
    }

    const [result] = await getPool().execute<ResultSetHeader>(
      `INSERT INTO tb_books
      (judul, deskripsi, penulis, penerbit, tahun_terbit, stok, category_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [judul, deskripsi, penulis, penerbit, tahun_terbit, stok, category_id]
    )

    return NextResponse.json(
      {
        success: true,
        message: "Buku berhasil ditambahkan",
        data: {
          id: result.insertId,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan buku",
        error: error,
      },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import type { ResultSetHeader } from "mysql2"

type Props = {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: Props) {
  try {
    const { id } = await params
    const { nama } = await request.json()

    if (!nama) {
      return NextResponse.json(
        { success: false, message: "Nama kategori tidak boleh kosong" },
        { status: 400 }
      )
    }

    const [result] = await getPool().execute<ResultSetHeader>(
      "UPDATE tb_categories SET nama = ? WHERE id = ?",
      [nama, id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diubah",
    })
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

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params

    const [result] = await getPool().execute<ResultSetHeader>(
      "DELETE FROM tb_categories WHERE id = ?",
      [id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Kategori tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: "Kategori berhasil dihapus",
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server", error: error },
      { status: 500 }
    )
  }
}

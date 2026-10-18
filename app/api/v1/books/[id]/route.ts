import { NextResponse } from "next/server"
import { getPool } from "@/lib/db"
import type { ResultSetHeader } from "mysql2"

type Props = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params

    const [rows] = await getPool().execute(
      "SELECT * FROM tb_books WHERE id = ?",
      [id]
    )

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Buku tidak ditemukan",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Buku berhasil diambil",
      data: rows[0],
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data buku",
        error,
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: Props) {
  try {
    const { id } = await params
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

    const [check] = await getPool().execute(
      "SELECT id FROM tb_books WHERE id = ?",
      [id]
    )

    if (!Array.isArray(check) || check.length === 0) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan" },
        { status: 404 }
      )
    }

    const fields = []
    const values = []

    if (judul !== undefined) {
      fields.push("judul = ?")
      values.push(judul)
    }

    if (deskripsi !== undefined) {
      fields.push("deskripsi = ?")
      values.push(deskripsi)
    }

    if (penulis !== undefined) {
      fields.push("penulis = ?")
      values.push(penulis)
    }

    if (penerbit !== undefined) {
      fields.push("penerbit = ?")
      values.push(penerbit)
    }

    if (tahun_terbit !== undefined) {
      fields.push("tahun_terbit = ?")
      values.push(tahun_terbit)
    }

    if (stok !== undefined) {
      fields.push("stok = ?")
      values.push(stok)
    }

    if (category_id !== undefined) {
      fields.push("category_id = ?")
      values.push(category_id)
    }

    const [result] = await getPool().execute<ResultSetHeader>(
      `UPDATE tb_books SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id]
    )

    return NextResponse.json({
      success: true,
      message: "Buku berhasil diperbarui",
      data: {
        id: result.insertId,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui buku",
        error,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params

    const [result] = await getPool().execute<ResultSetHeader>(
      "DELETE FROM tb_books WHERE id = ?",
      [id]
    )

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Buku tidak ditemukan" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Buku berhasil dihapus",
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus buku",
        error,
      },
      { status: 500 }
    )
  }
}

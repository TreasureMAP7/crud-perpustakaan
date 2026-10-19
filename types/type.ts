export type Book = {
  id: number
  judul: string
  deskripsi: string | null
  penulis: string
  penerbit: string | null
  tahun_terbit: number | null
  stok: number
  category_id: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: number
  nama: string
}

export type BookForm = {
  judul: string
  deskripsi: string
  penulis: string
  penerbit: string
  tahun_terbit: string
  stok: string
  category_id: string
}

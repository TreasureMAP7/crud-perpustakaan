"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Book, Category, BookForm } from "@/types/type"
import { useEffect, useState } from "react"

export default function Page() {
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const initialForm: BookForm = {
    judul: "",
    deskripsi: "",
    penulis: "",
    penerbit: "",
    tahun_terbit: "",
    stok: "",
    category_id: "",
  }

  const [form, setForm] = useState<BookForm>(initialForm)

  const [selectedBook, setSelectedBook] = useState<Book | null>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true)

        const [booksResponse, categoriesResponse] = await Promise.all([
          fetch("/api/v1/books"),
          fetch("/api/v1/categories"),
        ])

        if (!booksResponse.ok || !categoriesResponse.ok) {
          throw new Error("Gagal mengambil data")
        }

        const booksResult = await booksResponse.json()
        const categoriesResult = await categoriesResponse.json()

        if (!booksResult.success || !categoriesResult.success) {
          throw new Error("Respons API tidak berhasil")
        }

        setBooks(booksResult.data)
        setCategories(categoriesResult.data)
      } catch (error) {
        console.error("Gagal mengambil data:", error)
      } finally {
        setLoading(false)
      }
    }

    getData()
  }, [refresh])

  const filteredBooks = books.filter((book) => {
    const keyword = search.toLowerCase()

    return (
      book.judul.toLowerCase().includes(keyword) ||
      book.penulis.toLowerCase().includes(keyword)
    )
  })

  const createBook = () => {
    setForm(initialForm)
    setEditing(false)
    setSelectedBook(null)
    setFormOpen(true)
  }

  const editBook = (book: Book) => {
    setForm({
      judul: book.judul,
      deskripsi: book.deskripsi ?? "",
      penulis: book.penulis,
      penerbit: book.penerbit ?? "",
      tahun_terbit: book.tahun_terbit?.toString() ?? "",
      stok: book.stok.toString(),
      category_id: book.category_id.toString(),
    })

    setSelectedBook(book)
    setEditing(true)
    setFormOpen(true)
  }

  const bookDetail = (book: Book) => {
    setSelectedBook(book)
    setDetailOpen(true)
  }

  const updateForm = (field: keyof BookForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!form.judul.trim() || !form.penulis.trim()) {
      toast.add({
        title: "Data belum lengkap",
        description: "Judul dan penulis wajib diisi.",
        type: "error",
      })
      return
    }

    if (
      form.stok === "" ||
      !Number.isInteger(Number(form.stok)) ||
      Number(form.stok) < 0
    ) {
      toast.add({
        title: "Stok tidak valid",
        description: "Stok harus berupa bilangan bulat minimal 0.",
        type: "error",
      })
      return
    }

    if (!form.category_id) {
      toast.add({
        title: "Kategori belum dipilih",
        description: "Silakan pilih kategori buku.",
        type: "error",
      })
      return
    }

    const payload = {
      judul: form.judul.trim(),
      deskripsi: form.deskripsi.trim() || null,
      penulis: form.penulis.trim(),
      penerbit: form.penerbit.trim() || null,
      tahun_terbit: form.tahun_terbit === "" ? null : Number(form.tahun_terbit),
      stok: Number(form.stok),
      category_id: Number(form.category_id),
    }

    try {
      setSubmitting(true)

      // POST untuk tambah, PATCH untuk edit
      const response = await fetch(
        editing && selectedBook
          ? `/api/v1/books/${selectedBook.id}`
          : "/api/v1/books",
        {
          method: editing && selectedBook ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      )

      const result = await response.json()

      console.log(result)

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menyimpan buku.")
      }

      const booksResponse = await fetch("/api/v1/books")
      const booksResult = await booksResponse.json()

      setBooks(booksResult.data)
      setForm(initialForm)
      setSelectedBook(null)
      setEditing(false)
      setFormOpen(false)

      toast.add({
        title: "Berhasil",
        description: editing
          ? "Buku berhasil diperbarui."
          : "Buku berhasil ditambahkan.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Terjadi kesalahan",
        description:
          error instanceof Error
            ? error.message
            : "Gagal menyimpan buku error 500",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedBook) return

    try {
      setSubmitting(true)

      const response = await fetch(`/api/v1/books/${selectedBook.id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal menghapus buku.")
      }

      const booksResponse = await fetch("/api/v1/books")
      const booksResult = await booksResponse.json()

      setBooks(booksResult.data)
      setSelectedBook(null)
      setDeleteOpen(false)

      toast.add({
        title: "Berhasil",
        description: "Buku berhasil dihapus.",
        type: "success",
      })
    } catch (error) {
      toast.add({
        title: "Terjadi kesalahan",
        description:
          error instanceof Error ? error.message : "Gagal menghapus buku.",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between gap-4 p-4">
        <h1 className="text-xl font-bold">CRUD Perpustakaan</h1>
      </header>

      <main className="p-4">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Daftar Buku</h2>
          </div>

          <Button
            onClick={() => {
              createBook()
            }}
          >
            Tambah Buku
          </Button>
        </div>

        <div className="mb-6">
          <Input
            placeholder="Cari judul atau penulis buku..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-8">
            <h3 className="text-lg">Buku Tidak Ditemukan</h3>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredBooks.map((book: Book) => {
              const category = categories.find(
                (item: Category) => item.id === book.category_id
              )

              return (
                <div key={book.id} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-4 p-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h3 className="text-lg font-bold">
                        {book.judul} ({book.tahun_terbit ?? "-"})
                      </h3>

                      <p className="text-sm">
                        {book.penulis} - {book.penerbit || "Penerbit Anonim"} -{" "}
                        {category?.nama ?? "Tidak diketahui"}
                      </p>

                      <p className="text-sm">Stok: {book.stok}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          bookDetail(book)
                        }}
                      >
                        Detail
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          editBook(book)
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => {
                          setSelectedBook(book)
                          setDeleteOpen(true)
                        }}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                  <Separator></Separator>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* buat tambah dan edit buku */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Buku" : "Tambah Buku"}</DialogTitle>

            <DialogDescription>Isi informasi buku di bawah</DialogDescription>
          </DialogHeader>

          <form
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              handleSubmit()
            }}
          >
            <div className="flex flex-col gap-2">
              <Label htmlFor="judul">Judul*</Label>
              <Input
                id="judul"
                required
                value={form.judul}
                onChange={(event) => updateForm("judul", event.target.value)}
                placeholder="Judul buku"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="deskripsi">Deskripsi</Label>
              <Textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(event) =>
                  updateForm("deskripsi", event.target.value)
                }
                placeholder="Deskripsi buku"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="penulis">Penulis*</Label>
              <Input
                id="penulis"
                required
                value={form.penulis}
                onChange={(event) => updateForm("penulis", event.target.value)}
                placeholder="Nama penulis"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="penerbit">Penerbit</Label>
              <Input
                id="penerbit"
                value={form.penerbit}
                onChange={(event) => updateForm("penerbit", event.target.value)}
                placeholder="Nama penerbit"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="tahun_terbit">Tahun Terbit</Label>
              <Input
                id="tahun_terbit"
                type="number"
                min="0"
                value={form.tahun_terbit}
                onChange={(event) =>
                  updateForm("tahun_terbit", event.target.value)
                }
                placeholder="Min: 1901, Max: 2155"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="stok">Stok*</Label>
              <Input
                id="stok"
                type="number"
                min="0"
                required
                value={form.stok}
                onChange={(event) => updateForm("stok", event.target.value)}
                placeholder="Jumlah stok"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="category_id">Kategori*</Label>

              <Select
                value={form.category_id}
                onValueChange={(value) => {
                  if (value != null) {
                    updateForm("category_id", value)
                    // console.log(value)
                  }
                }}
                items={categories.map((category) => ({
                  value: String(category.id),
                  label: category.nama,
                }))}
              >
                <SelectTrigger id="category_id">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>

                <SelectContent>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Batal
              </Button>

              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Menyimpan..."
                  : editing
                    ? "Simpan Perubahan"
                    : "Tambah Buku"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail buku */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detail Buku</DialogTitle>
          </DialogHeader>

          {selectedBook && (
            <div className="flex flex-col gap-3">
              <div>
                <Label className="font-bold">Judul</Label>
                <p>{selectedBook.judul}</p>
              </div>

              <div>
                <Label className="font-bold">Deskripsi</Label>
                <p>{selectedBook.deskripsi || "-"}</p>
              </div>

              <div>
                <Label className="font-bold">Penulis</Label>
                <p>{selectedBook.penulis}</p>
              </div>

              <div>
                <Label className="font-bold">Penerbit</Label>
                <p>{selectedBook.penerbit || "-"}</p>
              </div>

              <div>
                <Label className="font-bold">Tahun Terbit</Label>
                <p>{selectedBook.tahun_terbit ?? "-"}</p>
              </div>

              <div>
                <Label className="font-bold">Stok</Label>
                <p>{selectedBook.stok}</p>
              </div>

              <div>
                <Label className="font-bold">Kategori</Label>
                <p>
                  {categories.find(
                    (category) => category.id === selectedBook.category_id
                  )?.nama ?? "Tidak diketahui"}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailOpen(false)}>Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* buat hapus */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus buku?</AlertDialogTitle>
            <AlertDialogDescription>
              Buku {selectedBook?.judul} akan dihapus dari daftar
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>

            <AlertDialogAction
              disabled={submitting}
              onClick={(event) => {
                event.preventDefault()
                handleDelete()
              }}
            >
              {submitting ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

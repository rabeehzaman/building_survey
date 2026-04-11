"use client"

import { useState, useEffect } from "react"
import { PlusIcon, TrashIcon } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  getShopCategories,
  addShopCategory,
  deleteShopCategory,
} from "@/lib/storage/survey-storage"

interface ShopCategoryManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCategoriesChange: () => void
}

export function ShopCategoryManager({
  open,
  onOpenChange,
  onCategoriesChange,
}: ShopCategoryManagerProps) {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [newName, setNewName] = useState("")
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState(false)

  async function loadCategories() {
    setLoading(true)
    try {
      const cats = await getShopCategories()
      setCategories(cats)
    } catch {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) loadCategories()
  }, [open])

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return

    setAdding(true)
    try {
      await addShopCategory(name)
      setNewName("")
      await loadCategories()
      onCategoriesChange()
      toast.success("Category added")
    } catch {
      toast.error("Failed to add category")
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteShopCategory(id)
      await loadCategories()
      onCategoriesChange()
      toast.success("Category removed")
    } catch {
      toast.error("Failed to remove category")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Shop Categories</DialogTitle>
          <DialogDescription>
            Add or remove shop categories
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
          />
          <Button onClick={handleAdd} disabled={adding || !newName.trim()} size="sm">
            {adding ? <Spinner /> : <PlusIcon />}
          </Button>
        </div>

        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
              >
                <span className="text-sm">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(cat.id)}
                >
                  <TrashIcon className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

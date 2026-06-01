"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { PriorityLabels } from "@/types/common";
import { Category } from "@/types/res/CategoryResponse";
import { useEffect, useState } from "react";

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onSave: (category: Category) => void;
  isLoading?: boolean;
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  category,
  onSave,
  isLoading
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState<Category | null>(null);

  useEffect(() => {
    if (category) {
        setFormData({ ...category });
    }
  }, [category]);

  const handleSave = () => {
    if (formData) {
        onSave(formData);
    }
  };

  if (!formData) return null;

  const isSystemCategory = formData.owner_account_id === 0;
  const isNew = formData.id === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isNew
              ? "Nova Categoria"
              : formData.priority_sort === 0
              ? "Configurar Categoria"
              : "Editar Categoria"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome</label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={isSystemCategory}
            />
            {isSystemCategory && (
              <p className="text-xs text-muted-foreground">
                Nome de categoria de sistema não pode ser alterado.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Prioridade</label>
            <Select
              value={String(formData.priority_sort)}
              onValueChange={(val) =>
                setFormData({ ...formData, priority_sort: Number(val) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a Prioridade" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PriorityLabels)
                  .filter(([k]) => Number(k) !== 0)
                  .map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isNew ? "Criar" : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

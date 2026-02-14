'use client';

import { GripVertical } from 'lucide-react';

interface PageReorderProps {
  images: File[];
  onReorder: (images: File[]) => void;
}

export function PageReorder({ images, onReorder }: PageReorderProps) {
  const moveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onReorder(newImages);
  };

  const moveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onReorder(newImages);
  };

  return (
    <div>
      <h3 className="text-sm font-medium">Arrange Pages</h3>
      <p className="text-xs text-muted-foreground">Drag to reorder pages in the correct sequence</p>
      <div className="mt-3 space-y-2">
        {images.map((img, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md border bg-white p-3">
            <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground" />
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-white">
              {i + 1}
            </span>
            <span className="flex-1 text-sm">{img.name}</span>
            <div className="flex gap-1">
              <button
                onClick={() => moveUp(i)}
                disabled={i === 0}
                className="rounded px-2 py-1 text-xs hover:bg-muted disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => moveDown(i)}
                disabled={i === images.length - 1}
                className="rounded px-2 py-1 text-xs hover:bg-muted disabled:opacity-30"
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { Camera, Sun, RotateCcw } from 'lucide-react';

export function ImageQualityCheck() {
  return (
    <div className="rounded-lg border bg-blue-50 p-4">
      <h3 className="text-sm font-medium text-blue-900">📸 Tips for best results</h3>
      <ul className="mt-2 space-y-2 text-sm text-blue-800">
        <li className="flex items-center gap-2">
          <Sun className="h-4 w-4" />
          Good lighting — avoid shadows on the page
        </li>
        <li className="flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Hold camera steady and directly above the paper
        </li>
        <li className="flex items-center gap-2">
          <RotateCcw className="h-4 w-4" />
          Make sure text is upright and not rotated
        </li>
      </ul>
    </div>
  );
}

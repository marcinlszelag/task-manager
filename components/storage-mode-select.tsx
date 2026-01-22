'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StorageMode } from '@/types';

interface StorageModeSelectProps {
  value: StorageMode;
  onChange: (value: StorageMode) => void;
}

export function StorageModeSelect({ value, onChange }: StorageModeSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as StorageMode)}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Storage mode" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="local">Local</SelectItem>
        <SelectItem value="notion">Notion</SelectItem>
        <SelectItem value="supabase">Supabase</SelectItem>
      </SelectContent>
    </Select>
  );
}

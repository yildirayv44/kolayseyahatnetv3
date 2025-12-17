"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface ArrayInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  helpText?: string;
}

export function ArrayInput({ label, value, onChange, placeholder, helpText }: ArrayInputProps) {
  const [newItem, setNewItem] = useState("");
  
  // Ensure value is always an array
  const safeValue = Array.isArray(value) ? value : [];

  const addItem = () => {
    if (newItem.trim()) {
      onChange([...safeValue, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeItem = (index: number) => {
    onChange(safeValue.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-900">{label}</label>
      
      {/* Existing items */}
      {safeValue.length > 0 && (
        <div className="space-y-2">
          {safeValue.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
            >
              <span className="flex-1 text-sm text-slate-700">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          placeholder={placeholder || "Yeni öğe ekle..."}
        />
        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Ekle
        </button>
      </div>

      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
}

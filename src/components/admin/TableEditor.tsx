"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

interface TableEditorProps {
  onInsert: (tableHtml: string) => void;
  onClose: () => void;
}

export function TableEditor({ onInsert, onClose }: TableEditorProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  const [tableData, setTableData] = useState<string[][]>([
    ['Başlık 1', 'Başlık 2', 'Başlık 3'],
    ['Hücre 1', 'Hücre 2', 'Hücre 3'],
    ['Hücre 4', 'Hücre 5', 'Hücre 6'],
  ]);

  const updateCell = (row: number, col: number, value: string) => {
    const newData = [...tableData];
    newData[row][col] = value;
    setTableData(newData);
  };

  const addRow = () => {
    const newRow = Array(cols).fill('');
    setTableData([...tableData, newRow]);
    setRows(rows + 1);
  };

  const addColumn = () => {
    const newData = tableData.map(row => [...row, '']);
    setTableData(newData);
    setCols(cols + 1);
  };

  const removeRow = (index: number) => {
    if (tableData.length <= 1) return;
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
    setRows(rows - 1);
  };

  const removeColumn = (index: number) => {
    if (cols <= 1) return;
    const newData = tableData.map(row => row.filter((_, i) => i !== index));
    setTableData(newData);
    setCols(cols - 1);
  };

  const generateTableHTML = () => {
    let html = '<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">\n';
    
    tableData.forEach((row, rowIndex) => {
      html += '  <tr>\n';
      row.forEach((cell, colIndex) => {
        const tag = hasHeader && rowIndex === 0 ? 'th' : 'td';
        const style = 'border: 1px solid #ddd; padding: 12px; text-align: left;';
        const headerStyle = hasHeader && rowIndex === 0 ? ' background-color: #f8f9fa; font-weight: bold;' : '';
        html += `    <${tag} style="${style}${headerStyle}">${cell || '&nbsp;'}</${tag}>\n`;
      });
      html += '  </tr>\n';
    });
    
    html += '</table>';
    return html;
  };

  const handleInsert = () => {
    const tableHtml = generateTableHTML();
    onInsert(tableHtml);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tablo Düzenleyici</h2>
            <p className="text-sm text-slate-600 mt-1">Tablonuzu oluşturun ve özelleştirin</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Controls */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(e) => setHasHeader(e.target.checked)}
                className="rounded border-slate-300"
              />
              <span className="text-sm font-medium text-slate-700">Başlık satırı</span>
            </label>

            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Satır Ekle
            </button>

            <button
              onClick={addColumn}
              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Sütun Ekle
            </button>

            <div className="text-sm text-slate-600">
              {rows} satır × {cols} sütun
            </div>
          </div>

          {/* Table Editor */}
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full">
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border border-slate-200 p-2 ${
                          hasHeader && rowIndex === 0 ? 'bg-slate-50 font-semibold' : ''
                        }`}
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                          className="w-full px-2 py-1 border-0 focus:ring-2 focus:ring-blue-500 rounded"
                          placeholder={hasHeader && rowIndex === 0 ? `Başlık ${colIndex + 1}` : 'Hücre'}
                        />
                      </td>
                    ))}
                    <td className="border border-slate-200 p-2 bg-slate-50">
                      <button
                        onClick={() => removeRow(rowIndex)}
                        disabled={tableData.length <= 1}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Satırı sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  {Array(cols).fill(0).map((_, colIndex) => (
                    <td key={colIndex} className="border border-slate-200 p-2 bg-slate-50 text-center">
                      <button
                        onClick={() => removeColumn(colIndex)}
                        disabled={cols <= 1}
                        className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Sütunu sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  ))}
                  <td className="border border-slate-200 p-2 bg-slate-100"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Preview */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Önizleme:</h3>
            <div 
              className="border border-slate-200 rounded-lg p-4 bg-slate-50"
              dangerouslySetInnerHTML={{ __html: generateTableHTML() }}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors font-semibold"
            >
              İptal
            </button>
            <button
              onClick={handleInsert}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Tabloyu Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

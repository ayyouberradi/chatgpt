import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Edit, Trash2, Plus, X, ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string | number; displayOrder?: number }> {
  data: T[];
  columns: Column<T>[];
  onEdit: (item: T) => void;
  onDelete: (id: string | number) => void;
  onAdd: () => void;
  onReorder?: (items: T[]) => void;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string | number; displayOrder?: number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onAdd,
  onReorder,
  isLoading,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('displayOrder');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = (a as Record<string, unknown>)[sortKey];
    const bValue = (b as Record<string, unknown>)[sortKey];

    if (aValue === undefined || bValue === undefined) return 0;

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    const aStr = String(aValue);
    const bStr = String(bValue);
    return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (!onReorder) return;
    const newData = [...sortedData];
    if (direction === 'up' && index > 0) {
      [newData[index], newData[index - 1]] = [newData[index - 1], newData[index]];
    } else if (direction === 'down' && index < newData.length - 1) {
      [newData[index], newData[index + 1]] = [newData[index + 1], newData[index]];
    }
    onReorder(newData.map((item, i) => ({ ...item, displayOrder: i })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">{data.length} items</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAdd}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add New
        </motion.button>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: 'var(--muted)' }}>
            <tr>
              {onReorder && <th className="text-left px-6 py-4 text-sm font-medium text-secondary w-12" />}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="text-left px-6 py-4 text-sm font-medium text-secondary"
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={() => handleSort(String(column.key))}
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {column.label}
                      <ArrowUpDown size={14} />
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
              <th className="text-right px-6 py-4 text-sm font-medium text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-12 text-center">
                  <div className="w-8 h-8 rounded-full animate-spin mx-auto border-2 border-muted border-t-primary" />
                </td>
              </tr>
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-6 py-12 text-center text-muted">
                  No items found. Click "Add New" to create one.
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  style={{ borderTop: '1px solid var(--border)' }}
                  className="hover:bg-surface-muted transition-colors"
                >
                  {onReorder && (
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-surface-muted disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => moveItem(index, 'down')}
                          disabled={index === sortedData.length - 1}
                          className="p-1 rounded hover:bg-surface-muted disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 text-sm">
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                    </td>
                  ))}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(item)}
                        className="p-2 rounded-lg hover:bg-surface-muted transition-colors"
                      >
                        <Edit size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this item?')) {
                            onDelete(item.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors text-red-500"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[98vw] sm:max-w-lg md:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-2xl rounded-t-3xl"
            style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()} // Prevent overlay from closing when clicking inside modal
          >
            <div className="sticky top-0 flex items-center justify-between p-4 sm:p-6 border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-muted transition-colors" style={{ color: 'var(--foreground)' }}>
                <X size={20} />
              </button>
            </div>
            <div className="p-4 sm:p-6" style={{ color: 'var(--foreground)' }}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Form components
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>{label}</label>
      {children}
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-colors ${props.className || ''}`}
      style={{
        border: error ? '1px solid #ef4444' : '1px solid var(--border)',
        backgroundColor: 'var(--muted)',
        color: 'var(--foreground)',
      }}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export function Textarea({ error, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full px-4 py-3 rounded-xl outline-none transition-colors resize-none ${props.className || ''}`}
      style={{
        border: error ? '1px solid #ef4444' : '1px solid var(--border)',
        backgroundColor: 'var(--muted)',
        color: 'var(--foreground)',
      }}
    />
  );
}

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        className="w-12 h-6 rounded-full relative transition-colors"
        style={{ backgroundColor: checked ? 'var(--accent)' : 'var(--muted)' }}
        onClick={() => onChange(!checked)}
      >
        <motion.div
          animate={{ x: checked ? 24 : 2 }}
          className="absolute top-1 w-4 h-4 rounded-full bg-white"
        />
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
}

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  label?: string;
}

export function TagInput({ tags, onChange, label }: TagInputProps) {
  const [input, setInput] = useState('');

  const parseItems = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const normalizedTags = tags.reduce<string[]>((acc, tag) => {
    parseItems(tag).forEach((item) => {
      if (!acc.includes(item)) {
        acc.push(item);
      }
    });
    return acc;
  }, []);

  const addTags = (value: string) => {
    const items = parseItems(value);

    if (items.length === 0) {
      setInput('');
      return;
    }

    const nextTags = [...normalizedTags];

    items.forEach((item) => {
      if (!nextTags.includes(item)) {
        nextTags.push(item);
      }
    });

    onChange(nextTags);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(normalizedTags.filter((t) => t !== tag));
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <div className="flex flex-wrap gap-2 mb-2">
        {normalizedTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full"
            style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            {tag}
            <button onClick={() => removeTag(tag)} className="hover:text-red-500">
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => {
            const value = e.target.value;

            if (value.includes(',')) {
              const endsWithComma = value.endsWith(',');
              const items = parseItems(value);

              if (items.length > 1 || endsWithComma) {
                addTags(value);
                return;
              }
            }

            setInput(value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTags(input);
            }
          }}
          onBlur={() => {
            if (input.trim()) {
              addTags(input);
            }
          }}
          placeholder="Add one or more items separated by commas"
        />
        <button
          type="button"
          onClick={() => addTags(input)}
          className="btn-secondary px-4"
        >
          Add
        </button>
      </div>
    </div>
  );
}

interface ActionButtonsProps {
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  saveLabel?: string;
}

export function ActionButtons({ onSave, onCancel, isSaving, saveLabel = 'Save' }: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-4 mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary px-6"
      >
        Cancel
      </button>
      <motion.button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="btn-primary px-6 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : saveLabel}
      </motion.button>
    </div>
  );
}

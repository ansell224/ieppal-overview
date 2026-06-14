import { useState, useRef } from 'react';
import { UploadCloud, FileText, FileImage, X } from 'lucide-react';

const ALLOWED = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'text/plain': 'TXT',
};
const MAX_BYTES = 20 * 1024 * 1024;
const MAX_FILES = 5;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function DocumentDropzone({ files, onFilesChange, disabled }) {
  const [isOver, setIsOver] = useState(false);
  const [rejections, setRejections] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = (incoming) => {
    const newFiles = [];
    const rejected = [];
    for (const f of incoming) {
      if (!ALLOWED[f.type]) {
        rejected.push({ name: f.name, reason: 'unsupported type' });
        continue;
      }
      if (f.size > MAX_BYTES) {
        rejected.push({ name: f.name, reason: 'too large (max 20 MB)' });
        continue;
      }
      newFiles.push(f);
    }
    const combined = [...files, ...newFiles];
    if (combined.length > MAX_FILES) {
      rejected.push({ name: 'batch', reason: `only ${MAX_FILES} files allowed` });
    }
    setRejections(rejected);
    onFilesChange(combined.slice(0, MAX_FILES));
  };

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => !disabled && (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsOver(true); }}
        onDragLeave={() => setIsOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsOver(false);
          if (disabled) return;
          handleFiles(Array.from(e.dataTransfer.files));
        }}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
          isOver ? 'border-indigo-400 bg-indigo-500/10' : 'border-neutral-300 dark:border-zinc-700 hover:border-neutral-400 dark:hover:border-zinc-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <UploadCloud className="mx-auto mb-2 text-neutral-400 dark:text-zinc-400" size={32} />
        <p className="text-sm text-neutral-700 dark:text-zinc-200">Drop files here or click to browse</p>
        <p className="text-xs text-neutral-500 dark:text-zinc-500 mt-1">PDF, DOCX, JPG, PNG, WebP, TXT · up to 20 MB each · max 5 files</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={Object.keys(ALLOWED).join(',')}
          disabled={disabled}
          className="hidden"
          onChange={(e) => handleFiles(Array.from(e.target.files || []))}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f, i) => {
            const Icon = f.type.startsWith('image/') ? FileImage : FileText;
            return (
              <li key={`${f.name}-${i}`} className="flex items-center gap-2 p-2 rounded-md bg-neutral-100 dark:bg-zinc-800/50 border border-neutral-200 dark:border-zinc-700">
                <Icon size={16} className="text-neutral-500 dark:text-zinc-400 shrink-0" />
                <span className="text-sm text-neutral-800 dark:text-zinc-200 truncate flex-1">{f.name}</span>
                <span className="text-xs text-neutral-500 dark:text-zinc-500 shrink-0">{formatSize(f.size)}</span>
                <button
                  type="button"
                  onClick={() => onFilesChange(files.filter((_, j) => j !== i))}
                  disabled={disabled}
                  className="p-1 text-neutral-400 dark:text-zinc-500 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-50"
                  aria-label={`Remove ${f.name}`}
                >
                  <X size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {rejections.length > 0 && (
        <ul className="mt-3 space-y-1">
          {rejections.map((r, i) => (
            <li key={i} className="text-xs text-rose-500 dark:text-rose-400">
              Rejected: {r.name}. {r.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

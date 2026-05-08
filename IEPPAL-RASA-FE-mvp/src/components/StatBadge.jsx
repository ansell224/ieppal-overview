import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

function InfoPopover({ title, whatItIs, howToRead }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={`About ${title}`}
        className="p-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 focus:outline-none focus:text-neutral-700"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="absolute z-30 right-0 top-6 w-72 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg p-4 text-left"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-pink-600 dark:text-pink-400 mb-1.5">{title}</p>
          <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed mb-2">
            <span className="font-semibold">What it is: </span>{whatItIs}
          </p>
          <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed">
            <span className="font-semibold">How to read it: </span>{howToRead}
          </p>
        </div>
      )}
    </div>
  );
}

export default function StatBadge({ mathLabel, mathValue, interpretation, reliable, info, footnote }) {
  const tintBorder =
    reliable === true ? 'border-emerald-300 dark:border-emerald-500/40'
    : reliable === false ? 'border-amber-300 dark:border-amber-500/40'
    : 'border-neutral-200 dark:border-neutral-700';
  const tintText =
    reliable === true ? 'text-emerald-600 dark:text-emerald-400'
    : reliable === false ? 'text-amber-600 dark:text-amber-400'
    : 'text-neutral-900 dark:text-neutral-100';

  return (
    <div className={`relative rounded-xl px-4 py-3 bg-white dark:bg-neutral-800 border ${tintBorder}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400 dark:text-neutral-500 leading-tight">
          {mathLabel}
        </p>
        {info && <InfoPopover {...info} />}
      </div>
      {mathValue && (
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1 tabular-nums">{mathValue}</p>
      )}
      <p className={`font-serif text-lg leading-snug mt-1 ${tintText}`}>{interpretation ?? '-'}</p>
      {footnote && (
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed pt-2 border-t border-neutral-100 dark:border-neutral-700">
          <span className="font-semibold">How this was decided: </span>{footnote}
        </p>
      )}
    </div>
  );
}

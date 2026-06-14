import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Clock } from "lucide-react";

const POPOVER_WIDTH = 220;
const POPOVER_HEIGHT = 280;
const VIEWPORT_MARGIN = 12;
const MINUTE_STEP = 10;

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: Math.floor(60 / MINUTE_STEP) }, (_, i) => i * MINUTE_STEP);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTimeInput(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function parseTime(value) {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { h, m };
}

function validateTime(value) {
  if (!value) return null;
  if (!/^\d{2}:\d{2}$/.test(value)) return "Use HH:MM";
  if (!parseTime(value)) return "Enter a valid time";
  return null;
}

export default function TimeFieldInput({
  value = "",
  onChange,
  className = "",
  name,
  placeholder = "HH:MM",
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const popoverRef = useRef(null);
  const inputRef = useRef(null);
  const hourColRef = useRef(null);
  const minuteColRef = useRef(null);

  const parsed = useMemo(() => parseTime(value), [value]);

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [error, setError] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setInputValue(value || "");
    setError("");
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const insideWrapper = wrapperRef.current?.contains(event.target);
      const insidePopover = popoverRef.current?.contains(event.target);
      if (!insideWrapper && !insidePopover) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const updatePosition = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < POPOVER_HEIGHT && rect.top > spaceBelow;
    const top = dropUp
      ? Math.max(VIEWPORT_MARGIN, rect.top - POPOVER_HEIGHT - 8)
      : Math.min(window.innerHeight - POPOVER_HEIGHT - VIEWPORT_MARGIN, rect.bottom + 8);
    const left = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.left),
      window.innerWidth - POPOVER_WIDTH - VIEWPORT_MARGIN,
    );
    setPosition({ top, left });
  };

  const openPopover = () => {
    if (disabled) return;
    updatePosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const handleViewport = () => updatePosition();
    window.addEventListener("resize", handleViewport);
    window.addEventListener("scroll", handleViewport, true);
    return () => {
      window.removeEventListener("resize", handleViewport);
      window.removeEventListener("scroll", handleViewport, true);
    };
  }, [open]);

  // Auto-scroll the selected row into view when the popover opens.
  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => {
      const selectedHour = hourColRef.current?.querySelector("[data-selected='true']");
      const selectedMinute = minuteColRef.current?.querySelector("[data-selected='true']");
      selectedHour?.scrollIntoView({ block: "center" });
      selectedMinute?.scrollIntoView({ block: "center" });
    });
  }, [open]);

  const handleInputChange = (event) => {
    const next = formatTimeInput(event.target.value);
    setInputValue(next);
    setError("");
    if (!next) {
      onChange?.("");
      return;
    }
    if (next.length === 5) {
      const validationError = validateTime(next);
      if (validationError) {
        setError(validationError);
        return;
      }
      onChange?.(next);
    }
  };

  const handleBlur = (event) => {
    const nextFocusedElement = event.relatedTarget;
    if (
      nextFocusedElement &&
      (wrapperRef.current?.contains(nextFocusedElement) ||
        popoverRef.current?.contains(nextFocusedElement))
    ) {
      return;
    }
    if (!inputValue) {
      setError("");
      return;
    }
    const validationError = validateTime(inputValue);
    if (validationError) {
      setError(validationError);
      setInputValue(value || "");
      return;
    }
    onChange?.(inputValue);
  };

  const selectedHour = parsed?.h ?? null;
  // Snap the shown minute to the nearest 10-minute increment.
  const selectedMinute = parsed
    ? MINUTES.reduce((prev, curr) => (Math.abs(curr - parsed.m) < Math.abs(prev - parsed.m) ? curr : prev), MINUTES[0])
    : null;

  const commit = (h, m) => {
    const next = `${pad2(h)}:${pad2(m)}`;
    setInputValue(next);
    setError("");
    onChange?.(next);
  };

  const onPickHour = (h) => {
    const m = selectedMinute ?? 0;
    commit(h, m);
  };

  const onPickMinute = (m) => {
    const h = selectedHour ?? 0;
    commit(h, m);
    setOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={inputValue}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="numeric"
          autoComplete="off"
          onClick={openPopover}
          onFocus={openPopover}
          onChange={handleInputChange}
          onBlur={handleBlur}
          aria-invalid={error ? "true" : "false"}
          className={`${className} ${error ? "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500" : ""} pr-10`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => (open ? setOpen(false) : openPopover())}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:cursor-not-allowed"
          aria-label="Open time picker"
        >
          <Clock className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      ) : null}

      {open && !disabled
        ? createPortal(
            <div
              ref={popoverRef}
              className="fixed z-[1000] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl overflow-hidden"
              style={{ top: position.top, left: position.left, width: POPOVER_WIDTH }}
            >
              <div className="grid grid-cols-2 divide-x divide-neutral-200 dark:divide-neutral-700">
                <div className="flex flex-col">
                  <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                    Hour
                  </div>
                  <ul ref={hourColRef} className="max-h-60 overflow-y-auto py-1">
                    {HOURS.map((h) => {
                      const selected = h === selectedHour;
                      return (
                        <li key={h}>
                          <button
                            type="button"
                            data-selected={selected}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onPickHour(h)}
                            className={`w-full text-center py-1.5 text-sm transition-colors ${
                              selected
                                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            }`}
                          >
                            {pad2(h)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                <div className="flex flex-col">
                  <div className="px-3 pt-2 pb-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                    Minute
                  </div>
                  <ul ref={minuteColRef} className="max-h-60 overflow-y-auto py-1">
                    {MINUTES.map((m) => {
                      const selected = m === selectedMinute;
                      return (
                        <li key={m}>
                          <button
                            type="button"
                            data-selected={selected}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => onPickMinute(m)}
                            className={`w-full text-center py-1.5 text-sm transition-colors ${
                              selected
                                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                                : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                            }`}
                          >
                            {pad2(m)}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

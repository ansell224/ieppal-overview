import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const CALENDAR_WIDTH = 280;
const CALENDAR_HEIGHT = 320;
const VIEWPORT_MARGIN = 12;

function formatDateInput(rawValue) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

function parseIsoDate(value) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function validateIsoDate(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return "Use YYYY-MM-DD format";

  const parsed = parseIsoDate(value);
  if (!parsed) return "Enter a valid date";

  return null;
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DateFieldInput({
  value = "",
  onChange,
  className = "",
  name,
  placeholder = "YYYY-MM-DD",
  disabled = false,
}) {
  const wrapperRef = useRef(null);
  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  const parsedValue = useMemo(() => parseIsoDate(value), [value]);

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");
  const [error, setError] = useState("");
  const [viewDate, setViewDate] = useState(parsedValue || new Date());
  const [dropUp, setDropUp] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState({
    top: 0,
    left: 0,
    width: CALENDAR_WIDTH,
  });

  useEffect(() => {
    setInputValue(value || "");
    setError("");
  }, [value]);

  useEffect(() => {
    if (parsedValue) {
      setViewDate(parsedValue);
    }
  }, [parsedValue]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideWrapper = wrapperRef.current?.contains(event.target);
      const clickedInsideCalendar = calendarRef.current?.contains(event.target);

      if (!clickedInsideWrapper && !clickedInsideCalendar) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const updateCalendarPosition = () => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldDropUp = spaceBelow < CALENDAR_HEIGHT && rect.top > spaceBelow;
    const nextTop = shouldDropUp
      ? Math.max(VIEWPORT_MARGIN, rect.top - CALENDAR_HEIGHT - 8)
      : Math.min(window.innerHeight - CALENDAR_HEIGHT - VIEWPORT_MARGIN, rect.bottom + 8);
    const nextLeft = Math.min(
      Math.max(VIEWPORT_MARGIN, rect.left),
      window.innerWidth - CALENDAR_WIDTH - VIEWPORT_MARGIN
    );

    setDropUp(shouldDropUp);
    setCalendarPosition({
      top: nextTop,
      left: nextLeft,
      width: CALENDAR_WIDTH,
    });
  };

  const openCalendar = () => {
    if (disabled) return;
    updateCalendarPosition();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    updateCalendarPosition();

    const handleViewportChange = () => updateCalendarPosition();
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [open]);

  const handleInputChange = (event) => {
    const nextValue = formatDateInput(event.target.value);
    setInputValue(nextValue);
    setError("");

    if (!nextValue) {
      onChange?.("");
      return;
    }

    if (nextValue.length === 10) {
      const validationError = validateIsoDate(nextValue);
      if (validationError) {
        setError(validationError);
        return;
      }
      onChange?.(nextValue);
    }
  };

  const handleBlur = (event) => {
    const nextFocusedElement = event.relatedTarget;

    if (
      nextFocusedElement &&
      (wrapperRef.current?.contains(nextFocusedElement) ||
        calendarRef.current?.contains(nextFocusedElement))
    ) {
      return;
    }

    if (!inputValue) {
      setError("");
      return;
    }

    const validationError = validateIsoDate(inputValue);
    if (validationError) {
      setError(validationError);
      setInputValue(value || "");
      return;
    }

    onChange?.(inputValue);
  };

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const days = [];
  for (let i = 0; i < firstDay; i += 1) days.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) days.push(day);

  const selectDay = (day) => {
    const nextValue = toIsoDate(new Date(year, month, day));
    setInputValue(nextValue);
    setError("");
    onChange?.(nextValue);
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
          onClick={openCalendar}
          onFocus={openCalendar}
          onChange={handleInputChange}
          onBlur={handleBlur}
          aria-invalid={error ? "true" : "false"}
          className={`${className} ${error ? "border-red-400 dark:border-red-500 focus:border-red-400 dark:focus:border-red-500 focus:ring-red-400 dark:focus:ring-red-500" : ""} pr-10`}
        />
        <button
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) {
              setOpen(false);
            } else {
              openCalendar();
            }
          }}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 disabled:cursor-not-allowed"
          aria-label="Open date picker"
        >
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {error ? (
        <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>
      ) : null}

      {open && !disabled
        ? createPortal(
        <div
          ref={calendarRef}
          className="fixed z-[1000] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-xl p-3"
          style={{
            top: calendarPosition.top,
            left: calendarPosition.left,
            width: calendarPosition.width,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {monthLabel}
            </div>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-700"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 text-center">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
              <div key={label} className="py-1">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) =>
              day ? (
                <button
                  key={`${monthLabel}-${day}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectDay(day)}
                  className={`h-9 rounded-lg text-sm transition-colors ${
                    value === toIsoDate(new Date(year, month, day))
                      ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                      : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                >
                  {day}
                </button>
              ) : (
                <div key={`empty-${index}`} className="h-9" />
              )
            )}
          </div>
          <div className={`mt-2 text-[11px] text-neutral-400 dark:text-neutral-500 ${dropUp ? "text-right" : ""}`}>
            Enter or pick a date in YYYY-MM-DD
          </div>
        </div>,
        document.body
      )
        : null}
    </div>
  );
}

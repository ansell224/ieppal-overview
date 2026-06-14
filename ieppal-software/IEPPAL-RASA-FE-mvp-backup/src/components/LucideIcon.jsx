import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Brain,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Copy,
  Edit2,
  Eye,
  FileText,
  GraduationCap,
  GripVertical,
  Heart,
  ListChecks,
  Mic,
  MicOff,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  Shield,
  SlidersHorizontal,
  Trash2,
  Type,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { lucideDynamicImports } from "../data/lucideDynamicImports";

const staticIconMap = {
  "alert-triangle": AlertTriangle,
  "arrow-left": ArrowLeft,
  "bar-chart-3": BarChart3,
  brain: Brain,
  "book-open": BookOpen,
  calendar: Calendar,
  "check-circle": CheckCircle,
  "chevron-down": ChevronDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  compass: Compass,
  copy: Copy,
  "edit-2": Edit2,
  eye: Eye,
  "file-text": FileText,
  "graduation-cap": GraduationCap,
  "grip-vertical": GripVertical,
  heart: Heart,
  "list-checks": ListChecks,
  mic: Mic,
  "mic-off": MicOff,
  pen: Pencil,
  pencil: Pencil,
  plus: Plus,
  search: Search,
  send: Send,
  settings: Settings,
  shield: Shield,
  "sliders-horizontal": SlidersHorizontal,
  "trash-2": Trash2,
  type: Type,
  "user-plus": UserPlus,
  users: Users,
  x: X,
};

export default function LucideIcon({ name, className, strokeWidth = 1.5 }) {
  const [IconComponent, setIconComponent] = useState(() => BookOpen);

  useEffect(() => {
    let cancelled = false;
    const resolvedName = name || "book-open";
    const staticIcon = staticIconMap[resolvedName];

    if (staticIcon) {
      setIconComponent(() => staticIcon);
      return () => {
        cancelled = true;
      };
    }

    const loadIcon = lucideDynamicImports[resolvedName];

    if (!loadIcon) {
      setIconComponent(() => BookOpen);
      return () => {
        cancelled = true;
      };
    }

    loadIcon()
      .then((module) => {
        if (!cancelled && module?.default) {
          setIconComponent(() => module.default);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIconComponent(() => BookOpen);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [name]);

  return <IconComponent className={className} strokeWidth={strokeWidth} />;
}

import {
  BookOpenText,
  Calculator,
  FlaskConical,
  Palette,
  Music,
  Globe,
  Brain,
  Languages,
  PencilLine,
  Laptop,
  Dumbbell,
  Drama,
  Heart,
  Ruler,
  Sprout,
  Library,
  Presentation,
  Users,
} from 'lucide-react';

export const CLASSROOM_ICONS = [
  { id: 'book', label: 'Reading', Icon: BookOpenText },
  { id: 'calculator', label: 'Math', Icon: Calculator },
  { id: 'flask', label: 'Science', Icon: FlaskConical },
  { id: 'palette', label: 'Art', Icon: Palette },
  { id: 'music', label: 'Music', Icon: Music },
  { id: 'globe', label: 'Geography', Icon: Globe },
  { id: 'brain', label: 'Special Ed', Icon: Brain },
  { id: 'languages', label: 'Languages', Icon: Languages },
  { id: 'pencil', label: 'Writing', Icon: PencilLine },
  { id: 'laptop', label: 'Technology', Icon: Laptop },
  { id: 'dumbbell', label: 'PE / Sports', Icon: Dumbbell },
  { id: 'drama', label: 'Drama', Icon: Drama },
  { id: 'heart', label: 'Health / SEL', Icon: Heart },
  { id: 'ruler', label: 'Design', Icon: Ruler },
  { id: 'sprout', label: 'Life Skills', Icon: Sprout },
  { id: 'library', label: 'Library', Icon: Library },
  { id: 'presentation', label: 'General', Icon: Presentation },
  { id: 'users', label: 'Group', Icon: Users },
];

const iconMap = Object.fromEntries(
  CLASSROOM_ICONS.map(({ id, Icon }) => [id, Icon])
);

export const getClassroomIcon = (iconId) => iconMap[iconId] || BookOpenText;

const labelMap = Object.fromEntries(
  CLASSROOM_ICONS.map(({ id, label }) => [id, label])
);

export const getClassroomIconLabel = (iconId) => labelMap[iconId] || 'Reading';

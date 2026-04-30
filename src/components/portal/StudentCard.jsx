import { clsx } from 'clsx';

const avatarColors = [
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-pink-100 text-pink-700',
  'bg-purple-100 text-purple-700',
  'bg-teal-100 text-teal-700',
  'bg-orange-100 text-orange-700',
  'bg-indigo-100 text-indigo-700',
];

function getAvatarColor(name) {
  const index = name?.charCodeAt(0) || 0;
  return avatarColors[index % avatarColors.length];
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export default function StudentCard({ student, isActive, onClick }) {
  const colorClass = getAvatarColor(student.name);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300',
        'border border-transparent hover:border-green-200',
        isActive
          ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-l-green-600 shadow-sm'
          : 'hover:bg-gray-50 hover:translate-x-1'
      )}
    >
      <div className={clsx(
        'w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0',
        colorClass
      )}>
        {getInitials(student.name)}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <h4 className="font-semibold text-gray-800 text-sm truncate">{student.name}</h4>
        <p className="text-xs text-gray-500 truncate">
          {student.class} · {student.studentId}
        </p>
      </div>
      <svg
        className={clsx(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive ? 'text-green-600' : 'text-gray-300'
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
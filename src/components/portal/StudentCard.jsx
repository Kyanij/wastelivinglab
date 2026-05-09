import { clsx } from 'clsx';
import StudentAvatar from '../ui/StudentAvatar';
import { getClassGradient } from '../../utils/studentUtils';

export default function StudentCard({ student, isActive, onClick }) {
  const classGradient = getClassGradient(student.class);

  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 group',
        'border border-transparent hover:border-green-200',
        isActive
          ? 'bg-gradient-to-r from-green-50 to-green-100/50 border-l-4 border-l-green-600 shadow-sm'
          : 'hover:bg-gray-50 hover:translate-x-1'
      )}
    >
      <div className={clsx(
        'transition-all duration-300 group-hover:scale-110',
        isActive ? 'ring-2 ring-green-400 rounded-full' : ''
      )}>
        <StudentAvatar name={student.name} cls={student.class} size="md" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <h4 className={clsx(
          'font-semibold text-sm truncate transition-colors',
          isActive ? 'text-green-800' : 'text-gray-800 group-hover:text-green-700'
        )}>
          {student.name}
        </h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={clsx(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold transition-all',
            isActive 
              ? `bg-gradient-to-r ${classGradient} text-white shadow-sm` 
              : `bg-gray-100 text-gray-600 group-hover:bg-gradient-to-r group-hover:${classGradient} group-hover:text-white`
          )}>
            {student.class}
          </span>
          <span className="text-xs text-gray-400">{student.studentId}</span>
        </div>
      </div>
      <svg
        className={clsx(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive ? 'text-green-600' : 'text-gray-300 group-hover:text-green-500'
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
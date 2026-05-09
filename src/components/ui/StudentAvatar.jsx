import { getInitials, getAvatarColor } from '../../utils/studentUtils';

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
};

export default function StudentAvatar({ name, cls, size = 'md', className = '' }) {
  const initials = getInitials(name);
  const color = getAvatarColor(name, cls);

  return (
    <div 
      className={`
        ${sizeClasses[size] || sizeClasses.md}
        rounded-full bg-gradient-to-br ${color.from} ${color.to} 
        flex items-center justify-center 
        ring-2 ${color.ring}
        shadow-md ${color.shadow}
        transition-all duration-300 
        hover:scale-110 hover:shadow-lg hover:shadow-${color.ring.replace('/30', '/40')}
        group
      `}
      title={name}
    >
      <span className={`font-bold ${color.text} transition-transform duration-300 group-hover:scale-110`}>
        {initials}
      </span>
    </div>
  );
}
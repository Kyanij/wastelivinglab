export const avatarColorSchemes = [
  { from: 'from-amber-100', to: 'to-orange-200', text: 'text-amber-700', ring: 'ring-amber-400/30', shadow: 'shadow-amber-200/50' },
  { from: 'from-sky-100', to: 'to-blue-200', text: 'text-sky-700', ring: 'ring-sky-400/30', shadow: 'shadow-sky-200/50' },
  { from: 'from-rose-100', to: 'to-pink-200', text: 'text-rose-700', ring: 'ring-rose-400/30', shadow: 'shadow-rose-200/50' },
  { from: 'from-violet-100', to: 'to-purple-200', text: 'text-violet-700', ring: 'ring-violet-400/30', shadow: 'shadow-violet-200/50' },
  { from: 'from-teal-100', to: 'to-cyan-200', text: 'text-teal-700', ring: 'ring-teal-400/30', shadow: 'shadow-teal-200/50' },
  { from: 'from-emerald-100', to: 'to-green-200', text: 'text-emerald-700', ring: 'ring-emerald-400/30', shadow: 'shadow-emerald-200/50' },
  { from: 'from-lime-100', to: 'to-emerald-200', text: 'text-lime-700', ring: 'ring-lime-400/30', shadow: 'shadow-lime-200/50' },
  { from: 'from-fuchsia-100', to: 'to-pink-200', text: 'text-fuchsia-700', ring: 'ring-fuchsia-400/30', shadow: 'shadow-fuchsia-200/50' },
  { from: 'from-indigo-100', to: 'to-blue-200', text: 'text-indigo-700', ring: 'ring-indigo-400/30', shadow: 'shadow-indigo-200/50' },
  { from: 'from-cyan-100', to: 'to-sky-200', text: 'text-cyan-700', ring: 'ring-cyan-400/30', shadow: 'shadow-cyan-200/50' },
  { from: 'from-orange-100', to: 'to-amber-200', text: 'text-orange-700', ring: 'ring-orange-400/30', shadow: 'shadow-orange-200/50' },
  { from: 'from-slate-100', to: 'to-gray-200', text: 'text-slate-700', ring: 'ring-slate-400/30', shadow: 'shadow-slate-200/50' },
];

export function getInitials(name) {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getAvatarColor(name, cls) {
  if (!name && !cls) return avatarColorSchemes[0];
  const str = `${name || ''}${cls || ''}`.toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % avatarColorSchemes.length;
  return avatarColorSchemes[index];
}

export function getClassGradient(cls) {
  if (!cls) return 'from-gray-400 to-gray-500';
  const num = parseInt(cls.replace(/[^0-9]/g, '')) || 6;
  const letter = cls.replace(/[^a-zA-Z]/g, '').toUpperCase() || 'A';
  
  const colorMaps = {
    6: { A: 'from-green-400 to-emerald-500', B: 'from-teal-400 to-cyan-500', C: 'from-emerald-400 to-green-500' },
    7: { A: 'from-blue-400 to-indigo-500', B: 'from-violet-400 to-purple-500', C: 'from-indigo-400 to-blue-500' },
    8: { A: 'from-purple-400 to-violet-500', B: 'from-fuchsia-400 to-pink-500', C: 'from-rose-400 to-red-500' },
    9: { A: 'from-amber-400 to-orange-500', B: 'from-yellow-400 to-amber-500', C: 'from-orange-400 to-red-500' },
    10: { A: 'from-rose-400 to-pink-500', B: 'from-cyan-400 to-teal-500', C: 'from-lime-400 to-green-600' },
  };
  
  const gradeMap = colorMaps[num] || colorMaps[6];
  return gradeMap[letter] || 'from-gray-400 to-gray-500';
}
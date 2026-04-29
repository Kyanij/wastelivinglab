export default function StudentInfoCard({ student }) {
  if (!student) return null;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=16a34a&color=fff&size=128`;

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <img
        src={student.photoURL || defaultAvatar}
        alt={student.name}
        className="w-16 h-16 rounded-full object-cover border-2 border-green-100"
      />
      <div className="flex-1">
        <h2 className="text-xl font-bold text-gray-800">{student.name}</h2>
        <p className="text-sm text-gray-500">
          Class: {student.class} | Roll No: {student.rollNo}
        </p>
      </div>
      <span className="px-3 py-1 text-sm font-medium bg-green-100 text-green-700 rounded-full">
        {student.class}
      </span>
    </div>
  );
}
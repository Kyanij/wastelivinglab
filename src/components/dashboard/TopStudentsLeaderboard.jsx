import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Trophy } from 'lucide-react';

export default function TopStudentsLeaderboard({ students, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className="h-[300px]">
        <CardHeader className="pb-2">
          <div className="animate-pulse h-5 w-32 bg-gray-100 rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100" />
                <div className="flex-1 h-8 bg-gray-100 rounded-xl" />
                <div className="w-16 h-8 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[300px]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-green-50">
            <Trophy className="w-4 h-4 text-green-600" />
          </div>
          <CardTitle className="text-base">Top Students</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm">
            No student data available
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
            {students.map((student) => (
              <div
                key={student.id}
                onClick={() => navigate(`/students/${student.id}`)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                  student.rank === 2 ? 'bg-gray-100 text-gray-600' :
                  student.rank === 3 ? 'bg-amber-100 text-amber-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {student.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                  <p className="text-xs text-gray-500">Class {student.class}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">{student.totalWaste.toFixed(1)} kg</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
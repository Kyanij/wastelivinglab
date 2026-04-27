import { seedDatabase } from '../firebase/seedData';
import toast from 'react-hot-toast';

export default function SeedPage() {
  const handleSeed = async () => {
    try {
      const result = await seedDatabase();
      if (result.alreadySeeded) {
        toast.success('Database already seeded!');
      } else {
        toast.success(`Seeded ${result.wasteTypes} types, ${result.students} students, ${result.entries} entries`);
      }
    } catch (error) {
      toast.error('Seeding failed: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f14] to-[#1a2e1f] flex items-center justify-center">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-4">Seed Database</h1>
        <p className="text-gray-300 mb-6">
          This will add sample waste types, students, and waste entries to Firestore.
        </p>
        <button
          onClick={handleSeed}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          Run Seeder
        </button>
        <a href="/dashboard" className="block text-center text-gray-400 mt-4 hover:text-white">
          Skip to Dashboard →
        </a>
      </div>
    </div>
  );
}
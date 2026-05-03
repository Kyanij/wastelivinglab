import { useState } from 'react';
import { seedDatabase } from '../firebase/seedData';
import toast from 'react-hot-toast';
import { Loader2, CheckCircle, Trash2, Sparkles, Package, Users, FileText } from 'lucide-react';

export default function SeedPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [result, setResult] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setStatus('Clearing existing data...');
    setResult(null);
    try {
      setStatus('Creating waste types...');
      const seedResult = await seedDatabase();
      
      setStatus('Seeding complete!');
      setResult(seedResult);
    } catch (error) {
      setStatus('Error: ' + error.message);
      toast.error('Seeding failed: ' + error.message);
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1f14] to-[#1a2e1f] flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600/20 rounded-full mb-4">
            <Trash2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Seed Database</h1>
          <p className="text-gray-400 mt-2 text-sm">
            This will clear existing data and add sample waste types, students, and entries.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>6 Waste Types (Plastic, Paper, Glass, etc.)</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>30 Students (7 classes: 7.1 - 9.3)</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300 text-sm">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span>~150 Waste Entries (spread across 6 months)</span>
          </div>
        </div>

        {status && (
          <div className="mb-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-center text-green-300 text-sm flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {status}
          </div>
        )}

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-semibold py-3 px-4 rounded-xl transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Seeding...</span>
            </>
          ) : (
            <span>Run Seeder</span>
          )}
        </button>

        {result && (
          <div className="mt-6 p-5 rounded-xl border border-green-500/40 bg-green-900/20 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Sparkles className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Seeding Complete!</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-black/20 rounded-lg text-center">
                <Package className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-400">{result.wasteTypes}</div>
                <div className="text-xs text-gray-400">Waste Types</div>
              </div>
              <div className="p-3 bg-black/20 rounded-lg text-center">
                <Users className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-400">{result.students}</div>
                <div className="text-xs text-gray-400">Students</div>
              </div>
              <div className="p-3 bg-black/20 rounded-lg text-center">
                <FileText className="w-5 h-5 text-green-400 mx-auto mb-2" />
                <div className="text-xl font-bold text-green-400">{result.entries}</div>
                <div className="text-xs text-gray-400">Entries</div>
              </div>
            </div>
            <a 
              href="/dashboard" 
              className="block text-center mt-4 text-green-400 hover:text-green-300 text-sm font-medium"
            >
              Go to Dashboard →
            </a>
          </div>
        )}

        {!result && (
          <a href="/dashboard" className="block text-center text-gray-400 mt-4 hover:text-white text-sm">
            Skip to Dashboard →
          </a>
        )}
      </div>
    </div>
  );
}
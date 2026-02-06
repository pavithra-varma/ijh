import { useState } from 'react';
import { Settings } from 'lucide-react';
import { VoiceAssistant } from './components/VoiceAssistant';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="relative">
      {showAdmin ? <AdminPanel /> : <VoiceAssistant />}

      <button
        onClick={() => setShowAdmin(!showAdmin)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-800 hover:bg-slate-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
        title={showAdmin ? 'Back to Assistant' : 'Admin Panel'}
      >
        <Settings className="w-6 h-6" />
      </button>
    </div>
  );
}

export default App;

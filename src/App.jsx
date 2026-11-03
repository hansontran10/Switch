import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  Calendar, 
  ArrowRightLeft, 
  Flame, 
  Search,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const SAMPLE_FOOD_DATABASE = [
  { id: 1, name: "Ben & Jerry's Half Baked", calories: 380, protein: 5, carbs: 46, fat: 20, store: "Target", brand: "Ben & Jerry's" },
  { id: 2, name: "Halo Top Chocolate Ice Cream", calories: 100, protein: 9, carbs: 16, fat: 3, store: "Target", brand: "Halo Top" },
  { id: 3, name: "Ground Beef 73/27 (4oz)", calories: 350, protein: 19, carbs: 0, fat: 30, store: "Walmart", brand: "All Natural" },
  { id: 4, name: "93/7 Lean Ground Turkey (4oz)", calories: 170, protein: 24, carbs: 0, fat: 8, store: "Walmart", brand: "Jennie-O" },
  { id: 5, name: "Traditional Potato Chips (1oz)", calories: 160, protein: 2, carbs: 15, fat: 10, store: "Kroger", brand: "Lay's" },
  { id: 6, name: "Air-Popped Popcorn (1oz)", calories: 90, protein: 3, carbs: 18, fat: 1, store: "Kroger", brand: "SkinnyPop" }
];

const DEFAULT_GOALS = {
  calories: 2200,
  protein: 160,
  carbs: 220,
  fat: 70
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [goals] = useState(DEFAULT_GOALS);
  const [logs, setLogs] = useState([
    { id: 101, name: "Ben & Jerry's Half Baked", calories: 380, protein: 5, carbs: 46, fat: 20, store: "Target", brand: "Ben & Jerry's" },
    { id: 102, name: "Ground Beef 73/27 (4oz)", calories: 350, protein: 19, carbs: 0, fat: 30, store: "Walmart", brand: "All Natural" }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const currentTotals = logs.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const handleAddFood = (food) => {
    setLogs([...logs, { ...food, id: Date.now() }]);
  };

  const handleApplySwitch = (offenderId, newFood) => {
    setLogs(logs.map(item => item.id === offenderId ? { ...newFood, id: Date.now() } : item));
  };

  const handleSimulatedScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const scannedItem = SAMPLE_FOOD_DATABASE[0];
      handleAddFood(scannedItem);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-400 p-2 rounded-xl text-slate-950 font-bold">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <span className="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            SWITCH
          </span>
        </div>
        <button 
          onClick={handleSimulatedScan}
          disabled={isScanning}
          className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold px-3.5 py-1.5 rounded-full shadow-lg shadow-cyan-500/20 transition-all text-sm"
        >
          <Camera className="w-4 h-4" />
          <span>{isScanning ? "Analyzing..." : "Snap Meal"}</span>
        </button>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6 pb-24">
        {/* Navigation Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'switch', label: 'AI Switches' },
            { id: 'log', label: 'Search & Log' },
            { id: 'calendar', label: 'History' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-800 text-cyan-400 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">2 Macro Switches Available</h3>
                  <p className="text-xs text-slate-400 mt-0.5">We found lower-calorie store swaps at Walmart & Target for your logged meals.</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('switch')}
                className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg transition-all"
              >
                View
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Calories', current: currentTotals.calories, target: goals.calories, unit: 'kcal', color: 'from-amber-500 to-orange-500' },
                { label: 'Protein', current: currentTotals.protein, target: goals.protein, unit: 'g', color: 'from-cyan-400 to-blue-500' },
                { label: 'Carbs', current: currentTotals.carbs, target: goals.carbs, unit: 'g', color: 'from-emerald-400 to-teal-500' },
                { label: 'Fats', current: currentTotals.fat, target: goals.fat, unit: 'g', color: 'from-purple-400 to-indigo-500' },
              ].map(macro => {
                const percentage = Math.min(Math.round((macro.current / macro.target) * 100), 100);
                return (
                  <div key={macro.label} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between space-y-3">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="font-semibold">{macro.label}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div>
                      <div className="text-xl font-black text-slate-100">
                        {macro.current} <span className="text-xs font-normal text-slate-400">/ {macro.target}{macro.unit}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${macro.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="font-bold text-slate-200">Today's Log</h2>
                <span className="text-xs text-slate-400">{logs.length} items logged</span>
              </div>
              <div className="space-y-2">
                {logs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                    <div>
                      <div className="font-semibold text-sm text-slate-200">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.brand} • {item.store}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-amber-400">{item.calories} kcal</div>
                      <div className="text-xs text-slate-400">P:{item.protein}g C:{item.carbs}g F:{item.fat}g</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI SWITCH ENGINE */}
        {activeTab === 'switch' && (
          <div className="space-y-4">
            <div className="text-sm text-slate-400">
              AI-generated grocery swaps based on your remaining macro goals:
            </div>

            <div className="bg-slate-900 border border-indigo-500/30 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5"/> High Fat Item Logged</span>
                <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">Available at Target</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Current Log</span>
                  <div className="font-semibold text-slate-200 text-sm mt-1">Ben & Jerry's Ice Cream</div>
                  <div className="text-xs text-slate-400">380 kcal • 20g Fat</div>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <span className="text-xs text-cyan-400 font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended Switch
                  </span>
                  <div className="font-semibold text-slate-200 text-sm mt-1">Halo Top Chocolate</div>
                  <div className="text-xs text-emerald-400 font-semibold">100 kcal • 3g Fat (-280 kcal!)</div>
                </div>
              </div>
              <button 
                onClick={() => handleApplySwitch(101, SAMPLE_FOOD_DATABASE[1])}
                className="w-full py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-slate-950 font-bold rounded-xl text-sm transition-all"
              >
                Accept Switch
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-400 flex items-center gap-1"><Flame className="w-3.5 h-3.5"/> Moderate Calorie Swap</span>
                <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">Available at Walmart</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase">Current Log</span>
                  <div className="font-semibold text-slate-200 text-sm mt-1">73/27 Ground Beef (4oz)</div>
                  <div className="text-xs text-slate-400">350 kcal • 30g Fat</div>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                  <span className="text-xs text-cyan-400 font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Recommended Switch
                  </span>
                  <div className="font-semibold text-slate-200 text-sm mt-1">93/7 Lean Ground Turkey</div>
                  <div className="text-xs text-emerald-400 font-semibold">170 kcal • 8g Fat (-180 kcal!)</div>
                </div>
              </div>
              <button 
                onClick={() => handleApplySwitch(102, SAMPLE_FOOD_DATABASE[3])}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm transition-all"
              >
                Accept Switch
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MANUAL SEARCH */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-slate-500" />
              <input 
                type="text"
                placeholder="Search brands, groceries (Walmart, Target)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-slate-200"
              />
            </div>
            <div className="space-y-2">
              {SAMPLE_FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div>
                    <div className="font-semibold text-sm text-slate-200">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.brand} • {item.store}</div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right text-xs">
                      <div className="font-bold text-slate-300">{item.calories} kcal</div>
                      <div className="text-slate-400">P:{item.protein}g C:{item.carbs}g F:{item.fat}g</div>
                    </div>
                    <button 
                      onClick={() => handleAddFood(item)}
                      className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-all"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CALENDAR HISTORY */}
        {activeTab === 'calendar' && (
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200">Monthly Target Grid</h3>
              <span className="text-xs text-emerald-400 font-semibold">18/22 Days Hit</span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {['M','T','W','T','F','S','S'].map((day, i) => (
                <span key={i} className="text-slate-500 font-bold py-1">{day}</span>
              ))}
              {Array.from({ length: 28 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                    idx % 5 === 0 
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
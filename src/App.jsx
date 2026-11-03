import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Plus, 
  ArrowRightLeft, 
  Search,
  Sparkles,
  AlertCircle,
  Loader2,
  User,
  Target,
  X,
  Upload,
  Check,
  Globe,
  CupSoda,
  Utensils,
  BookmarkCheck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // --- METRIC / IMPERIAL UNITS STATE ---
  const [units, setUnits] = useState({
    weight: 'lbs', // 'lbs' | 'kg'
    height: 'ft',  // 'ft' | 'cm'
    energy: 'kcal',// 'kcal' | 'kJ'
  });

  // --- USER PROFILE & GOALS STATE ---
  const [profile, setProfile] = useState({
    heightFeet: 5,
    heightInches: 10,
    heightCm: 178,
    currentWeight: 175,
    goalWeight: 160,
    bodyFat: 18,
    weightGoalType: 'cut', // 'cut', 'maintain', 'bulk'
  });

  const [goals, setGoals] = useState({
    calories: 2000,
    protein: 160,
    carbs: 200,
    fat: 65,
    sugar: 35
  });

  // Unit conversion helpers
  const displayWeight = (weightLbs) => {
    if (units.weight === 'kg') return `${Math.round(weightLbs * 0.453592)} kg`;
    return `${weightLbs} lbs`;
  };

  const displayEnergy = (energyKcal) => {
    if (units.energy === 'kJ') return `${Math.round(energyKcal * 4.184)} kJ`;
    return `${energyKcal} kcal`;
  };

  const getEnergyUnitLabel = () => units.energy;

  // Recalculate dynamic macro targets based on profile & goal strategy
  useEffect(() => {
    let weightLbs = profile.currentWeight;
    let baseCal = Math.round(weightLbs * 12);
    if (profile.weightGoalType === 'cut') baseCal -= 400;
    if (profile.weightGoalType === 'bulk') baseCal += 350;

    setGoals({
      calories: baseCal,
      protein: Math.round(weightLbs * 1.0),
      carbs: Math.round((baseCal * 0.4) / 4),
      fat: Math.round((baseCal * 0.25) / 9),
      sugar: 35
    });
  }, [profile.currentWeight, profile.weightGoalType]);

  // --- DAILY LOGS STATE (Actual Consumed Items) ---
  const [logs, setLogs] = useState([
    { id: 101, name: "Greek Yogurt Bowl", calories: 220, protein: 20, carbs: 18, fat: 4, sugar: 12, store: "Target", brand: "Chobani", category: "food" },
    { id: 102, name: "Orange Juice (8oz)", calories: 110, protein: 2, carbs: 26, fat: 0, sugar: 22, store: "Walmart", brand: "Simply Orange", category: "drink" }
  ]);

  // --- SAVED FUTURE SWITCHES LIST ---
  const [savedSwitches, setSavedSwitches] = useState([]);

  // --- LIVE SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // --- MANUAL ADD FOOD MODAL STATE ---
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualFood, setManualFood] = useState({
    name: '',
    brand: '',
    store: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    sugar: '',
    category: 'food'
  });

  // --- AI PHOTO SCANNER MODAL STATE ---
  const [showScanModal, setShowScanModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  // Calculate dynamic nutrient totals from real consumed items
  const currentTotals = logs.reduce((acc, item) => ({
    calories: acc.calories + (Number(item.calories) || 0),
    protein: acc.protein + (Number(item.protein) || 0),
    carbs: acc.carbs + (Number(item.carbs) || 0),
    fat: acc.fat + (Number(item.fat) || 0),
    sugar: acc.sugar + (Number(item.sugar) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 });

  // Open Food Facts API Search Handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://us.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
            searchQuery
          )}&search_simple=1&action=process&json=true&page_size=20`
        );
        const data = await response.json();

        if (data.products && data.products.length > 0) {
          const parsedProducts = data.products
            .filter(p => p.product_name)
            .map((p, index) => {
              const categories = (p.categories || '').toLowerCase();
              const nameLower = (p.product_name || '').toLowerCase();
              const isDrink = categories.includes('beverage') || categories.includes('drink') || categories.includes('soda') || nameLower.includes('juice') || nameLower.includes('tea') || nameLower.includes('soda') || nameLower.includes('water') || nameLower.includes('drink');

              return {
                id: p.code || `${p.product_name}-${index}`,
                name: p.product_name,
                brand: p.brands ? p.brands.split(',')[0] : 'Generic',
                store: p.stores ? p.stores.split(',')[0] : 'Grocery Store',
                category: isDrink ? 'drink' : 'food',
                calories: Math.round(p.nutriments?.['energy-kcal_100g'] || p.nutriments?.['energy-kcal'] || 0),
                protein: Math.round(p.nutriments?.proteins_100g || 0),
                carbs: Math.round(p.nutriments?.carbohydrates_100g || 0),
                fat: Math.round(p.nutriments?.fat_100g || 0),
                sugar: Math.round(p.nutriments?.sugars_100g || 0),
                link: p.url || `https://www.google.com/search?q=${encodeURIComponent(p.product_name + ' ' + (p.brands || ''))}&tbm=isch`
              };
            });
          setSearchResults(parsedProducts);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error fetching food database:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddFood = (food) => {
    setLogs(prev => [...prev, { ...food, id: Date.now() }]);
  };

  // Save recommended switch for NEXT meal (does not alter actual progress)
  const handleSaveNextMealSwitch = (recommendedItem) => {
    if (!savedSwitches.some(s => s.name === recommendedItem.name)) {
      setSavedSwitches(prev => [...prev, { ...recommendedItem, id: Date.now() }]);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualFood.name) return;
    handleAddFood({
      name: manualFood.name,
      brand: manualFood.brand || 'Custom Entry',
      store: manualFood.store || 'Home / Restaurant',
      category: manualFood.category || 'food',
      calories: Number(manualFood.calories) || 0,
      protein: Number(manualFood.protein) || 0,
      carbs: Number(manualFood.carbs) || 0,
      fat: Number(manualFood.fat) || 0,
      sugar: Number(manualFood.sugar) || 0,
    });
    setManualFood({ name: '', brand: '', store: '', calories: '', protein: '', carbs: '', fat: '', sugar: '', category: 'food' });
    setShowManualModal(false);
  };

  const handleSimulatePhotoScan = () => {
    setIsScanning(true);
    setScannedResult(null);
    setTimeout(() => {
      setScannedResult({
        name: "Iced Green Tea & Honey",
        brand: "Starbucks",
        store: "Coffee Shop",
        category: "drink",
        calories: 80,
        protein: 0,
        carbs: 20,
        fat: 0,
        sugar: 18
      });
      setIsScanning(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-stone-50/80 backdrop-blur sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-stone-900 p-2 rounded-xl text-stone-100 font-bold">
            <ArrowRightLeft className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-xl font-black tracking-wider text-stone-900">
              SWITCH
            </span>
            <span className="text-xs text-amber-700 block -mt-1 font-medium">Beige Studio</span>
          </div>
        </div>

        <button 
          onClick={() => setShowScanModal(true)}
          className="flex items-center space-x-2 bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold px-4 py-2 rounded-full shadow-sm transition-all text-sm"
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>Snap Meal</span>
        </button>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 space-y-6 pb-24">
        {/* Navigation Tabs */}
        <div className="flex bg-stone-200/70 p-1 rounded-2xl border border-stone-300/60">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'profile', label: 'Profile & Units' },
            { id: 'switch', label: 'Switch' },
            { id: 'log', label: 'Search & Log' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-stone-50 text-stone-900 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Weight Goal Banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-200/60 text-amber-800 rounded-xl">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">
                    Goal Strategy: {profile.weightGoalType === 'cut' ? 'Fat Loss / Cutting' : profile.weightGoalType === 'bulk' ? 'Muscle Gain / Bulking' : 'Weight Maintenance'}
                  </h3>
                  <p className="text-xs text-stone-600 mt-0.5">
                    Current: <strong>{displayWeight(profile.currentWeight)}</strong> → Target: <strong>{displayWeight(profile.goalWeight)}</strong> ({profile.bodyFat ? `${profile.bodyFat}% body fat` : ''})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('profile')}
                className="text-xs bg-stone-900 hover:bg-stone-800 text-stone-100 font-semibold px-3 py-1.5 rounded-xl transition-all"
              >
                Units & Profile
              </button>
            </div>

            {/* Nutrients Progress Grid (Real Consumed Intake) */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Energy', current: currentTotals.calories, target: goals.calories, isEnergy: true, color: 'bg-amber-500' },
                { label: 'Protein', current: currentTotals.protein, target: goals.protein, unit: 'g', color: 'bg-stone-800' },
                { label: 'Carbs', current: currentTotals.carbs, target: goals.carbs, unit: 'g', color: 'bg-amber-700' },
                { label: 'Fats', current: currentTotals.fat, target: goals.fat, unit: 'g', color: 'bg-stone-600' },
                { label: 'Sugar', current: currentTotals.sugar, target: goals.sugar, unit: 'g', color: 'bg-rose-500' },
              ].map(macro => {
                const percentage = Math.min(Math.round((macro.current / macro.target) * 100), 100);
                const displayVal = macro.isEnergy ? displayEnergy(macro.current) : `${macro.current} ${macro.unit}`;
                const targetVal = macro.isEnergy ? displayEnergy(macro.target) : `${macro.target}${macro.unit}`;

                return (
                  <div key={macro.label} className="bg-stone-50 border border-stone-200 p-3.5 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm">
                    <div className="flex justify-between items-center text-xs text-stone-500">
                      <span className="font-semibold">{macro.label}</span>
                      <span>{percentage}%</span>
                    </div>
                    <div>
                      <div className="text-lg font-black text-stone-900">
                        {displayVal} <span className="text-xs font-normal text-stone-500">/ {targetVal}</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${macro.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Saved Switches for Next Grocery/Meal Run */}
            {savedSwitches.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>Saved Next-Meal & Grocery Switches ({savedSwitches.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {savedSwitches.map(item => (
                    <div key={item.id} className="bg-white border border-emerald-300 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-800 flex items-center space-x-2">
                      <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.name}</span>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-stone-400 hover:text-stone-700 ml-1"
                      >
                        <ExternalLink className="w-3 h-3 inline" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actual Logged Intake History */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                <h2 className="font-bold text-stone-900">Today's Actual Consumed Log</h2>
                <button 
                  onClick={() => setShowManualModal(true)}
                  className="text-xs bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Input</span>
                </button>
              </div>

              <div className="space-y-2">
                {logs.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-stone-100 rounded-xl border border-stone-200/80">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg text-xs ${item.category === 'drink' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'}`}>
                        {item.category === 'drink' ? <CupSoda className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${item.category === 'drink' ? 'bg-cyan-200/60 text-cyan-900' : 'bg-stone-200 text-stone-700'}`}>
                            {item.category === 'drink' ? 'DRINK' : 'FOOD'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500">{item.brand} • {item.store}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-stone-900">{displayEnergy(item.calories)}</div>
                      <div className="text-xs text-stone-500">
                        P:{item.protein}g • C:{item.carbs}g • F:{item.fat}g • S:{item.sugar}g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROFILE & METRIC UNITS SETUP */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center space-x-3 border-b border-stone-200 pb-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-stone-900">Measurement & Energy Units</h2>
                  <p className="text-xs text-stone-500">Choose your preferred unit system for calories, weight, and height.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Energy Unit</label>
                  <div className="flex bg-stone-200/70 p-1 rounded-xl">
                    {['kcal', 'kJ'].map(unit => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setUnits({ ...units, energy: unit })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          units.energy === unit ? 'bg-stone-900 text-stone-100 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Weight Unit</label>
                  <div className="flex bg-stone-200/70 p-1 rounded-xl">
                    {['lbs', 'kg'].map(unit => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setUnits({ ...units, weight: unit })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          units.weight === unit ? 'bg-stone-900 text-stone-100 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Height Unit</label>
                  <div className="flex bg-stone-200/70 p-1 rounded-xl">
                    {['ft', 'cm'].map(unit => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setUnits({ ...units, height: unit })}
                        className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                          units.height === unit ? 'bg-stone-900 text-stone-100 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {unit === 'ft' ? 'ft / in' : 'cm'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center space-x-3 border-b border-stone-200 pb-4">
                <div className="p-3 bg-stone-200 rounded-2xl text-stone-800">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-stone-900">Body Stats & Goal Metrics</h2>
                  <p className="text-xs text-stone-500">Adjust your body measurements for precise AI recommendations.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Height ({units.height === 'ft' ? 'ft / in' : 'cm'})</label>
                  {units.height === 'ft' ? (
                    <div className="flex space-x-2">
                      <input 
                        type="number"
                        placeholder="Feet"
                        value={profile.heightFeet}
                        onChange={(e) => setProfile({ ...profile, heightFeet: Number(e.target.value) })}
                        className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                      />
                      <input 
                        type="number"
                        placeholder="Inches"
                        value={profile.heightInches}
                        onChange={(e) => setProfile({ ...profile, heightInches: Number(e.target.value) })}
                        className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                      />
                    </div>
                  ) : (
                    <input 
                      type="number"
                      placeholder="Centimeters (cm)"
                      value={profile.heightCm}
                      onChange={(e) => setProfile({ ...profile, heightCm: Number(e.target.value) })}
                      className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                    />
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Current Weight ({units.weight})</label>
                  <input 
                    type="number"
                    value={units.weight === 'kg' ? Math.round(profile.currentWeight * 0.453592) : profile.currentWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProfile({ ...profile, currentWeight: units.weight === 'kg' ? Math.round(val / 0.453592) : val });
                    }}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Goal Weight ({units.weight})</label>
                  <input 
                    type="number"
                    value={units.weight === 'kg' ? Math.round(profile.goalWeight * 0.453592) : profile.goalWeight}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setProfile({ ...profile, goalWeight: units.weight === 'kg' ? Math.round(val / 0.453592) : val });
                    }}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Body Fat % (Optional)</label>
                  <input 
                    type="number"
                    placeholder="e.g. 18%"
                    value={profile.bodyFat}
                    onChange={(e) => setProfile({ ...profile, bodyFat: Number(e.target.value) })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-stone-700">Primary Goal Strategy</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'cut', label: 'Fat Loss', desc: 'Calorie deficit & lower sugar' },
                    { id: 'maintain', label: 'Maintain', desc: 'Balanced macros' },
                    { id: 'bulk', label: 'Muscle Gain', desc: 'Protein & surplus' }
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setProfile({ ...profile, weightGoalType: item.id })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        profile.weightGoalType === item.id 
                          ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-sm' 
                          : 'bg-stone-100 text-stone-700 border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <div className="font-bold text-sm">{item.label}</div>
                      <div className="text-xs opacity-75 mt-0.5">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SWITCH (AI RECOMMENDATION ENGINE) */}
        {activeTab === 'switch' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Switch Recommendation Engine</span>
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Switch tracks your intake patterns and suggests smarter grocery alternatives tailored to your <strong>{profile.weightGoalType === 'cut' ? 'Fat Loss' : profile.weightGoalType === 'bulk' ? 'Muscle Gain' : 'Maintenance'}</strong> goal.
                </p>
              </div>
            </div>

            {/* AI Drink Switch Card */}
            <div className="bg-stone-50 border border-amber-300 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-amber-800 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5"/> Observed: High Sugar Drink Logged
                </span>
                <span className="bg-stone-200 text-stone-800 px-2.5 py-1 rounded-full font-bold">Target / Walmart</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-stone-100 p-4 rounded-xl border border-stone-200">
                <div>
                  <span className="text-xs text-stone-500 font-bold uppercase">What You Consumed</span>
                  <div className="font-semibold text-stone-900 text-sm mt-1">Orange Juice (8oz)</div>
                  <div className="text-xs text-stone-500">{displayEnergy(110)} • 22g Sugar • 26g Carbs</div>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-stone-300 pt-3 md:pt-0 md:pl-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-amber-700 font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommended Switch
                    </span>
                    <a 
                      href="https://www.google.com/search?q=Poppi+Prebiotic+Soda+Orange+Target&tbm=isch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1"
                    >
                      <span>View Item</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="font-semibold text-stone-900 text-sm mt-1">Poppi Prebiotic Soda (Orange)</div>
                  <div className="text-xs text-emerald-700 font-semibold">{displayEnergy(25)} • 5g Sugar (-17g sugar per serving)</div>
                </div>
              </div>
              
              {savedSwitches.some(s => s.name === "Poppi Prebiotic Soda (Orange)") ? (
                <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-sm flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Saved to Next Grocery List</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleSaveNextMealSwitch({ 
                    name: "Poppi Prebiotic Soda (Orange)", 
                    calories: 25, 
                    protein: 0, 
                    carbs: 7, 
                    fat: 0, 
                    sugar: 5, 
                    store: "Target", 
                    brand: "Poppi", 
                    category: "drink",
                    link: "https://www.google.com/search?q=Poppi+Prebiotic+Soda+Orange+Target&tbm=isch"
                  })}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-2"
                >
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span>Save Switch for Next Grocery Run</span>
                </button>
              )}
            </div>

            {/* AI Food Switch Card */}
            <div className="bg-stone-50 border border-stone-300 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600"/> High Fat Content Swap
                </span>
                <span className="bg-stone-200 text-stone-800 px-2.5 py-1 rounded-full font-bold">Walmart</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-stone-100 p-4 rounded-xl border border-stone-200">
                <div>
                  <span className="text-xs text-stone-500 font-bold uppercase">What You Consumed</span>
                  <div className="font-semibold text-stone-900 text-sm mt-1">Ground Beef 73/27</div>
                  <div className="text-xs text-stone-500">{displayEnergy(350)} • 30g Fat • 19g Protein</div>
                </div>
                <div className="border-t md:border-t-0 md:border-l border-stone-300 pt-3 md:pt-0 md:pl-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-amber-700 font-bold uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Recommended Switch
                    </span>
                    <a 
                      href="https://www.google.com/search?q=93+7+Lean+Ground+Turkey+Jennie-O+Walmart&tbm=isch"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1"
                    >
                      <span>View Item</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="font-semibold text-stone-900 text-sm mt-1">93/7 Lean Ground Turkey</div>
                  <div className="text-xs text-emerald-700 font-semibold">{displayEnergy(170)} • 8g Fat • 24g Protein (+5g protein)</div>
                </div>
              </div>
              
              {savedSwitches.some(s => s.name === "93/7 Lean Ground Turkey (4oz)") ? (
                <div className="w-full py-2.5 bg-emerald-100 text-emerald-800 font-bold rounded-xl text-sm flex items-center justify-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Saved to Next Grocery List</span>
                </div>
              ) : (
                <button 
                  onClick={() => handleSaveNextMealSwitch({ 
                    name: "93/7 Lean Ground Turkey (4oz)", 
                    calories: 170, 
                    protein: 24, 
                    carbs: 0, 
                    fat: 8, 
                    sugar: 0, 
                    store: "Walmart", 
                    brand: "Jennie-O", 
                    category: "food",
                    link: "https://www.google.com/search?q=93+7+Lean+Ground+Turkey+Jennie-O+Walmart&tbm=isch"
                  })}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold rounded-xl text-sm transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-2"
                >
                  <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  <span>Save Switch for Next Grocery Run</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SEARCH & LOG */}
        {activeTab === 'log' && (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-3 text-stone-400" />
                <input 
                  type="text"
                  placeholder="Search foods or drinks (e.g. Sprite, Gatorade, Chobani, Fries)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-stone-800 text-stone-900 shadow-sm"
                />
                {isSearching && (
                  <Loader2 className="w-5 h-5 absolute right-3 top-3 text-amber-600 animate-spin" />
                )}
              </div>
              <button 
                onClick={() => setShowManualModal(true)}
                className="bg-stone-900 hover:bg-stone-800 text-stone-100 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center space-x-1 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Custom</span>
              </button>
            </div>

            <div className="space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200 rounded-xl shadow-sm hover:border-stone-300 transition-all">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg text-xs ${item.category === 'drink' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'}`}>
                        {item.category === 'drink' ? <CupSoda className="w-4 h-4" /> : <Utensils className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-stone-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${item.category === 'drink' ? 'bg-cyan-200/60 text-cyan-900' : 'bg-stone-200 text-stone-700'}`}>
                            {item.category === 'drink' ? 'DRINK' : 'FOOD'}
                          </span>
                          <a 
                            href={item.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-stone-400 hover:text-stone-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-xs text-stone-500">{item.brand} • {item.store}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right text-xs">
                        <div className="font-bold text-stone-900">{displayEnergy(item.calories)}</div>
                        <div className="text-stone-500">P:{item.protein}g • C:{item.carbs}g • F:{item.fat}g • S:{item.sugar}g</div>
                      </div>
                      <button 
                        onClick={() => handleAddFood(item)}
                        className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition-all"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : searchQuery && !isSearching ? (
                <div className="text-center py-8 text-stone-500 text-sm">
                  No food or drink items found matching "{searchQuery}".
                </div>
              ) : (
                <div className="text-center py-8 text-stone-500 text-sm">
                  Search any brand food or drink above to query the live database.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* --- MANUAL ENTRY MODAL --- */}
      {showManualModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-50 border border-stone-300 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base">Manual Input</h3>
              <button onClick={() => setShowManualModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Item Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-stone-200/80 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setManualFood({ ...manualFood, category: 'food' })}
                    className={`flex items-center justify-center space-x-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      manualFood.category === 'food' ? 'bg-stone-900 text-stone-100 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5" />
                    <span>Food</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualFood({ ...manualFood, category: 'drink' })}
                    className={`flex items-center justify-center space-x-2 py-2 text-xs font-bold rounded-lg transition-all ${
                      manualFood.category === 'drink' ? 'bg-cyan-700 text-stone-100 shadow-sm' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <CupSoda className="w-3.5 h-3.5" />
                    <span>Drink</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700">{manualFood.category === 'drink' ? 'Drink Name *' : 'Food Name *'}</label>
                <input 
                  required
                  type="text" 
                  placeholder={manualFood.category === 'drink' ? 'e.g. Diet Coke, Iced Matcha' : 'e.g. Chicken Rice Bowl'}
                  value={manualFood.name}
                  onChange={(e) => setManualFood({ ...manualFood, name: e.target.value })}
                  className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700">Brand Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Coca-Cola, Target"
                    value={manualFood.brand}
                    onChange={(e) => setManualFood({ ...manualFood, brand: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700">Store / Source</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Walmart, Starbucks"
                    value={manualFood.store}
                    onChange={(e) => setManualFood({ ...manualFood, store: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="text-xs font-bold text-stone-700">Energy ({getEnergyUnitLabel()})</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={manualFood.calories}
                    onChange={(e) => setManualFood({ ...manualFood, calories: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700">Protein (g)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={manualFood.protein}
                    onChange={(e) => setManualFood({ ...manualFood, protein: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700">Carbs (g)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={manualFood.carbs}
                    onChange={(e) => setManualFood({ ...manualFood, carbs: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700">Fat (g)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={manualFood.fat}
                    onChange={(e) => setManualFood({ ...manualFood, fat: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700">Sugar (g)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={manualFood.sugar}
                    onChange={(e) => setManualFood({ ...manualFood, sugar: e.target.value })}
                    className="w-full bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-stone-800"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold rounded-xl text-sm transition-all mt-4"
              >
                Log {manualFood.category === 'drink' ? 'Drink' : 'Food'} Entry
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- AI PHOTO SCANNER MODAL --- */}
      {showScanModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-50 border border-stone-300 max-w-md w-full rounded-2xl p-6 space-y-4 shadow-xl text-center">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center space-x-2">
                <Camera className="w-5 h-5 text-amber-600" />
                <span>Snap Meal / Drink Vision Scanner</span>
              </h3>
              <button onClick={() => setShowScanModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!scannedResult ? (
              <div className="py-6 space-y-4 border-2 border-dashed border-stone-300 rounded-2xl bg-stone-100 flex flex-col items-center justify-center">
                <Upload className="w-8 h-8 text-stone-400" />
                <div className="text-xs text-stone-600 max-w-xs">
                  Upload or snap a photo of your food dish or beverage to analyze macros and sugar automatically.
                </div>
                <button 
                  onClick={handleSimulatePhotoScan}
                  disabled={isScanning}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-bold text-xs transition-all flex items-center space-x-2"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      <span>Analyzing Image...</span>
                    </>
                  ) : (
                    <span>Simulate Photo Scan</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-left">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 font-bold">
                  <span className="flex items-center gap-1"><Check className="w-4 h-4"/> AI Detection Complete</span>
                  <span>94% Confidence</span>
                </div>

                <div className="bg-stone-100 p-4 rounded-xl border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 text-base flex items-center gap-2">
                    <span>{scannedResult.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-200 text-cyan-900 uppercase">
                      {scannedResult.category}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-stone-700 pt-2 border-t border-stone-200">
                    <div>Energy: <strong>{displayEnergy(scannedResult.calories)}</strong></div>
                    <div>Protein: <strong>{scannedResult.protein}g</strong></div>
                    <div>Carbohydrates: <strong>{scannedResult.carbs}g</strong></div>
                    <div>Fat: <strong>{scannedResult.fat}g</strong></div>
                    <div>Sugar: <strong>{scannedResult.sugar}g</strong></div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    handleAddFood(scannedResult);
                    setShowScanModal(false);
                  }}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold rounded-xl text-sm transition-all shadow-sm"
                >
                  Confirm & Add to Log
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
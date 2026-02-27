import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calculator, User, ArrowRight, RefreshCw } from 'lucide-react';

export default function MacroCalculator() {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<number>(1.2);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [result, setResult] = useState<any>(null);

  const calculate = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    const a = parseFloat(age);

    if (!w || !h || !a) return;

    const bmi = w / (h * h);
    
    // Mifflin-St Jeor Equation
    let bmr = (10 * w) + (6.25 * (h * 100)) - (5 * a);
    bmr = gender === 'male' ? bmr + 5 : bmr - 161;

    const tdee = bmr * activity;
    
    let targetCalories = tdee;
    if (goal === 'lose') targetCalories -= 500;
    if (goal === 'gain') targetCalories += 500;

    // Macros
    const protein = w * 2; // 2g per kg
    const fat = (targetCalories * 0.25) / 9; // 25% of calories
    const carbs = (targetCalories - (protein * 4) - (fat * 9)) / 4;

    setResult({
      bmi: bmi.toFixed(1),
      tdee: Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macros: {
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat)
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border border-black/5">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-emerald-100 rounded-2xl">
          <Calculator className="w-6 h-6 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-zinc-900">Macro Intelligence Calculator</h2>
      </div>

      {!result ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Weight (kg)</label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="70"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Height (cm)</label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="175"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                placeholder="25"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Gender</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setGender('male')}
                  className={`flex-1 py-3 rounded-xl border transition-all ${gender === 'male' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'}`}
                >
                  Male
                </button>
                <button
                  onClick={() => setGender('female')}
                  className={`flex-1 py-3 rounded-xl border transition-all ${gender === 'female' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200'}`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Activity Level</label>
            <select
              value={activity}
              onChange={(e) => setActivity(parseFloat(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-white"
            >
              <option value={1.2}>Sedentary (Office job, little exercise)</option>
              <option value={1.375}>Lightly Active (1-3 days/week)</option>
              <option value={1.55}>Moderately Active (3-5 days/week)</option>
              <option value={1.725}>Very Active (6-7 days/week)</option>
              <option value={1.9}>Extra Active (Physical job + training)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-500 uppercase tracking-wider">Goal</label>
            <div className="grid grid-cols-3 gap-2">
              {(['lose', 'maintain', 'gain'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`py-3 rounded-xl border capitalize transition-all ${goal === g ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-zinc-600 border-zinc-200'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={calculate}
            className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 mt-4"
          >
            Calculate My Plan <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-zinc-50 rounded-3xl text-center border border-zinc-100">
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Maintenance (TDEE)</div>
              <div className="text-3xl font-black text-zinc-900">{result.tdee}</div>
              <div className="text-[10px] text-zinc-400 mt-1 uppercase">Calories/Day</div>
            </div>
            <div className="p-6 bg-emerald-600 rounded-3xl text-center shadow-lg shadow-emerald-200">
              <div className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">Daily Goal</div>
              <div className="text-3xl font-black text-white">{result.targetCalories}</div>
              <div className="text-[10px] text-emerald-100 mt-1 uppercase">Calories/Day</div>
            </div>
          </div>

          <div className="p-4 bg-zinc-50 rounded-2xl text-center">
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Your BMI</div>
            <div className="text-2xl font-bold text-zinc-900">{result.bmi}</div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 text-lg">Daily Macronutrients</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="font-medium text-indigo-900">Protein</span>
                </div>
                <span className="font-bold text-indigo-900">{result.macros.protein}g</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="font-medium text-amber-900">Carbohydrates</span>
                </div>
                <span className="font-bold text-amber-900">{result.macros.carbs}g</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="font-medium text-rose-900">Fats</span>
                </div>
                <span className="font-bold text-rose-900">{result.macros.fat}g</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setResult(null)}
            className="w-full py-4 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" /> Recalculate
          </button>
        </motion.div>
      )}
    </div>
  );
}

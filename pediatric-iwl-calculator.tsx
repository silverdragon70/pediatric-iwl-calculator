import React, { useState, useEffect } from 'react';
import { Calculator, Thermometer, Wind, Droplets, Baby, AlertCircle, Info } from 'lucide-react';

const PediatricIWLCalculator = () => {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('37');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [additionalFactors, setAdditionalFactors] = useState({
    phototherapy: false,
    radiantWarmer: false,
    lowHumidity: false,
    burns: false
  });
  const [results, setResults] = useState(null);
  const [showInfo, setShowInfo] = useState(false);

  // Normal respiratory rates by age
  const getNormalRR = (weightKg) => {
    if (weightKg < 3) return { min: 30, max: 60, age: "Newborn" };
    if (weightKg < 5) return { min: 30, max: 50, age: "0-3 months" };
    if (weightKg < 8) return { min: 25, max: 40, age: "3-6 months" };
    if (weightKg < 12) return { min: 20, max: 35, age: "6-12 months" };
    if (weightKg < 20) return { min: 20, max: 30, age: "1-3 years" };
    return { min: 15, max: 25, age: "3+ years" };
  };

  const calculateResults = () => {
    if (!height || !weight) return;

    const heightCm = parseFloat(height);
    const weightKg = parseFloat(weight);
    const temp = parseFloat(temperature);
    const rr = parseFloat(respiratoryRate) || 0;

    // Calculate BSA using Mosteller formula
    const bsa = Math.sqrt((heightCm * weightKg) / 3600);

    // Base insensible water loss (400-500 mL/m²/day)
    const baseIWL_low = bsa * 400;
    const baseIWL_high = bsa * 500;

    // Weight-based alternative calculation
    const weightBasedIWL_low = weightKg * 15;
    const weightBasedIWL_high = weightKg * 20;

    // Fever adjustment (13% per degree above 37°C)
    const feverAdjustment = temp > 37 ? (temp - 37) * 0.13 : 0;
    const feverMultiplier = 1 + feverAdjustment;

    // Respiratory rate adjustment
    const normalRR = getNormalRR(weightKg);
    let rrAdjustment = 0;
    if (rr > normalRR.max) {
      rrAdjustment = (rr - normalRR.max) * 2 * weightKg; // 2 mL/kg per breath above normal
    }

    // Additional factors adjustments
    let additionalAdjustment = 0;
    if (additionalFactors.phototherapy) additionalAdjustment += baseIWL_low * 0.2;
    if (additionalFactors.radiantWarmer) additionalAdjustment += baseIWL_low * 0.3;
    if (additionalFactors.lowHumidity) additionalAdjustment += baseIWL_low * 0.25;
    if (additionalFactors.burns) additionalAdjustment += baseIWL_low * 0.5;

    // Final calculations
    const adjustedIWL_low = (baseIWL_low * feverMultiplier) + rrAdjustment + additionalAdjustment;
    const adjustedIWL_high = (baseIWL_high * feverMultiplier) + rrAdjustment + additionalAdjustment;

    setResults({
      bsa: bsa.toFixed(3),
      baseIWL_low: baseIWL_low.toFixed(0),
      baseIWL_high: baseIWL_high.toFixed(0),
      weightBasedIWL_low: weightBasedIWL_low.toFixed(0),
      weightBasedIWL_high: weightBasedIWL_high.toFixed(0),
      adjustedIWL_low: adjustedIWL_low.toFixed(0),
      adjustedIWL_high: adjustedIWL_high.toFixed(0),
      hourlyRate_low: (adjustedIWL_low / 24).toFixed(1),
      hourlyRate_high: (adjustedIWL_high / 24).toFixed(1),
      feverAdjustment: (feverAdjustment * 100).toFixed(1),
      rrAdjustment: rrAdjustment.toFixed(0),
      normalRR: normalRR,
      additionalAdjustment: additionalAdjustment.toFixed(0)
    });
  };

  useEffect(() => {
    calculateResults();
  }, [height, weight, temperature, respiratoryRate, additionalFactors]);

  const handleFactorChange = (factor) => {
    setAdditionalFactors(prev => ({
      ...prev,
      [factor]: !prev[factor]
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex items-center gap-3">
            <Baby className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Pediatric Insensible Water Loss Calculator</h1>
              <p className="text-blue-100">Clinical tool for fluid management in children</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Info Panel */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <button 
              onClick={() => setShowInfo(!showInfo)}
              className="flex items-center gap-2 text-blue-700 font-medium"
            >
              <Info className="h-5 w-5" />
              Clinical Information
            </button>
            {showInfo && (
              <div className="mt-3 text-sm text-blue-800 space-y-2">
                <p><strong>Insensible Water Loss (IWL):</strong> Water lost through skin transpiration and respiratory tract</p>
                <p><strong>Normal Range:</strong> 400-500 mL/m²/day under standard conditions</p>
                <p><strong>Key Factors:</strong> Fever (+13% per °C), tachypnea, environmental conditions</p>
                <p><strong>Clinical Use:</strong> Essential for calculating total fluid requirements in hospitalized children</p>
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Patient Parameters
              </h2>

              {/* Basic Measurements */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="77"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="8.5"
                  />
                </div>
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Body Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Respiratory Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  Respiratory Rate (breaths/min)
                </label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional"
                />
                {results?.normalRR && (
                  <p className="text-xs text-gray-600 mt-1">
                    Normal range for {results.normalRR.age}: {results.normalRR.min}-{results.normalRR.max} breaths/min
                  </p>
                )}
              </div>

              {/* Additional Risk Factors */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Additional Risk Factors</h3>
                <div className="space-y-2">
                  {[
                    { key: 'phototherapy', label: 'Phototherapy (+20%)', icon: '💡' },
                    { key: 'radiantWarmer', label: 'Radiant Warmer (+30%)', icon: '🔥' },
                    { key: 'lowHumidity', label: 'Low Humidity (<30%) (+25%)', icon: '💨' },
                    { key: 'burns', label: 'Burns/Skin Breakdown (+50%)', icon: '🩹' }
                  ].map((factor) => (
                    <label key={factor.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={additionalFactors[factor.key]}
                        onChange={() => handleFactorChange(factor.key)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {factor.icon} {factor.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Droplets className="h-5 w-5" />
                Calculation Results
              </h2>

              {results ? (
                <div className="space-y-4">
                  {/* BSA */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2">Body Surface Area (BSA)</h3>
                    <div className="text-2xl font-bold text-blue-600">{results.bsa} m²</div>
                    <div className="text-sm text-gray-600">Using Mosteller formula</div>
                  </div>

                  {/* Base IWL */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2">Base Insensible Water Loss</h3>
                    <div className="text-lg font-semibold text-blue-700">
                      {results.baseIWL_low} - {results.baseIWL_high} mL/day
                    </div>
                    <div className="text-sm text-gray-600">BSA-based (400-500 mL/m²/day)</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Weight-based alternative: {results.weightBasedIWL_low} - {results.weightBasedIWL_high} mL/day
                    </div>
                  </div>

                  {/* Adjustments */}
                  {(parseFloat(results.feverAdjustment) > 0 || parseFloat(results.rrAdjustment) > 0 || parseFloat(results.additionalAdjustment) > 0) && (
                    <div className="bg-orange-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-800 mb-2">Adjustments Applied</h3>
                      {parseFloat(results.feverAdjustment) > 0 && (
                        <div className="text-sm text-orange-700">
                          🌡️ Fever: +{results.feverAdjustment}% increase
                        </div>
                      )}
                      {parseFloat(results.rrAdjustment) > 0 && (
                        <div className="text-sm text-orange-700">
                          🌬️ Tachypnea: +{results.rrAdjustment} mL/day
                        </div>
                      )}
                      {parseFloat(results.additionalAdjustment) > 0 && (
                        <div className="text-sm text-orange-700">
                          ⚠️ Risk factors: +{results.additionalAdjustment} mL/day
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Results */}
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2">Total Insensible Water Loss</h3>
                    <div className="text-2xl font-bold text-green-700 mb-2">
                      {results.adjustedIWL_low} - {results.adjustedIWL_high} mL/day
                    </div>
                    <div className="text-lg text-green-600">
                      {results.hourlyRate_low} - {results.hourlyRate_high} mL/hour
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      This represents {((parseFloat(results.adjustedIWL_low) / parseFloat(weight) / 10)).toFixed(1)}% - {((parseFloat(results.adjustedIWL_high) / parseFloat(weight) / 10)).toFixed(1)}% of body weight per day
                    </div>
                  </div>

                  {/* Clinical Notes */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-1">Clinical Notes</h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Add to maintenance fluids and replace other losses</li>
                          <li>• Monitor closely with fever or environmental changes</li>
                          <li>• Consider increased monitoring if multiple risk factors present</li>
                          <li>• Reassess if clinical condition changes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <Droplets className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Enter height and weight to calculate insensible water loss</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <strong>Disclaimer:</strong> For clinical guidance only. Always consider individual patient factors.
            </div>
            <div>
              Based on established pediatric fluid calculation guidelines
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PediatricIWLCalculator;
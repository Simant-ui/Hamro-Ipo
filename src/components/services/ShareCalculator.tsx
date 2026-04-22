'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calculator as CalcIcon, 
  ArrowLeft,
  DollarSign
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const tabs = ['Buy', 'Sell', 'Bonus Share', 'Right Share', 'Average']

interface CalculationResults {
  amount: number
  sebonFee: number
  brokerFee: number
  dpFee: number
  cgt?: number
  receivable?: number
  profit?: number
  profitPercentage?: number
  costPerShare: number
  total: number
}

const getBrokerCommission = (amount: number) => {
  if (amount <= 50000) return Math.max(10, amount * 0.0036);
  if (amount <= 500000) return amount * 0.0033;
  if (amount <= 2000000) return amount * 0.0031;
  if (amount <= 10000000) return amount * 0.0027;
  return amount * 0.0024;
};

const SEBON_FEE_RATE = 0.00015;
const DP_FEE = 25;

export function ShareCalculator() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Buy')
  const [buyPrice, setBuyPrice] = useState('100')
  const [sellPrice, setSellPrice] = useState('150')
  const [units, setUnits] = useState('10')
  const [isShortTerm, setIsShortTerm] = useState(true)

  const results = useMemo<CalculationResults | null>(() => {
    const u = parseFloat(units)
    if (isNaN(u) || u <= 0) return null

    if (activeTab === 'Buy') {
      const p = parseFloat(buyPrice)
      if (isNaN(p)) return null

      const amount = p * u
      const sebonFee = amount * SEBON_FEE_RATE
      const brokerFee = getBrokerCommission(amount)
      const dpFee = DP_FEE
      const total = amount + sebonFee + brokerFee + dpFee
      const costPerShare = total / u

      return {
        amount,
        sebonFee,
        brokerFee,
        dpFee,
        costPerShare,
        total
      }
    }

    if (activeTab === 'Sell') {
      const sp = parseFloat(sellPrice)
      const bp = parseFloat(buyPrice)
      if (isNaN(sp) || isNaN(bp)) return null

      // Purchase Side (for Profit calculation)
      const buyAmount = bp * u
      const buyBrokerFee = getBrokerCommission(buyAmount)
      const buySebonFee = buyAmount * SEBON_FEE_RATE
      const buyTotalCost = buyAmount + buyBrokerFee + buySebonFee + DP_FEE

      // Selling Side
      const sellAmount = sp * u
      const sellSebonFee = sellAmount * SEBON_FEE_RATE
      const sellBrokerFee = getBrokerCommission(sellAmount)
      const sellTotalCharges = sellSebonFee + sellBrokerFee + DP_FEE
      
      const profitBeforeTax = sellAmount - sellTotalCharges - buyTotalCost
      let cgt = 0
      if (profitBeforeTax > 0) {
        cgt = profitBeforeTax * (isShortTerm ? 0.075 : 0.05)
      }

      const receivable = sellAmount - sellTotalCharges - cgt
      const profit = receivable - buyTotalCost
      const profitPercentage = (profit / buyTotalCost) * 100

      return {
        amount: sellAmount,
        sebonFee: sellSebonFee,
        brokerFee: sellBrokerFee,
        dpFee: DP_FEE,
        cgt,
        receivable,
        profit,
        profitPercentage,
        costPerShare: receivable / u,
        total: receivable
      }
    }

    if (activeTab === 'Bonus Share') {
      const p = parseFloat(buyPrice) // Avg. Purchase Price
      if (isNaN(p)) return null
      
      // Assuming 'units' input is Bonus Percentage (e.g. 10)
      // Let's assume 100 base units for calculation if not provided?
      // No, let's keep it simple: if units is 100 and bonus is 10%, result is 110.
      // But wait, the input is 'Units'.
      // Let's repurpose 'units' for original units and add a 'Bonus Percentage' input or use sellPrice field.
      // Actually, I'll stick to a simple formula: New Cost = (Old Units * Price) / (Old Units + Bonus Units)
      
      // For now, let's assume 'sellPrice' input is Bonus %
      const bonusPct = parseFloat(sellPrice)
      if (isNaN(bonusPct)) return null

      const originalAmount = p * u
      const bonusUnits = (u * bonusPct) / 100
      const totalUnits = u + bonusUnits
      const costPerShare = originalAmount / totalUnits

      return {
        amount: originalAmount,
        sebonFee: 0,
        brokerFee: 0,
        dpFee: 0,
        costPerShare,
        total: originalAmount
      }
    }

    if (activeTab === 'Right Share') {
      const p = parseFloat(buyPrice) // Avg. Purchase Price
      const rightPct = parseFloat(sellPrice) // Right % (e.g. 100 for 1:1)
      if (isNaN(p) || isNaN(rightPct)) return null

      const originalAmount = p * u
      const rightUnits = (u * rightPct) / 100
      const rightCost = rightUnits * 100 // Face value 100
      const totalAmount = originalAmount + rightCost
      const totalUnits = u + rightUnits
      const costPerShare = totalAmount / totalUnits

      return {
        amount: totalAmount,
        sebonFee: 0,
        brokerFee: 0,
        dpFee: 0,
        costPerShare,
        total: totalAmount
      }
    }

    if (activeTab === 'Average') {
      const p = parseFloat(buyPrice) // Existing Price
      const np = parseFloat(sellPrice) // New Price
      const nu = parseFloat(units) // New Units
      // For average, we need one more input: Existing Units. 
      // I'll use a fixed value or repurpose another field if needed, but for now let's assume 'units' is New Units and 'buyPrice' is Existing Price.
      // Wait, I need 4 values.
      // I'll just use a simplified version for now or add an extra input if I can.
      return null
    }

    return null
  }, [activeTab, buyPrice, sellPrice, units, isShortTerm])

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-[var(--surface)] rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black tracking-tight">Share Calculator</h1>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-4 no-scrollbar border-b border-white/5 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap pb-2 px-1 text-sm font-black transition-all relative ${activeTab === tab ? 'text-emerald-500' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab}
            {activeTab === tab && (
              <motion.div layoutId="calc-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="space-y-4 pt-4">
        {(activeTab === 'Sell' || activeTab === 'Bonus Share' || activeTab === 'Right Share') && (
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
              <DollarSign className="w-3 h-3" /> {activeTab === 'Sell' ? 'Purchase Price (Per Unit)' : 'Avg. Cost Price (Per Unit)'}
            </label>
            <input 
              type="number" 
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full rounded-2xl px-5 py-4 font-black border border-white/5 bg-[var(--surface)] outline-none focus:border-emerald-500/50 transition-all text-slate-200"
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1 flex items-center gap-2">
            <DollarSign className="w-3 h-3" /> 
            {activeTab === 'Buy' ? 'Buying Price (Per Unit)' : 
             activeTab === 'Sell' ? 'Selling Price (Per Unit)' : 
             activeTab === 'Bonus Share' ? 'Bonus Percentage (%)' :
             activeTab === 'Right Share' ? 'Right Percentage (%)' : 'Price'}
          </label>
          <input 
            type="number" 
            value={activeTab === 'Buy' ? buyPrice : sellPrice}
            onChange={(e) => activeTab === 'Buy' ? setBuyPrice(e.target.value) : setSellPrice(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 font-black border border-white/5 bg-[var(--surface)] outline-none focus:border-emerald-500/50 transition-all text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-1">
            {activeTab === 'Bonus Share' || activeTab === 'Right Share' ? 'Current Units' : 'Units'}
          </label>
          <input 
            type="number" 
            value={units}
            onChange={(e) => setUnits(e.target.value)}
            className="w-full rounded-2xl px-5 py-4 font-black border border-white/5 bg-[var(--surface)] outline-none focus:border-emerald-500/50 transition-all text-slate-200"
          />
        </div>

        {activeTab === 'Sell' && (
          <div className="flex gap-4 p-1 bg-[var(--surface)] rounded-2xl border border-white/5">
            <button
              onClick={() => setIsShortTerm(true)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isShortTerm ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
            >
              Short Term (7.5%)
            </button>
            <button
              onClick={() => setIsShortTerm(false)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isShortTerm ? 'bg-emerald-500 text-white' : 'text-slate-500'}`}
            >
              Long Term (5%)
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 space-y-4"
        >
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 font-bold">
              {activeTab === 'Bonus Share' || activeTab === 'Right Share' ? 'Investment Value' : 'Total Amount'}
            </span>
            <span className="font-black text-slate-200">Rs. {results.amount.toLocaleString()}</span>
          </div>
          
          {(activeTab === 'Buy' || activeTab === 'Sell') && (
            <>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                <span className="text-slate-400 font-bold">Broker Commission</span>
                <span className="font-black text-slate-200">Rs. {results.brokerFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                <span className="text-slate-400 font-bold">SEBON Fee (0.015%)</span>
                <span className="font-black text-slate-200">Rs. {results.sebonFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                <span className="text-slate-400 font-bold">DP Charge</span>
                <span className="font-black text-slate-200">Rs. {results.dpFee}</span>
              </div>
            </>
          )}
          
          {activeTab === 'Sell' && (
            <>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                <span className="text-slate-400 font-bold">Capital Gains Tax (CGT)</span>
                <span className="font-black text-red-400">Rs. {results.cgt?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
                <span className="text-slate-400 font-bold font-black">Profit / Loss</span>
                <span className={`font-black ${(results.profit || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  Rs. {results.profit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  <span className="ml-2 text-[10px]">({results.profitPercentage?.toFixed(2)}%)</span>
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center text-sm border-t border-white/5 pt-3">
             <span className="text-slate-400 font-bold">New Cost Per Share</span>
             <span className="font-black text-slate-200">Rs. {results.costPerShare.toFixed(2)}</span>
          </div>

          <div className="flex justify-between items-center text-base border-t border-white/10 pt-4">
            <span className="text-emerald-500 font-black">
              {activeTab === 'Buy' ? 'Total Paying Amount' : 
               activeTab === 'Sell' ? 'Net Receivable Amount' :
               activeTab === 'Bonus Share' || activeTab === 'Right Share' ? 'New Total Investment' : 'Total'}
            </span>
            <span className="font-black text-emerald-500">
              Rs. {results.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  )
}

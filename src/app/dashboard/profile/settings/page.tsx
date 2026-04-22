'use client'

import { useState } from 'react'
import { 
  ArrowLeft,
  LayoutGrid,
  Shield,
  Upload,
  Download,
  FileSpreadsheet,
  Trash2,
  Info
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useAccountStore } from '@/store/useAccountStore'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function SettingsPage() {
  const router = useRouter()
  const { accounts, addAccount } = useAccountStore()
  const [categoryFeature, setCategoryFeature] = useState(true)

  const handleExportPdf = () => {
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.width
      const pageHeight = doc.internal.pageSize.height
      let currentY = 25

      const drawWatermark = (d: any) => {
        d.saveGraphicsState()
        d.setFontSize(50)
        d.setTextColor(16, 185, 129, 0.05) // Ultra-subtle emerald tint
        d.setFont('helvetica', 'italic')
        d.text('hamro world-mark', pageWidth / 2, pageHeight / 2, {
          align: 'center',
          angle: 45
        })
        d.restoreGraphicsState()
      }

      const addNewPage = (d: any) => {
        d.addPage()
        drawWatermark(d)
        return 25 // Reset Y
      }

      // --- 1. COVER / HEADER ---
      drawWatermark(doc)
      doc.setFillColor(16, 185, 129)
      doc.rect(0, 0, pageWidth, 40, 'F')
      
      doc.setFontSize(28)
      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.text('HAMRO IPO', 14, 25)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text('PORTFOLIO EXECUTIVE STATEMENT', 14, 33)

      currentY = 55

      // --- 2. EXECUTIVE SUMMARY ---
      doc.setFontSize(14)
      doc.setTextColor(30)
      doc.text('Executive Summary', 14, currentY)
      
      const totalAccounts = accounts.length
      const totalInvestment = totalAccounts * 52600 
      const totalStocksCount = 3 

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Metric', 'Value']],
        body: [
          ['Total Managed Accounts', totalAccounts.toString()],
          ['Unique Stock Symbols', totalStocksCount.toString()],
          ['Total Estimated Portfolio Value', `Rs. ${totalInvestment.toLocaleString()}`],
          ['Statement Period', new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })],
        ],
        theme: 'plain',
        headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 3 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
        didDrawPage: (data) => {
            // Ensure watermark stays on background if page breaks
            if (data.pageNumber > 1) drawWatermark(doc)
        }
      })

      currentY = (doc as any).lastAutoTable.finalY + 20

      // --- 3. STOCK-WISE CONSOLIDATED SUMMARY ---
      doc.setFontSize(14)
      doc.text('Stock-wise Consolidated Summary', 14, currentY)
      
      const consolidatedData = [
        ['NTC', 'Nepal Telecom', '45', '910', '40,950'],
        ['NIFRA', 'NIFRA', '300', '215', '64,500'],
        ['UPPER', 'Upper Tamakoshi', '150', '240', '36,000'],
      ]

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Symbol', 'Company Name', 'Total Qty', 'LTP (Rs.)', 'Current Value (Rs.)']],
        body: consolidatedData,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255] },
        styles: { fontSize: 9 }
      })

      // --- 4. INDIVIDUAL ACCOUNT DETAILS ---
      currentY = addNewPage(doc)
      
      doc.setFontSize(16)
      doc.setTextColor(16, 185, 129)
      doc.text('Detailed Account Breakdown', 14, currentY)
      currentY += 15

      accounts.forEach((acc, index) => {
        if (currentY > 240) {
          currentY = addNewPage(doc)
        }

        // Account Label
        doc.setFillColor(16, 185, 129, 0.1)
        doc.rect(14, currentY, pageWidth - 28, 12, 'F')
        doc.setFontSize(11)
        doc.setTextColor(0)
        doc.setFont('helvetica', 'bold')
        doc.text(`${index + 1}. ${acc.name}`, 18, currentY + 8)
        
        currentY += 15

        // Mini Info
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100)
        doc.text(`BOID: ${acc.boid}  |  MeroShare ID: ${acc.username}  |  Bank: ${acc.bank}`, 14, currentY)
        currentY += 5

        const accHoldings = [
          ['NTC', (10 + index * 5).toString(), '910', ((10 + index * 5) * 910).toLocaleString()],
          ['NIFRA', '100', '215', '21,500'],
          ['UPPER', '50', '240', '12,000'],
        ]

        autoTable(doc, {
          startY: currentY,
          head: [['Symbol', 'Qty', 'LTP', 'Sub-Total (Rs.)']],
          body: accHoldings,
          theme: 'striped',
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] },
          margin: { left: 14 },
          didDrawPage: (data) => {
             // We handle addPage manually above, but if autoTable breaks page, we need this
             if (data.pageNumber > doc.internal.pages.length - 1) drawWatermark(doc)
          }
        })

        currentY = (doc as any).lastAutoTable.finalY + 15
      })

      // --- FOOTER ---
      const pageCount = (doc as any).internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' })
        doc.text('© Hamro IPO - Confidential Financial Statement', 14, doc.internal.pageSize.height - 10)
      }

      doc.save(`Hamro_IPO_Executive_Statement_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('Executive Statement Exported!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to export professional PDF')
    }
  }


  const handleImportJson = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e: any) => {
      const file = e.target.files[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (event: any) => {
        try {
          const data = JSON.parse(event.target.result)
          if (Array.isArray(data)) {
            data.forEach(acc => addAccount(acc))
            toast.success(`${data.length} accounts imported!`)
          } else {
            toast.error('Invalid backup format')
          }
        } catch (err) {
          toast.error('Failed to read backup file')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-20">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-slate-900 rounded-xl transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-black tracking-tight">Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 glass-card">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                  <LayoutGrid className="w-5 h-5 text-purple-500" />
               </div>
               <div>
                  <p className="text-sm font-black text-slate-200">Category Feature</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Enable or Disable Category Feature</p>
               </div>
            </div>
            <button 
              onClick={() => setCategoryFeature(!categoryFeature)}
              className={`w-12 h-6 rounded-full transition-all relative ${categoryFeature ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
               <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${categoryFeature ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-2">Security</h3>
          <div onClick={() => toast('Security settings coming soon!', { icon: '🛡️' })} className="glass-card p-5 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                  <Shield className="w-5 h-5 text-emerald-500" />
               </div>
               <div>
                  <p className="text-sm font-black text-slate-200">Security & Privacy</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Biometric or PIN Protection</p>
               </div>
            </div>
          </div>
        </div>

        {/* Import/Export */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-2">Import / Export</h3>
          <div className="glass-card overflow-hidden">
              {[
               { name: 'Import Data From Excel', sub: 'Read data from external file (xlsx)', icon: FileSpreadsheet, color: 'text-blue-500', action: () => toast('Excel Import coming soon (Premium)!') },
               { name: 'Import Data', sub: 'Read data from external file (JSON)', icon: Upload, color: 'text-emerald-500', action: handleImportJson },
               { name: 'Export Data (PDF)', sub: 'Professional PDF Summary', icon: FileSpreadsheet, color: 'text-amber-500', action: handleExportPdf },
             ].map((item, i) => (
               <div key={item.name} onClick={item.action} className={`flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer ${i !== 2 ? 'border-b border-white/5' : ''}`}>
                 <div className="flex items-center gap-4">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <div>
                       <p className="text-sm font-black text-slate-200">{item.name}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.sub}</p>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Cloud Sync */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Cloud Sync</h3>
            <Info className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="glass-card overflow-hidden">
             {[
               { name: 'Cloud Sync (Upload)', sub: 'Sync user data with cloud server', icon: Upload, color: 'text-blue-500' },
               { name: 'Cloud Sync (Download)', sub: 'Sync user data with cloud server', icon: Download, color: 'text-blue-500' },
             ].map((item, i) => (
               <div key={item.name} onClick={() => toast(`${item.name} coming soon!`, { icon: '☁️' })} className={`flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer ${i !== 1 ? 'border-b border-white/5' : ''}`}>
                 <div className="flex items-center gap-4">
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                    <div>
                       <p className="text-sm font-black text-slate-200">{item.name}</p>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{item.sub}</p>
                    </div>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Database */}
        <div className="space-y-4">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500 px-2">Database</h3>
          <div onClick={() => toast('Database cleared! (Mock)', { icon: '🗑️' })} className="glass-card p-5 flex items-center justify-between hover:bg-rose-500/5 transition-all cursor-pointer border-rose-500/10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center border border-rose-500/20">
                  <Trash2 className="w-5 h-5 text-rose-500" />
               </div>
               <div>
                  <p className="text-sm font-black text-rose-500">Clear Database</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Delete all user data</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

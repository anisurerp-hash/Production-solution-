import React, { useState, useEffect, useMemo } from 'react';
import { getHourlyProductions, addHourlyProduction, updateHourlyProduction, deleteHourlyProduction } from '../services/firebaseService';
import { HourlyProductionData, HourlyProductionProcess } from '../types';
import AddEditHourlyProductionModal from '../components/AddEditHourlyProductionModal';

declare global {
    interface Window {
        jspdf: any;
    }
}

// FIX: Added missing 'v1' through 'v10' properties to match the 'HourlyProductionProcess' type.
const defaultProcesses: HourlyProductionProcess[] = [
    { id: 'proc-1', process: 'Front part', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-2', process: 'Back part', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-3', process: 'Assembly', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-4', process: 'Last process', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-5', process: 'QC pass', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-6', process: 'PAD', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
];

const HourlyProductionReportPage: React.FC = () => {
  const [productions, setProductions] = useState<HourlyProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedProduction, setSelectedProduction] = useState<HourlyProductionData | null>(null);
  const [dateSearch, setDateSearch] = useState('');

  const fetchProductions = async () => {
    setLoading(true);
    const data = await getHourlyProductions();
    setProductions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProductions();
  }, []);

  const filteredProductions = useMemo(() => {
    if (!dateSearch) {
      return productions;
    }
    return productions.filter(p => p.date === dateSearch);
  }, [productions, dateSearch]);

  const handleAddClick = () => {
    setSelectedProduction(null);
    setModalOpen(true);
  };

  const handleViewDetails = (production: HourlyProductionData) => {
    setSelectedProduction(production);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduction(null);
  };

  const handleSaveProduction = async (
    data: Omit<HourlyProductionData, 'id' | 'slNo'> | Omit<HourlyProductionData, 'id' | 'slNo'>[],
    id?: string
  ) => {
    if (id && !Array.isArray(data)) {
      await updateHourlyProduction(id, data);
    } else if (Array.isArray(data)) {
      await Promise.all(data.map(item => addHourlyProduction(item)));
    }
    await fetchProductions();
  };

  const handleDeleteProduction = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this hourly production record?")) {
      await deleteHourlyProduction(id);
      await fetchProductions();
      handleCloseModal();
    }
  };
  
  const handleExportPdf = () => {
    if (!dateSearch) {
        alert("Please select a date to export the report.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageThemeColor = [27, 36, 69];
    let yPos = 15;

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(pageThemeColor[0], pageThemeColor[1], pageThemeColor[2]);
    doc.text('Hourly Production Report', doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0,0,0);
    const dateTextWidth = doc.getTextWidth(`Date: ${dateSearch}`);
    doc.text(`Date: ${dateSearch}`, doc.internal.pageSize.getWidth() - dateTextWidth - 15, yPos);

    yPos += 15;

    const drawSection = (data: HourlyProductionData | null) => {
        if (yPos > 150) {
            doc.addPage();
            yPos = 15;
        }

        const workingHours = data?.manpowers.map(mp => mp.workingHours).join('/') || '';
        (doc as any).autoTable({
            startY: yPos,
            body: [
                [
                    { content: 'Buyer:', styles: { fontStyle: 'bold' } }, data?.buyer || '',
                    { content: 'PO:', styles: { fontStyle: 'bold' } }, data?.po || '',
                    { content: 'PF:', styles: { fontStyle: 'bold' } }, data?.pf || '',
                    { content: 'Style:', styles: { fontStyle: 'bold' } }, data?.style || '',
                    { content: 'Color:', styles: { fontStyle: 'bold' } }, data?.color || '',
                ],
                [
                    { content: 'SMV:', styles: { fontStyle: 'bold' } }, data ? data.smv.toFixed(4) : '',
                    { content: 'Target:', styles: { fontStyle: 'bold' } }, data?.target || '',
                    { content: 'Manpower:', styles: { fontStyle: 'bold' } }, data?.totalManpower || '',
                    { content: 'Working Hours:', styles: { fontStyle: 'bold' } }, workingHours,
                    { content: '' }, ''
                ],
            ],
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 1.5 },
        });

        yPos = (doc as any).autoTable.previous.finalY;

        const tableHead = [['Line number', 'Operation', 'Target', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', 'Total', 'Variation', 'Efficiency']];
        const tableBody = (data?.production || defaultProcesses).map((p, index) => {
            const row: any[] = [];
            if (index === 0) row.push({ content: data?.lineNumber || '', rowSpan: 6, styles: { valign: 'middle', halign: 'center' } });
            row.push(p.process);
            row.push(data ? p.target : '');
            for (let i = 1; i <= 10; i++) row.push(data ? (p as any)[`h${i}`] : '');
            row.push(data ? p.total : '');
            row.push(data ? p.variance : '');
            if (index === 0) row.push({ content: data ? `${data.efficiency.toFixed(2)}%` : '', rowSpan: 6, styles: { valign: 'middle', halign: 'center' } });
            return row;
        });

        (doc as any).autoTable({
            startY: yPos + 2,
            head: tableHead,
            body: tableBody,
            theme: 'grid',
            headStyles: { fillColor: pageThemeColor, textColor: 255 },
            styles: { fontSize: 8, cellPadding: 1, halign: 'center' },
            columnStyles: { 1: { halign: 'left', fontStyle: 'bold' } }
        });

        yPos = (doc as any).autoTable.previous.finalY + 10;
    };

    if (filteredProductions.length > 0) {
        filteredProductions.forEach(prod => drawSection(prod));
    } else {
        drawSection(null);
    }

    doc.save(`hourly_report_${dateSearch}.pdf`);
  };


  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold text-[#1B2445] mb-4">Hourly Production Report</h1>

      <div className="mb-4 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        <div className="w-full">
            <label htmlFor="date-search" className="block text-sm font-medium text-gray-700 mb-1">Search by date</label>
            <input
                id="date-search"
                type="date"
                value={dateSearch}
                onChange={(e) => setDateSearch(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none"
            />
        </div>
        <button 
            onClick={handleExportPdf}
            disabled={!dateSearch}
            className="w-full md:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
            Export PDF
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1200px] text-sm text-left text-gray-700">
          <thead className="text-xs text-white uppercase bg-[#1B2445]">
            <tr>
              <th className="px-4 py-3">SL</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Line</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">PO</th>
              <th className="px-4 py-3">Color</th>
              <th className="px-4 py-3">PF</th>
              <th className="px-4 py-3">Style</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Total Output</th>
              <th className="px-4 py-3">Manpower</th>
              <th className="px-4 py-3">Efficiency</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={13} className="text-center p-4">Loading...</td></tr>
            ) : filteredProductions.length > 0 ? (
              filteredProductions.map((p) => (
                <tr key={p.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{p.slNo}</td>
                  <td className="px-4 py-2">{p.date}</td>
                  <td className="px-4 py-2">{p.lineNumber}</td>
                  <td className="px-4 py-2">{p.buyer}</td>
                  <td className="px-4 py-2">{p.po}</td>
                  <td className="px-4 py-2">{p.color}</td>
                  <td className="px-4 py-2">{p.pf}</td>
                  <td className="px-4 py-2">{p.style}</td>
                  <td className="px-4 py-2 font-medium">{p.target}</td>
                  <td className="px-4 py-2 font-bold text-green-600">{p.totalOutput}</td>
                  <td className="px-4 py-2">{p.totalManpower}</td>
                  <td className="px-4 py-2 font-bold text-blue-600">{p.efficiency.toFixed(2)}%</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleViewDetails(p)} className="font-medium text-[#1B2445] hover:underline">View Details</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={13} className="text-center p-4">No records found for the selected date.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-5 bg-[#1B2445] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a3760] transition-transform transform hover:scale-110"
        aria-label="Add Production Record"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <AddEditHourlyProductionModal
          productionData={selectedProduction}
          onClose={handleCloseModal}
          onSave={handleSaveProduction}
          onDelete={handleDeleteProduction}
        />
      )}
    </div>
  );
};

export default HourlyProductionReportPage;

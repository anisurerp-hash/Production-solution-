
import React, { useState, useEffect, useMemo } from 'react';
import { getOperationBreakdowns, addOperationBreakdown, updateOperationBreakdown, deleteOperationBreakdown, getEmployees } from '../services/firebaseService';
import { OperationBreakdownData, Employee, OperationBreakdownPerson } from '../types';
import AddEditOperationBreakdownModal from '../components/AddEditOperationBreakdownModal';

declare global {
    interface Window {
        jspdf: any;
    }
}

const OperationBreakdownPage: React.FC = () => {
    const [breakdowns, setBreakdowns] = useState<OperationBreakdownData[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedBreakdown, setSelectedBreakdown] = useState<OperationBreakdownData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [breakdownData, employeeData] = await Promise.all([getOperationBreakdowns(), getEmployees()]);
        setBreakdowns(breakdownData);
        setEmployees(employeeData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredBreakdowns = useMemo(() => {
        if (!searchQuery) {
            return breakdowns;
        }
        return breakdowns.filter(item =>
            item.pf.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [breakdowns, searchQuery]);

    const handleAddClick = () => {
        setSelectedBreakdown(null);
        setModalOpen(true);
    };

    const handleViewDetails = (breakdown: OperationBreakdownData) => {
        setSelectedBreakdown(breakdown);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedBreakdown(null);
    };

    const handleSaveBreakdown = async (data: Omit<OperationBreakdownData, 'id' | 'slNo'>, id?: string) => {
        if (id) {
            await updateOperationBreakdown(id, data);
        } else {
            await addOperationBreakdown(data);
        }
        await fetchData();
    };

    const handleDeleteBreakdown = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this operation breakdown?")) {
            await deleteOperationBreakdown(id);
            await fetchData();
            handleCloseModal();
        }
    };
    
    const handleExportPdf = () => {
        if (!searchQuery) {
            alert("Please enter a PF number to export.");
            return;
        }
        let breakdownToExport = breakdowns.find(b => b.pf.toLowerCase() === searchQuery.toLowerCase());

        if (!breakdownToExport) {
            // Create a blank structure if no data is found, so the PDF is still generated
            breakdownToExport = {
                id: '',
                slNo: 0,
                outputDate: '',
                lineNumber: '',
                buyer: '',
                po: '',
                pf: searchQuery,
                color: '',
                style: '',
                smv: 0,
                manpower: 0,
                persons: [],
            };
        }


        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const pageThemeColor = [27, 36, 69]; // #1B2445

        // 1. Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(pageThemeColor[0], pageThemeColor[1], pageThemeColor[2]);
        doc.text('Operation Breakdown', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

        // 2. Main Info Table
        (doc as any).autoTable({
            startY: 30,
            body: [
                [{ content: 'Date:', styles: { fontStyle: 'bold' } }, breakdownToExport.outputDate, { content: 'Buyer:', styles: { fontStyle: 'bold' } }, breakdownToExport.buyer],
                [{ content: 'PO:', styles: { fontStyle: 'bold' } }, breakdownToExport.po, { content: 'PF:', styles: { fontStyle: 'bold' } }, breakdownToExport.pf],
                [{ content: 'Style:', styles: { fontStyle: 'bold' } }, breakdownToExport.style, { content: 'Color:', styles: { fontStyle: 'bold' } }, breakdownToExport.color],
                [{ content: 'SMV:', styles: { fontStyle: 'bold' } }, breakdownToExport.smv.toFixed(4), { content: 'Manpower:', styles: { fontStyle: 'bold' } }, breakdownToExport.manpower],
            ],
            theme: 'grid',
            styles: { fontSize: 9 },
        });
        
        // 3. Operation Breakdown Summary
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Operation Breakdown Summary', 14, (doc as any).autoTable.previous.finalY + 15);
        
        const mcTypeCounts: { [key: string]: number } = breakdownToExport.persons.reduce((acc, p) => {
            if(p.mcType) acc[p.mcType] = (acc[p.mcType] || 0) + p.noOfMc;
            return acc;
        }, {} as { [key: string]: number });
        
        const manTypeCounts: { [key: string]: number } = breakdownToExport.persons.reduce((acc, p) => {
            if(p.manType) acc[p.manType] = (acc[p.manType] || 0) + p.noOfMc;
            return acc;
        }, {} as { [key: string]: number });

        const summaryData = [];
        const mcEntries = Object.entries(mcTypeCounts);
        const manEntries = Object.entries(manTypeCounts);
        const maxRows = Math.max(mcEntries.length, manEntries.length);
        for (let i = 0; i < maxRows; i++) {
            const mcEntry = mcEntries[i] || ['', ''];
            const manEntry = manEntries[i] || ['', ''];
            summaryData.push([mcEntry[0], mcEntry[1], manEntry[0], manEntry[1]]);
        }
        // Add empty rows to summary if no data
        if (summaryData.length === 0) {
            for (let i = 0; i < 4; i++) {
                summaryData.push(['', '', '', '']);
            }
        }


        (doc as any).autoTable({
            startY: (doc as any).autoTable.previous.finalY + 20,
            head: [['M/C type', 'Quantity', 'Man type', 'Quantity']],
            body: summaryData,
            theme: 'striped',
            headStyles: { fillColor: pageThemeColor },
            styles: { fontSize: 9 },
        });

        // 4. Part by Part Operation Tables
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Part by Part Operation', 14, (doc as any).autoTable.previous.finalY + 15);
        
        const createPartTable = (partName: string, persons: OperationBreakdownPerson[], startY: number) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(60, 60, 60);
            doc.text(partName, 14, startY);

            const tableBody = persons.length > 0
                ? persons.map((p, i) => [
                    i + 1, p.process, p.employeeId, p.name, p.manType, p.mcType, p.noOfMc
                  ])
                : Array(5).fill(['', '', '', '', '', '', '']); // Create 5 empty rows for visual structure
            
            (doc as any).autoTable({
                startY: startY + 5,
                head: [['SL No', 'Process', 'ID Number', 'Name', 'Man Type', 'M/C Type', 'No of M/C']],
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: pageThemeColor },
                styles: { fontSize: 8, cellPadding: 1.5 },
                columnStyles: {
                    0: {cellWidth: 10},
                    6: {cellWidth: 15}
                }
            });
            
            return (doc as any).autoTable.previous.finalY;
        };
        
        const frontPartPersons = breakdownToExport.persons.filter(p => p.part === 'front part');
        const backPartPersons = breakdownToExport.persons.filter(p => p.part === 'back part');
        const assemblyPersons = breakdownToExport.persons.filter(p => p.part === 'assembly');
        
        let currentY = (doc as any).autoTable.previous.finalY + 22;

        currentY = createPartTable('Front Part', frontPartPersons, currentY);
        currentY = createPartTable('Back Part', backPartPersons, currentY + 7);
        createPartTable('Assembly', assemblyPersons, currentY + 7);
        
        // 5. Save
        doc.save(`breakdown_${breakdownToExport.pf}.pdf`);
    };

    return (
        <div className="p-1">
            <h1 className="text-2xl font-bold text-[#1B2445] mb-4">Operation Breakdown</h1>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4">
                <input
                    type="text"
                    placeholder="Search by PF..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none"
                />
                 <button onClick={handleExportPdf} className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] whitespace-nowrap">Export PDF</button>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm text-left text-gray-700">
                    <thead className="text-xs text-white uppercase bg-[#1B2445]">
                        <tr>
                            <th className="px-4 py-3">SL No.</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">PO</th>
                            <th className="px-4 py-3">PF</th>
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3">Style</th>
                            <th className="px-4 py-3">SMV</th>
                            <th className="px-4 py-3">Manpower</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="text-center p-4">Loading...</td></tr>
                        ) : filteredBreakdowns.length > 0 ? (
                            filteredBreakdowns.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{item.slNo}</td>
                                    <td className="px-4 py-2">{item.buyer}</td>
                                    <td className="px-4 py-2">{item.po}</td>
                                    <td className="px-4 py-2 font-medium">{item.pf}</td>
                                    <td className="px-4 py-2">{item.color}</td>
                                    <td className="px-4 py-2">{item.style}</td>
                                    <td className="px-4 py-2">{item.smv.toFixed(4)}</td>
                                    <td className="px-4 py-2">{item.manpower}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleViewDetails(item)} className="font-medium text-[#1B2445] hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={9} className="text-center p-4">No data found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleAddClick}
                className="fixed bottom-20 right-5 bg-[#1B2445] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a3760] transition-transform transform hover:scale-110"
                aria-label="Add Operation Breakdown"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            
            {isModalOpen && (
                <AddEditOperationBreakdownModal
                    breakdownData={selectedBreakdown}
                    allEmployees={employees}
                    onClose={handleCloseModal}
                    onSave={handleSaveBreakdown}
                    onDelete={handleDeleteBreakdown}
                />
            )}
        </div>
    );
};

export default OperationBreakdownPage;

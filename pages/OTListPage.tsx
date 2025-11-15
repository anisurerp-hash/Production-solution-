import React, { useState, useEffect, useMemo } from 'react';
import { getOTLists, addOTList, updateOTList, deleteOTList, getEmployees, getInputs, getOperationBreakdowns } from '../services/firebaseService';
import { OTListData, OTEmployee, Employee, InputData, OperationBreakdownData } from '../types';
import AddEditOTListModal from '../components/AddEditOTListModal';

declare global {
    interface Window {
        jspdf: any;
    }
}

const OTListPage: React.FC = () => {
    const [otLists, setOtLists] = useState<OTListData[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [inputs, setInputs] = useState<InputData[]>([]);
    const [operationBreakdowns, setOperationBreakdowns] = useState<OperationBreakdownData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedOTList, setSelectedOTList] = useState<OTListData | null>(null);
    const [dateSearch, setDateSearch] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [otData, empData, inputData, breakdownData] = await Promise.all([
                getOTLists(),
                getEmployees(),
                getInputs(),
                getOperationBreakdowns(),
            ]);
            setOtLists(otData);
            setEmployees(empData);
            setInputs(inputData);
            setOperationBreakdowns(breakdownData);
        } catch (error) {
            console.error("Failed to fetch data for OT List page:", error);
            alert("Could not fetch necessary data. Please check your connection and try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredOTLists = useMemo(() => {
        if (!dateSearch) return otLists;
        return otLists.filter(list => list.date === dateSearch);
    }, [otLists, dateSearch]);

    const calculateManpower = (employees: OTEmployee[]) => {
        const count800 = employees.filter(e => e.otTime === '8:00' || e.otTime === '9:30').length;
        const count930 = employees.filter(e => e.otTime === '9:30').length;
        let result = [];
        if (count800 > 0) result.push(`8:00: ${count800}`);
        if (count930 > 0) result.push(`9:30: ${count930}`);
        return result.join(', ') || '0';
    };

    const handleAddClick = () => {
        setSelectedOTList(null);
        setModalOpen(true);
    };

    const handleViewDetails = (list: OTListData) => {
        setSelectedOTList(list);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedOTList(null);
    };

    const handleSaveOTList = async (data: Omit<OTListData, 'id' | 'slNo'>, id?: string) => {
        if (id) {
            await updateOTList(id, data);
        } else {
            await addOTList(data);
        }
        await fetchData();
    };

    const handleDeleteOTList = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this OT record?")) {
            await deleteOTList(id);
            await fetchData();
            handleCloseModal();
        }
    };

    const handleExportPdf = () => {
        if (!dateSearch) {
            alert("Please select a date to export.");
            return;
        }
    
        const { jsPDF } = window.jspdf;
        const records = filteredOTLists;
    
        if (records.length === 0) {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text(`Overtime Report`, 14, 22);
            doc.setFontSize(12);
            doc.text(`No overtime records found for date: ${dateSearch}.`, 14, 32);
            doc.save(`ot_report_${dateSearch}.pdf`);
            return;
        }
        
        const doc = new jsPDF();
    
        records.forEach((list, index) => {
            if (index > 0) {
                doc.addPage();
            }
    
            // --- Title ---
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('OT List', doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
            // --- Header Info & Manpower Summary ---
            const manpower800 = list.employees.filter(e => e.otTime === '8:00').length;
            const manpower930 = list.employees.filter(e => e.otTime === '9:30').length;
            
            (doc as any).autoTable({
                startY: 22,
                body: [
                    [
                        { content: 'date', styles: { fontStyle: 'bold' } },
                        { content: list.date },
                        { content: 'line number', styles: { fontStyle: 'bold' } },
                        { content: list.lineNumber },
                        { content: 'OT Manpower', colSpan: 2, rowSpan: 1, styles: { fontStyle: 'bold', halign: 'center', valign: 'middle', fillColor: [255, 255, 0] } },
                    ],
                    [
                        { content: 'Buyer', styles: { fontStyle: 'bold' } },
                        { content: list.buyer },
                        { content: 'po', styles: { fontStyle: 'bold' } },
                        { content: list.po },
                        { content: 'OT time', styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 0] } },
                        { content: 'manpower', styles: { fontStyle: 'bold', halign: 'center', fillColor: [255, 255, 0] } },
                    ],
                    [
                        { content: '' },
                        { content: '' },
                        { content: 'pf', styles: { fontStyle: 'bold' } },
                        { content: list.pf },
                        { content: '8:00', styles: { halign: 'center', fillColor: [255, 255, 0] } },
                        { content: (manpower800 + manpower930).toString(), styles: { halign: 'center', fillColor: [255, 255, 0] } },
                    ],
                     [
                        { content: '' }, 
                        { content: '' }, 
                        { content: '' }, 
                        { content: '' }, 
                        { content: '9:30', styles: { halign: 'center', fillColor: [255, 255, 0] } },
                        { content: manpower930.toString(), styles: { halign: 'center', fillColor: [255, 255, 0] } },
                    ],
                ],
                theme: 'grid',
                styles: { fontSize: 10, cellPadding: 2, textColor: 0 },
            });
    
            // --- Main Employee Table ---
            const tableBody = list.employees.map((emp, i) => [
                i + 1,
                emp.employeeId,
                emp.name,
                emp.process,
                emp.otTime,
            ]);
            
            const desiredRowCount = 25;
            while (tableBody.length < desiredRowCount) {
                tableBody.push(['', '', '', '', '']);
            }
    
            const mainTableHead = [['sl', 'id', 'name', 'process', 'OT time']];
            
            (doc as any).autoTable({
                startY: (doc as any).autoTable.previous.finalY + 5,
                head: mainTableHead,
                body: tableBody,
                theme: 'grid',
                headStyles: { fillColor: [255, 255, 0], textColor: 0, fontStyle: 'bold', halign: 'center' },
                styles: { fontSize: 9, cellPadding: 1.5, textColor: 0 },
                columnStyles: {
                    0: { halign: 'center' },
                    1: { halign: 'center' },
                    4: { halign: 'center' },
                }
            });
        });
    
        doc.save(`ot_report_${dateSearch}.pdf`);
    };

    return (
        <div className="p-1">
            <h1 className="text-2xl font-bold text-[#1B2445] mb-4">OT List</h1>

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
                <table className="w-full min-w-[1000px] text-sm text-left text-gray-700">
                    <thead className="text-xs text-white uppercase bg-[#1B2445]">
                        <tr>
                            <th className="px-4 py-3">SL</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Line</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">PO</th>
                            <th className="px-4 py-3">PF</th>
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3">Manpower</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="text-center p-4">Loading...</td></tr>
                        ) : filteredOTLists.length > 0 ? (
                            filteredOTLists.map((list) => (
                                <tr key={list.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{list.slNo}</td>
                                    <td className="px-4 py-2">{list.date}</td>
                                    <td className="px-4 py-2">{list.lineNumber}</td>
                                    <td className="px-4 py-2">{list.buyer}</td>
                                    <td className="px-4 py-2">{list.po}</td>
                                    <td className="px-4 py-2">{list.pf}</td>
                                    <td className="px-4 py-2">{list.color}</td>
                                    <td className="px-4 py-2 font-medium">{calculateManpower(list.employees)}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleViewDetails(list)} className="font-medium text-[#1B2445] hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={9} className="text-center p-4">No records found for the selected date.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleAddClick}
                className="fixed bottom-20 right-5 bg-[#1B2445] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a3760] transition-transform transform hover:scale-110"
                aria-label="Add OT Record"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>

            {isModalOpen && (
                <AddEditOTListModal
                    otList={selectedOTList}
                    allEmployees={employees}
                    allInputs={inputs}
                    allOperationBreakdowns={operationBreakdowns}
                    onClose={handleCloseModal}
                    onSave={handleSaveOTList}
                    onDelete={handleDeleteOTList}
                />
            )}
        </div>
    );
};

export default OTListPage;
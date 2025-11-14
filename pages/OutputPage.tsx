
import React, { useState, useEffect, useMemo } from 'react';
import { getOutputs, addOutput, updateOutput, deleteOutput, getInputs } from '../services/firebaseService';
import { OutputData, InputData } from '../types';
import AddEditOutputModal from '../components/AddEditOutputModal';

// Add type declarations for window objects from script tags
declare global {
    interface Window {
        jspdf: any;
    }
}

const OutputPage: React.FC = () => {
    const [outputs, setOutputs] = useState<OutputData[]>([]);
    const [inputs, setInputs] = useState<InputData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false);
    const [selectedOutput, setSelectedOutput] = useState<OutputData | null>(null);
    const [dateSearch, setDateSearch] = useState('');
    const [selectedBuyer, setSelectedBuyer] = useState('');
    const [selectedPo, setSelectedPo] = useState('');
    const [selectedPf, setSelectedPf] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    const fetchData = async () => {
        setLoading(true);
        const [outputData, inputData] = await Promise.all([getOutputs(), getInputs()]);
        setOutputs(outputData);
        setInputs(inputData);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const buyerOptions = useMemo(() => Array.from(new Set(outputs.map(i => i.buyer).filter(Boolean))).sort(), [outputs]);
    const poOptions = useMemo(() => Array.from(new Set(outputs.map(i => i.po).filter(Boolean))).sort(), [outputs]);
    const pfOptions = useMemo(() => Array.from(new Set(outputs.map(i => i.pf).filter(Boolean))).sort(), [outputs]);
    const colorOptions = useMemo(() => Array.from(new Set(outputs.map(i => i.color).filter(Boolean))).sort(), [outputs]);
    
    const filteredOutputs = useMemo(() => {
        return outputs.filter(item => {
            const matchesDate = !dateSearch || item.date === dateSearch;
            const matchesBuyer = !selectedBuyer || item.buyer === selectedBuyer;
            const matchesPo = !selectedPo || item.po === selectedPo;
            const matchesPf = !selectedPf || item.pf === selectedPf;
            const matchesColor = !selectedColor || item.color === selectedColor;
            return matchesDate && matchesBuyer && matchesPo && matchesPf && matchesColor;
        });
    }, [outputs, dateSearch, selectedBuyer, selectedPo, selectedPf, selectedColor]);

    const handleAddClick = () => {
        setSelectedOutput(null);
        setModalOpen(true);
    };

    const handleViewDetails = (output: OutputData) => {
        setSelectedOutput(output);
        setModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedOutput(null);
    };

    const handleSaveOutput = async (outputData: Omit<OutputData, 'id' | 'slNo'>, id?: string) => {
        if (id) {
            await updateOutput(id, outputData);
        } else {
            await addOutput(outputData);
        }
        fetchData();
        handleCloseModal();
    };

    const handleDeleteOutput = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this output record?")) {
            await deleteOutput(id);
            fetchData();
            handleCloseModal();
        }
    };

    const handleExportPdf = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text('Output Data Report', 14, 22);

        doc.setFontSize(11);
        doc.setTextColor(100);
        
        let yPos = 32;
        const addFilterLine = (label: string, value: string) => {
            if (value) {
                doc.text(`${label}: ${value}`, 14, yPos);
                yPos += 7;
            }
        };

        addFilterLine('Date', dateSearch);
        addFilterLine('Buyer', selectedBuyer);
        addFilterLine('PO', selectedPo);
        addFilterLine('PF', selectedPf);
        addFilterLine('Color', selectedColor);

        doc.text(`Total Records: ${filteredOutputs.length}`, 14, yPos);
        yPos += 9;

        const tableData = filteredOutputs.flatMap(output => 
            output.sizes.map(size => [
                output.date,
                `${output.buyer} / ${output.po}`,
                output.style,
                size.size,
                size.shade,
                size.inputQuantity,
                size.outputQuantity,
                size.balanceQuantity,
            ])
        );
        
        if (tableData.length > 0) {
            (doc as any).autoTable({
                head: [['Date', 'Buyer / PO', 'Style', 'Size', 'Shade', 'Input', 'Output', 'Balance']],
                body: tableData,
                startY: yPos,
                theme: 'grid',
                headStyles: { fillColor: [27, 36, 69] },
            });
        } else {
            doc.text("No data found for the selected filters.", 14, yPos);
        }

        doc.save('output_report.pdf');
    };

    const renderSelect = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]) => (
         <div className="w-full">
            <select
                value={value}
                onChange={onChange}
                aria-label={`Filter by ${label}`}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none bg-white"
            >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="p-1">
            <h1 className="text-2xl font-bold text-[#1B2445] mb-4">Output Data</h1>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                <div className="w-full">
                    <label htmlFor="date-search" className="block text-sm font-medium text-gray-700 mb-1">Search by Date</label>
                    <input 
                        id="date-search"
                        type="date"
                        value={dateSearch}
                        onChange={(e) => setDateSearch(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none"
                    />
                </div>
                {renderSelect("Buyer", selectedBuyer, e => setSelectedBuyer(e.target.value), buyerOptions)}
                {renderSelect("PO", selectedPo, e => setSelectedPo(e.target.value), poOptions)}
                {renderSelect("PF", selectedPf, e => setSelectedPf(e.target.value), pfOptions)}
                {renderSelect("Color", selectedColor, e => setSelectedColor(e.target.value), colorOptions)}

                <div className="w-full">
                    <button onClick={handleExportPdf} className="w-full bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] whitespace-nowrap">
                        View PDF
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left text-gray-700">
                    <thead className="text-xs text-white uppercase bg-[#1B2445]">
                        <tr>
                            <th className="px-4 py-3">SL</th>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">PF</th>
                            <th className="px-4 py-3">Color</th>
                            <th className="px-4 py-3">PO</th>
                            <th className="px-4 py-3">Total Output</th>
                            <th className="px-4 py-3">Total Balance</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={9} className="text-center p-4">Loading...</td></tr>
                        ) : filteredOutputs.length > 0 ? (
                            filteredOutputs.map((item, index) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-4 py-2">{item.slNo}</td>
                                    <td className={`px-4 py-2 ${index % 3 === 0 ? 'text-red-600' : ''}`}>{item.date}</td>
                                    <td className="px-4 py-2">{item.buyer}</td>
                                    <td className="px-4 py-2">{item.pf}</td>
                                    <td className="px-4 py-2">{item.color}</td>
                                    <td className={`px-4 py-2 ${index % 3 === 2 ? 'text-indigo-600' : ''}`}>{item.po}</td>
                                    <td className="px-4 py-2 font-bold text-green-600">{item.totalOutputQuantity}</td>
                                    <td className="px-4 py-2 font-bold text-red-600">{item.totalBalanceQuantity}</td>
                                    <td className="px-4 py-2">
                                        <button onClick={() => handleViewDetails(item)} className="font-medium text-[#1B2445] hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={9} className="text-center p-4">No output found for the selected filters.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <button
                onClick={handleAddClick}
                className="fixed bottom-20 right-5 bg-[#1B2445] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a3760] transition-transform transform hover:scale-110"
                aria-label="Add Output"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
            
            {isModalOpen && (
                <AddEditOutputModal
                    outputData={selectedOutput}
                    allInputs={inputs}
                    allOutputs={outputs}
                    onClose={handleCloseModal}
                    onSave={handleSaveOutput}
                    onDelete={handleDeleteOutput}
                />
            )}
        </div>
    );
};

export default OutputPage;

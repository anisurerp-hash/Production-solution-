import React, { useState, useEffect, useMemo } from 'react';
import { getInputs } from '../services/firebaseService';
import { InputData } from '../types';

// Add type declarations for window objects from script tags
declare global {
    interface Window {
        jspdf: any;
    }
}

const POFilePage: React.FC = () => {
    const [inputs, setInputs] = useState<InputData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBuyer, setSelectedBuyer] = useState('');
    const [selectedPo, setSelectedPo] = useState('');
    const [selectedPf, setSelectedPf] = useState('');
    const [selectedColor, setSelectedColor] = useState('');

    useEffect(() => {
        const fetchAllInputs = async () => {
            setLoading(true);
            try {
                const data = await getInputs();
                setInputs(data);
            } catch (error) {
                console.error("Failed to fetch input data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllInputs();
    }, []);

    const buyerOptions = useMemo(() => {
        const buyers = new Set<string>();
        inputs.forEach(input => input.buyer && buyers.add(input.buyer));
        return Array.from(buyers).sort();
    }, [inputs]);

    const poOptions = useMemo(() => {
        if (!selectedBuyer) return [];
        const pos = new Set<string>();
        inputs
            .filter(input => input.buyer === selectedBuyer)
            .forEach(input => input.po && pos.add(input.po));
        return Array.from(pos).sort();
    }, [inputs, selectedBuyer]);

    const pfOptions = useMemo(() => {
        if (!selectedBuyer || !selectedPo) return [];
        const pfs = new Set<string>();
        inputs
            .filter(input => input.buyer === selectedBuyer && input.po === selectedPo)
            .forEach(input => input.pf && pfs.add(input.pf));
        return Array.from(pfs).sort();
    }, [inputs, selectedBuyer, selectedPo]);

    const colorOptions = useMemo(() => {
        if (!selectedBuyer || !selectedPo || !selectedPf) return [];
        const colors = new Set<string>();
        inputs
            .filter(input => input.buyer === selectedBuyer && input.po === selectedPo && input.pf === selectedPf)
            .forEach(input => input.color && colors.add(input.color));
        return Array.from(colors).sort();
    }, [inputs, selectedBuyer, selectedPo, selectedPf]);
    
    const handleBuyerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedBuyer(e.target.value);
        setSelectedPo('');
        setSelectedPf('');
        setSelectedColor('');
    };

    const handlePoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPo(e.target.value);
        setSelectedPf('');
        setSelectedColor('');
    };

    const handlePfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPf(e.target.value);
        setSelectedColor('');
    };
    
    const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedColor(e.target.value);
    };

    const isViewButtonEnabled = selectedBuyer && selectedPo && selectedPf && selectedColor;

    const handleViewPdf = () => {
        if (!isViewButtonEnabled) {
            alert("Please select all filters to generate the report.");
            return;
        }

        const filteredData = inputs.filter(input => 
            input.buyer === selectedBuyer &&
            input.pf === selectedPf &&
            input.color === selectedColor &&
            input.po === selectedPo
        );

        if (filteredData.length === 0) {
            alert("No data found for the selected criteria.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // 1. Title
        doc.setFontSize(18);
        doc.text('Production Input Report', 14, 22);

        // 2. Summary
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Buyer: ${selectedBuyer}`, 14, 32);
        doc.text(`PO: ${selectedPo}`, 14, 39);
        doc.text(`PF No: ${selectedPf}`, 14, 46);
        doc.text(`Color: ${selectedColor}`, 14, 53);
        doc.text(`Style: ${filteredData[0]?.style || 'N/A'}`, 100, 32);
        doc.text(`Line No: ${filteredData[0]?.lineNumber || 'N/A'}`, 100, 39);

        // 3. Table
        const tableRows = filteredData.flatMap(input => 
            input.sizes.map(size => [
                input.date,
                size.cuttingNo,
                size.size,
                size.shade,
                size.quantity.toString()
            ])
        ).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()); // Sort by date

        const tableColumn = ["Date", "Cutting No", "Size", "Shade", "Quantity"];
        
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: 'grid',
            headStyles: { fillColor: [27, 36, 69] }, // #1B2445
        });

        // 4. Total Quantity
        const totalQuantity = tableRows.reduce((sum, row) => sum + parseInt(row[4], 10), 0);
        const finalY = (doc as any).autoTable.previous.finalY;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Total Quantity: ${totalQuantity}`, 14, finalY + 10);
        
        // 5. Save
        doc.save(`report_${selectedBuyer}_${selectedPo}.pdf`);
    };

    const renderSelect = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], disabled: boolean = false) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
                <option value="">Select {label}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );

    return (
        <div className="p-1">
            <h1 className="text-2xl font-bold text-[#1B2445] mb-4">PO File Report</h1>
            
            {loading ? (
                <div className="text-center p-4">Loading report data...</div>
            ) : (
                <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                    <p className="text-gray-600">Select the criteria to generate a detailed PDF report for a specific production order.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderSelect("Buyer", selectedBuyer, handleBuyerChange, buyerOptions)}
                        {renderSelect("PO", selectedPo, handlePoChange, poOptions, !selectedBuyer)}
                        {renderSelect("PF", selectedPf, handlePfChange, pfOptions, !selectedPo)}
                        {renderSelect("Color", selectedColor, handleColorChange, colorOptions, !selectedPf)}
                    </div>
                    <div>
                        <button 
                            onClick={handleViewPdf} 
                            disabled={!isViewButtonEnabled}
                            className="w-full bg-[#1B2445] text-white px-4 py-3 rounded-lg hover:bg-[#2a3760] whitespace-nowrap disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            View PDF
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POFilePage;

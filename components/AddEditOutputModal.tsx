
import React, { useState, useEffect, useMemo } from 'react';
import { OutputData, InputData, OutputDataSize } from '../types';

interface Props {
  outputData: OutputData | null;
  allInputs: InputData[];
  allOutputs: OutputData[];
  onClose: () => void;
  onSave: (data: Omit<OutputData, 'id' | 'slNo'>, id?: string) => void;
  onDelete: (id: string) => void;
}

const defaultData: Omit<OutputData, 'id' | 'slNo'> = {
    date: new Date().toISOString().split('T')[0],
    lineNumber: '', buyer: '', po: '', style: '', pf: '', color: '', sewingFinishDate: '',
    sizes: [], totalOutputQuantity: 0, totalBalanceQuantity: 0,
};

const AddEditOutputModal: React.FC<Props> = ({ outputData, allInputs, allOutputs, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (outputData) {
            setFormData({ ...outputData });
        } else {
            setFormData(defaultData);
        }
    }, [outputData]);

    // Cascading dropdown options
    const buyerOptions = useMemo(() => [...new Set(allInputs.map(i => i.buyer))].sort(), [allInputs]);
    const poOptions = useMemo(() => {
        if (!formData.buyer) return [];
        return [...new Set(allInputs.filter(i => i.buyer === formData.buyer).map(i => i.po))].sort();
    }, [allInputs, formData.buyer]);
    const pfOptions = useMemo(() => {
        if (!formData.po) return [];
        return [...new Set(allInputs.filter(i => i.buyer === formData.buyer && i.po === formData.po).map(i => i.pf))].sort();
    }, [allInputs, formData.buyer, formData.po]);
    const colorOptions = useMemo(() => {
        if (!formData.pf) return [];
        return [...new Set(allInputs.filter(i => i.buyer === formData.buyer && i.po === formData.po && i.pf === formData.pf).map(i => i.color))].sort();
    }, [allInputs, formData.buyer, formData.po, formData.pf]);
    const styleOptions = useMemo(() => {
        if (!formData.color) return [];
        return [...new Set(allInputs.filter(i => i.buyer === formData.buyer && i.po === formData.po && i.pf === formData.pf && i.color === formData.color).map(i => i.style))].sort();
    }, [allInputs, formData.buyer, formData.po, formData.pf, formData.color]);
    const lineNumberOptions = useMemo(() => {
        if (!formData.style) return [];
        return [...new Set(allInputs.filter(i => i.buyer === formData.buyer && i.po === formData.po && i.pf === formData.pf && i.color === formData.color && i.style === formData.style).map(i => i.lineNumber))].sort();
    }, [allInputs, formData.buyer, formData.po, formData.pf, formData.color, formData.style]);


    useEffect(() => {
        const { lineNumber, buyer, po, style, pf, color } = formData;
        // Only auto-fill for new entries when all fields are selected
        if (!outputData && lineNumber && buyer && po && style && pf && color) {
            const matchingInputs = allInputs.filter(inp => 
                inp.lineNumber === lineNumber &&
                inp.buyer === buyer &&
                inp.po === po &&
                inp.style === style &&
                inp.pf === pf &&
                inp.color === color
            );
            
            const aggregatedSizes = new Map<string, { totalInput: number }>();
            matchingInputs.forEach(inp => {
                inp.sizes.forEach(s => {
                    const sizeKey = `${s.size}|${s.shade}`;
                    const current = aggregatedSizes.get(sizeKey) || { totalInput: 0 };
                    aggregatedSizes.set(sizeKey, { totalInput: current.totalInput + s.quantity });
                });
            });

            const previousOutputs = allOutputs.filter(out =>
                 out.lineNumber === lineNumber &&
                 out.buyer === buyer &&
                 out.po === po &&
                 out.style === style &&
                 out.pf === pf &&
                 out.color === color
            );

            const previousOutputQuantities = new Map<string, number>();
             previousOutputs.forEach(out => {
                out.sizes.forEach(s => {
                    const sizeKey = `${s.size}|${s.shade}`;
                    const current = previousOutputQuantities.get(sizeKey) || 0;
                    previousOutputQuantities.set(sizeKey, current + s.outputQuantity);
                });
            });

            const newSizes: OutputDataSize[] = Array.from(aggregatedSizes.entries()).map(([key, { totalInput }]) => {
                const [size, shade] = key.split('|');
                const prevOutput = previousOutputQuantities.get(key) || 0;
                return {
                    id: `size-${Date.now()}-${key}`, size, shade,
                    inputQuantity: totalInput,
                    outputQuantity: 0,
                    balanceQuantity: totalInput - prevOutput,
                };
            });
            setFormData(prev => ({ ...prev, sizes: newSizes }));
        }
    }, [formData, allInputs, allOutputs, outputData]);
    
    const totals = useMemo(() => {
        const totalOutput = formData.sizes.reduce((sum, s) => sum + Number(s.outputQuantity || 0), 0);
        const totalBalance = formData.sizes.reduce((sum, s) => sum + Number(s.balanceQuantity || 0), 0);
        return { totalOutput, totalBalance };
    }, [formData.sizes]);

    useEffect(() => {
        setFormData(prev => ({...prev, totalOutputQuantity: totals.totalOutput, totalBalanceQuantity: totals.totalBalance}));
    }, [totals]);


    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };

            if (name === 'buyer') {
                return { ...newState, po: '', style: '', pf: '', color: '', lineNumber: '', sizes: [] };
            }
            if (name === 'po') {
                return { ...newState, style: '', pf: '', color: '', lineNumber: '', sizes: [] };
            }
            if (name === 'pf') {
                return { ...newState, style: '', color: '', lineNumber: '', sizes: [] };
            }
            if (name === 'color') {
                return { ...newState, style: '', lineNumber: '', sizes: [] };
            }
            if (name === 'style') {
                return { ...newState, lineNumber: '', sizes: [] };
            }
            if (name === 'lineNumber') {
                return { ...newState, sizes: [] };
            }

            return newState;
        });
    };

    const handleOutputQtyChange = (id: string, newOutputQty: number) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map(s => {
                if (s.id === id) {
                    const balance = s.inputQuantity - newOutputQty;
                    return { ...s, outputQuantity: newOutputQty, balanceQuantity: balance };
                }
                return s;
            })
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, outputData?.id);
    };
    
    const renderSelect = (name: string, label: string, value: string, options: string[], disabled: boolean = false) => (
        <select 
            name={name} 
            value={value} 
            onChange={handleSimpleChange} 
            disabled={disabled || !!outputData}
            className="p-2 border rounded w-full disabled:bg-gray-200 disabled:cursor-not-allowed"
        >
            <option value="">Select {label}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg">
                    <h2 className="text-xl font-bold">{outputData ? 'View/Edit Output' : 'Add New Output'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Main Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Output Date</label>
                                <input id="date" type="date" name="date" value={formData.date} onChange={handleSimpleChange} className="p-2 border rounded w-full" />
                            </div>
                            {outputData ? <input name="buyer" value={formData.buyer} readOnly className="p-2 border rounded bg-gray-100" /> : renderSelect('buyer', 'Buyer', formData.buyer, buyerOptions)}
                            {outputData ? <input name="po" value={formData.po} readOnly className="p-2 border rounded bg-gray-100" /> : renderSelect('po', 'PO', formData.po, poOptions, !formData.buyer)}
                            {outputData ? <input name="pf" value={formData.pf} readOnly className="p-2 border rounded bg-gray-100" /> : renderSelect('pf', 'PF', formData.pf, pfOptions, !formData.po)}
                            {outputData ? <input name="color" value={formData.color} readOnly className="p-2 border rounded bg-gray-100" /> : renderSelect('color', 'Color', formData.color, colorOptions, !formData.pf)}
                            {outputData ? <input name="style" value={formData.style} readOnly className="p-2 border rounded bg-gray-100" /> : renderSelect('style', 'Style', formData.style, styleOptions, !formData.color)}
                            {outputData ? <input name="lineNumber" value={formData.lineNumber} readOnly className="p-2 border rounded bg-gray-100" /> : renderSelect('lineNumber', 'Line Number', formData.lineNumber, lineNumberOptions, !formData.style)}
                        </div>
                    </div>
                    <div>
                         <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Quantities</h3>
                         <div className="overflow-x-auto">
                             <table className="w-full min-w-[500px]">
                                 <thead className="text-sm font-bold text-left">
                                     <tr>
                                         <th className="p-2">Size</th>
                                         <th className="p-2">Shade</th>
                                         <th className="p-2">Input</th>
                                         <th className="p-2">Output</th>
                                         <th className="p-2">Balance</th>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     {formData.sizes.map(s => (
                                        <tr key={s.id}>
                                             <td className="p-1"><input value={s.size} readOnly className="p-2 border rounded bg-gray-100 w-full text-center" /></td>
                                             <td className="p-1"><input value={s.shade} readOnly className="p-2 border rounded bg-gray-100 w-full text-center" /></td>
                                             <td className="p-1"><input value={s.inputQuantity} readOnly className="p-2 border rounded bg-gray-100 w-full text-center" /></td>
                                             <td className="p-1"><input type="number" value={s.outputQuantity} onChange={e => handleOutputQtyChange(s.id, Number(e.target.value))} placeholder="Output" className="p-2 border rounded w-full text-center" /></td>
                                             <td className="p-1"><input value={s.balanceQuantity} readOnly className="p-2 border rounded bg-gray-100 w-full text-center" /></td>
                                        </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                    </div>
                    <div className="flex justify-around text-center p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700">Total Output</h3>
                            <p className="text-2xl font-bold text-green-600">{totals.totalOutput}</p>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700">Total Balance</h3>
                            <p className="text-2xl font-bold text-red-600">{totals.totalBalance}</p>
                        </div>
                    </div>
                </form>
                <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white">
                    {outputData && <button type="button" onClick={() => onDelete(outputData.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>}
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="submit" onClick={handleSubmit} className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760]">Save</button>
                </footer>
            </div>
        </div>
    );
};

export default AddEditOutputModal;

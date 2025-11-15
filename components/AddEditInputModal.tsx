
import React, { useState, useEffect } from 'react';
import { InputData, InputDataSize } from '../types';

interface Props {
  inputData: InputData | null;
  onClose: () => void;
  onSave: (data: Omit<InputData, 'id' | 'slNo'>, id?: string) => Promise<void>;
  onDelete: (id: string) => void;
}

const defaultData: Omit<InputData, 'id' | 'slNo'> = {
    date: new Date().toISOString().split('T')[0],
    lineNumber: '', buyer: '', po: '', style: '', pf: '', color: '', sewingFinishDate: '',
    sizes: [{ id: `size-${Date.now()}`, cuttingNo: '', size: '', shade: '', quantity: 0 }],
    totalQuantity: 0,
};

const AddEditInputModal: React.FC<Props> = ({ inputData, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState(defaultData);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (inputData) {
            setFormData({ ...inputData });
        } else {
            setFormData(defaultData);
        }
    }, [inputData]);
    
    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSizeChange = (id: string, field: keyof Omit<InputDataSize, 'id'>, value: string | number) => {
        setFormData(prev => {
            const newSizes = prev.sizes.map(s => s.id === id ? {...s, [field]: value} : s);
            const newTotalQuantity = newSizes.reduce((sum, size) => sum + Number(size.quantity || 0), 0);
            return {
                ...prev,
                sizes: newSizes,
                totalQuantity: newTotalQuantity
            };
        });
    };

    const addSize = () => {
        setFormData(prev => ({
            ...prev,
            sizes: [...prev.sizes, { id: `size-${Date.now()}`, cuttingNo: '', size: '', shade: '', quantity: 0 }]
        }));
    };

    const removeSize = (id: string) => {
        setFormData(prev => {
            const newSizes = prev.sizes.filter(s => s.id !== id);
            const newTotalQuantity = newSizes.reduce((sum, size) => sum + Number(size.quantity || 0), 0);
            return {
                ...prev,
                sizes: newSizes,
                totalQuantity: newTotalQuantity
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData, inputData?.id);
            onClose();
        } catch (error) {
            console.error("Failed to save input data:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg flex-shrink-0">
                    <h2 className="text-xl font-bold">{inputData ? 'View/Edit Input' : 'Add New Input'}</h2>
                    <button onClick={onClose} className="text-3xl leading-none p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Main Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Input Date</label>
                                <input id="date" type="date" name="date" value={formData.date} onChange={handleSimpleChange} className="p-2 border rounded w-full" />
                            </div>
                            <input name="lineNumber" value={formData.lineNumber} onChange={handleSimpleChange} placeholder="Line Number" className="p-2 border rounded" />
                            <input name="buyer" value={formData.buyer} onChange={handleSimpleChange} placeholder="Buyer" className="p-2 border rounded" />
                            <input name="po" value={formData.po} onChange={handleSimpleChange} placeholder="PO" className="p-2 border rounded" />
                            <input name="style" value={formData.style} onChange={handleSimpleChange} placeholder="Style" className="p-2 border rounded" />
                            <input name="pf" value={formData.pf} onChange={handleSimpleChange} placeholder="PF" className="p-2 border rounded" />
                            <input name="color" value={formData.color} onChange={handleSimpleChange} placeholder="Color" className="p-2 border rounded" />
                             <div>
                                <label htmlFor="sewingFinishDate" className="block text-sm font-medium text-gray-700 mb-1">Sewing Finished Date</label>
                                <input id="sewingFinishDate" type="date" name="sewingFinishDate" value={formData.sewingFinishDate} onChange={handleSimpleChange} className="p-2 border rounded w-full" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Cutting, Size, Shade, and Quantity</h3>
                        {formData.sizes.map(s => (
                            <div key={s.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 mb-2 items-center p-2 border rounded-lg">
                                <input value={s.cuttingNo} onChange={e => handleSizeChange(s.id, 'cuttingNo', e.target.value)} placeholder="Cutting No" className="p-2 border rounded" />
                                <input value={s.size} onChange={e => handleSizeChange(s.id, 'size', e.target.value)} placeholder="Size" className="p-2 border rounded" />
                                <input value={s.shade} onChange={e => handleSizeChange(s.id, 'shade', e.target.value)} placeholder="Shade" className="p-2 border rounded" />
                                <input type="number" value={s.quantity} onChange={e => handleSizeChange(s.id, 'quantity', Number(e.target.value))} placeholder="Quantity" className="p-2 border rounded" />
                                <button type="button" onClick={() => removeSize(s.id)} className="bg-red-500 text-white p-2 rounded h-10 flex-shrink-0 flex items-center justify-center">-</button>
                            </div>
                        ))}
                         <div className="flex space-x-2">
                             <button type="button" onClick={addSize} className="bg-blue-500 text-white p-2 rounded w-10 h-10 flex items-center justify-center">+</button>
                         </div>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-2 pb-1">Total Quantity</h3>
                        <p className="text-2xl font-bold">{formData.totalQuantity}</p>
                    </div>

                    
                </form>
                <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white flex-shrink-0">
                    {inputData && <button type="button" onClick={() => onDelete(inputData.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600" disabled={isSaving}>Delete</button>}
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400" disabled={isSaving}>Cancel</button>
                    <button type="submit" form="input-form" className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] disabled:bg-gray-400" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddEditInputModal;

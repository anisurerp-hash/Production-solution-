import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { OTListData, OTEmployee, Employee, InputData, OperationBreakdownData } from '../types';

interface Props {
    otList: OTListData | null;
    allEmployees: Employee[];
    allInputs: InputData[];
    allOperationBreakdowns: OperationBreakdownData[];
    onClose: () => void;
    onSave: (data: Omit<OTListData, 'id' | 'slNo'>, id?: string) => Promise<void>;
    onDelete: (id: string) => void;
}

const defaultData: Omit<OTListData, 'id' | 'slNo'> = {
    date: new Date().toISOString().split('T')[0],
    lineNumber: '', buyer: '', po: '', style: '', pf: '', color: '',
    employees: [{ id: `ot-emp-${Date.now()}`, employeeId: '', name: '', process: '', otTime: '8:00' }],
};

const AddEditOTListModal: React.FC<Props> = ({ otList, allEmployees, allInputs, allOperationBreakdowns, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState(defaultData);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (otList) {
            setFormData({ ...otList });
        } else {
            setFormData(defaultData);
        }
    }, [otList]);

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


    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeeChange = (empId: string, field: keyof OTEmployee, value: string) => {
        setFormData(prev => {
            const newEmployees = prev.employees.map(emp => {
                if (emp.id === empId) {
                    const updatedEmp = { ...emp, [field]: value };
                    if (field === 'employeeId') {
                        const employeeInfo = allEmployees.find(e => e.employeeId === value);
                        updatedEmp.name = employeeInfo?.name || 'Not Found';

                        const relevantBreakdown = allOperationBreakdowns.find(b => 
                            b.buyer === prev.buyer &&
                            b.po === prev.po &&
                            b.pf === prev.pf &&
                            b.color === prev.color &&
                            b.style === prev.style &&
                            b.lineNumber === prev.lineNumber
                        );
                        
                        const processInfo = relevantBreakdown?.persons.find(p => p.employeeId === value);
                        updatedEmp.process = processInfo?.process || 'N/A';
                    }
                    return updatedEmp;
                }
                return emp;
            });
            return { ...prev, employees: newEmployees };
        });
    };

    const addEmployeeRow = () => {
        setFormData(prev => ({
            ...prev,
            employees: [...prev.employees, { id: `ot-emp-${Date.now()}`, employeeId: '', name: '', process: '', otTime: '8:00' }]
        }));
    };

    const removeEmployeeRow = (empId: string) => {
        setFormData(prev => ({
            ...prev,
            employees: prev.employees.filter(emp => emp.id !== empId)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData, otList?.id);
            onClose();
        } catch (error) {
            console.error("Failed to save OT list:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const renderSelect = (name: keyof OTListData, label: string, value: string, options: string[]) => (
        <select
            name={name}
            value={value}
            onChange={handleSimpleChange}
            disabled={!!otList}
            className="p-2 border rounded w-full disabled:bg-gray-200"
        >
            <option value="">Select {label}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg">
                    <h2 className="text-xl font-bold">{otList ? 'View/Edit OT List' : 'Add New OT List'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
                </header>

                <form id="ot-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Main Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm">Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleSimpleChange} className="p-2 border rounded w-full" />
                            </div>
                            {renderSelect('buyer', 'Buyer', formData.buyer, buyerOptions)}
                            {renderSelect('po', 'PO', formData.po, poOptions)}
                            {renderSelect('pf', 'PF', formData.pf, pfOptions)}
                            {renderSelect('color', 'Color', formData.color, colorOptions)}
                            {renderSelect('style', 'Style', formData.style, styleOptions)}
                            {renderSelect('lineNumber', 'Line', formData.lineNumber, lineNumberOptions)}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Employees</h3>
                         <div className="hidden md:grid md:grid-cols-[1fr,2fr,2fr,1fr,auto] gap-2 mb-2 text-sm font-bold text-gray-600 px-1">
                            <span>ID Number</span>
                            <span>Name</span>
                            <span>Process</span>
                            <span>OT Time</span>
                            <span></span>
                        </div>
                        <div className="space-y-2">
                        {formData.employees.map(emp => (
                            <div key={emp.id} className="grid grid-cols-1 md:grid-cols-[1fr,2fr,2fr,1fr,auto] gap-2 items-center p-2 border rounded-lg md:p-0 md:border-0">
                                <div>
                                    <label className="md:hidden text-sm">ID</label>
                                    <input value={emp.employeeId} onChange={e => handleEmployeeChange(emp.id, 'employeeId', e.target.value)} placeholder="ID Number" className="p-2 border rounded w-full" />
                                </div>
                                <div>
                                    <label className="md:hidden text-sm">Name</label>
                                    <input value={emp.name} readOnly placeholder="Name" className="p-2 border rounded w-full bg-gray-100" />
                                </div>
                                <div>
                                    <label className="md:hidden text-sm">Process</label>
                                    <input value={emp.process} readOnly placeholder="Process" className="p-2 border rounded w-full bg-gray-100" />
                                </div>
                                <div>
                                     <label className="md:hidden text-sm">OT Time</label>
                                     <select value={emp.otTime} onChange={e => handleEmployeeChange(emp.id, 'otTime', e.target.value)} className="p-2 border rounded w-full h-[42px]">
                                        <option value="8:00">8:00</option>
                                        <option value="9:30">9:30</option>
                                    </select>
                                </div>
                                <button type="button" onClick={() => removeEmployeeRow(emp.id)} className="bg-red-500 text-white p-2 rounded h-10 w-full md:w-10 flex items-center justify-center">-</button>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addEmployeeRow} className="bg-blue-500 text-white p-2 rounded w-full md:w-auto mt-2">+ Add Employee</button>
                    </div>
                </form>

                <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white">
                    {otList && <button type="button" onClick={() => onDelete(otList.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600" disabled={isSaving}>Delete</button>}
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400" disabled={isSaving}>Cancel</button>
                    <button type="submit" form="ot-form" className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] disabled:bg-gray-400" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddEditOTListModal;

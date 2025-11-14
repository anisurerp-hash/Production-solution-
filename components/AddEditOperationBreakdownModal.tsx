import React, { useState, useEffect, useMemo } from 'react';
import { OperationBreakdownData, Employee, OperationBreakdownPerson } from '../types';

interface Props {
  breakdownData: OperationBreakdownData | null;
  allEmployees: Employee[];
  onClose: () => void;
  onSave: (data: Omit<OperationBreakdownData, 'id' | 'slNo'>, id?: string) => void;
  onDelete: (id: string) => void;
}

const defaultData: Omit<OperationBreakdownData, 'id' | 'slNo'> = {
    outputDate: new Date().toISOString().split('T')[0],
    lineNumber: '', buyer: '', po: '', style: '', pf: '', color: '', manpower: 0, smv: 0,
    persons: [{ id: `person-${Date.now()}`, process: '', part: '', employeeId: '', name: '', manType: '', mcType: '', noOfMc: 0 }],
};

const AddEditOperationBreakdownModal: React.FC<Props> = ({ breakdownData, allEmployees, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState(defaultData);

    useEffect(() => {
        if (breakdownData) {
            setFormData({ ...breakdownData });
        } else {
            setFormData(defaultData);
        }
    }, [breakdownData]);
    
    // Auto-calculate total manpower
    const totalManpower = useMemo(() => {
        return formData.persons.reduce((sum, p) => sum + Number(p.noOfMc || 0), 0);
    }, [formData.persons]);

    useEffect(() => {
        setFormData(prev => ({...prev, manpower: totalManpower}));
    }, [totalManpower]);

    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const finalValue = e.target.type === 'number' && value !== '' ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };
    
    const handlePersonChange = (id: string, field: keyof Omit<OperationBreakdownPerson, 'id'>, value: string | number) => {
        setFormData(prev => {
            const newPersons = prev.persons.map(p => {
                if (p.id === id) {
                    const updatedPerson = { ...p, [field]: value };
                    
                    if (field === 'employeeId') {
                        const employee = allEmployees.find(emp => emp.employeeId === value);
                        updatedPerson.name = employee ? employee.name : 'Not Found';
                        updatedPerson.manType = employee ? employee.designation : '';
                    }
                    return updatedPerson;
                }
                return p;
            });
            return { ...prev, persons: newPersons };
        });
    };

    const addPerson = () => {
        setFormData(prev => ({
            ...prev,
            persons: [...prev.persons, { id: `person-${Date.now()}`, process: '', part: '', employeeId: '', name: '', manType: '', mcType: '', noOfMc: 0 }]
        }));
    };

    const removePerson = (id: string) => {
        setFormData(prev => ({...prev, persons: prev.persons.filter(p => p.id !== id)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData, breakdownData?.id);
    };

    const renderInfoInput = (name: string, placeholder: string, type: string = 'text', value: string | number, extraProps: object = {}) => (
        <div>
            <label className="block text-sm font-medium text-gray-700">{placeholder}</label>
            <input name={name} type={type} value={value} onChange={handleSimpleChange} placeholder={placeholder} className="p-2 border rounded w-full" {...extraProps} />
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
                <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg flex-shrink-0">
                    <h2 className="text-xl font-bold">{breakdownData ? 'View/Edit Person Breakdown' : 'Add New Person Breakdown'}</h2>
                    <button onClick={onClose} className="text-3xl leading-none p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
                </header>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Main Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {renderInfoInput('outputDate', 'Output Date', 'date', formData.outputDate)}
                            {renderInfoInput('lineNumber', 'Line Number', 'text', formData.lineNumber)}
                            {renderInfoInput('buyer', 'Buyer', 'text', formData.buyer)}
                            {renderInfoInput('po', 'PO', 'text', formData.po)}
                            {renderInfoInput('style', 'Style', 'text', formData.style)}
                            {renderInfoInput('pf', 'PF', 'text', formData.pf)}
                            {renderInfoInput('color', 'Color', 'text', formData.color)}
                            {renderInfoInput('smv', 'SMV', 'number', formData.smv, { step: '0.0001' })}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Manpower (Auto)</label>
                                <input name="manpower" type="number" value={formData.manpower} readOnly placeholder="Manpower" className="p-2 border rounded bg-gray-100 w-full" />
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Person Breakdown</h3>
                        
                        {/* Header for large screens */}
                        <div className="hidden md:grid md:grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1fr_auto] gap-2 mb-2 text-sm font-bold text-gray-600 px-1">
                            <span>Process</span>
                            <span>Part</span>
                            <span>ID Number</span>
                            <span>Name</span>
                            <span>Man Type</span>
                            <span>M/C Type</span>
                            <span>No of M/C</span>
                            <span></span>
                        </div>

                        <div className="space-y-4 md:space-y-2">
                            {formData.persons.map(p => (
                                <div key={p.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1.5fr_2fr_2fr_1.5fr_1fr_auto] gap-2 p-2 border rounded-lg md:border-0 md:p-0 items-end">
                                    {/* Process */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">Process</label>
                                        <input value={p.process} onChange={e => handlePersonChange(p.id, 'process', e.target.value)} placeholder="Process" className="p-2 border rounded w-full" />
                                    </div>
                                    {/* Part */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">Part</label>
                                        <select value={p.part} onChange={e => handlePersonChange(p.id, 'part', e.target.value)} className="p-2 border rounded w-full h-[42px]">
                                            <option value="">Select Part</option>
                                            <option value="front part">front part</option>
                                            <option value="back part">back part</option>
                                            <option value="assembly">assembly</option>
                                        </select>
                                    </div>
                                    {/* Employee ID */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">ID Number</label>
                                        <input value={p.employeeId} onChange={e => handlePersonChange(p.id, 'employeeId', e.target.value)} placeholder="ID Number" className="p-2 border rounded w-full" />
                                    </div>
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">Name</label>
                                        <input value={p.name} readOnly placeholder="Name" className="p-2 border rounded w-full bg-gray-100" />
                                    </div>
                                    {/* Man Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">Man Type</label>
                                        <input value={p.manType} readOnly placeholder="Man Type" className="p-2 border rounded w-full bg-gray-100" />
                                    </div>
                                    {/* M/C Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">M/C Type</label>
                                        <input value={p.mcType} onChange={e => handlePersonChange(p.id, 'mcType', e.target.value)} placeholder="M/C Type" className="p-2 border rounded w-full" />
                                    </div>
                                    {/* No of M/C */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 md:hidden">No of M/C</label>
                                        <input type="number" value={p.noOfMc} onChange={e => handlePersonChange(p.id, 'noOfMc', Number(e.target.value))} placeholder="No" className="p-2 border rounded w-full" />
                                    </div>
                                    {/* Remove Button */}
                                    <div className="flex items-end">
                                        <button type="button" onClick={() => removePerson(p.id)} className="bg-red-500 text-white p-2 rounded h-10 w-full md:w-10 flex-shrink-0 flex items-center justify-center">-</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addPerson} className="bg-blue-500 text-white p-2 rounded w-10 h-10 mt-2 flex items-center justify-center">+</button>
                    </div>

                </form>

                <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white flex-shrink-0">
                    {breakdownData && <button type="button" onClick={() => onDelete(breakdownData.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600">Delete</button>}
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                    <button type="button" onClick={handleSubmit} className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760]">Save</button>
                </footer>
            </div>
        </div>
    );
};

export default AddEditOperationBreakdownModal;
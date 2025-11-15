// FIX: Imported 'useMemo' from 'react' to resolve 'Cannot find name' error.
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { HourlyProductionData, HourlyProductionProcess } from '../types';

interface Props {
  productionData: HourlyProductionData | null;
  onClose: () => void;
  onSave: (data: Omit<HourlyProductionData, 'id' | 'slNo'> | Omit<HourlyProductionData, 'id' | 'slNo'>[], id?: string) => Promise<void>;
  onDelete: (id: string) => void;
}

const defaultProcesses: HourlyProductionProcess[] = [
    { id: 'proc-1', process: 'Front part', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-2', process: 'Back part', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-3', process: 'Assembly', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-4', process: 'Last process', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-5', process: 'QC pass', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
    { id: 'proc-6', process: 'PAD', target: 0, h1: 0, v1: 0, h2: 0, v2: 0, h3: 0, v3: 0, h4: 0, v4: 0, h5: 0, v5: 0, h6: 0, v6: 0, h7: 0, v7: 0, h8: 0, v8: 0, h9: 0, v9: 0, h10: 0, v10: 0, total: 0, variance: 0 },
];

const defaultData: Omit<HourlyProductionData, 'id' | 'slNo' | 'totalOutput' | 'totalManpower' | 'efficiency'> = {
    date: new Date().toISOString().split('T')[0],
    lineNumber: '', buyer: '', po: '', style: '', pf: '', color: '', smv: 0, target: 0,
    manpowers: [{ id: `mp-${Date.now()}`, manpower: 0, workingHours: 0 }],
    production: JSON.parse(JSON.stringify(defaultProcesses)),
};

type FormSectionData = typeof defaultData;

const SectionForm: React.FC<{ 
    sectionData: FormSectionData; 
    sectionIndex: number;
    onUpdate: (index: number, data: FormSectionData) => void;
    onRemove: () => void;
    canRemove: boolean;
}> = ({ sectionData, sectionIndex, onUpdate, onRemove, canRemove }) => {

    const recalculateTargetsAndVariance = useCallback((data: FormSectionData): HourlyProductionProcess[] => {
        const mainTarget = data.target || 0;
        const workingHours = data.manpowers.reduce((max, mp) => Math.max(max, mp.workingHours), 0);
        const hourlyTarget = workingHours > 0 ? mainTarget / workingHours : 0;

        return data.production.map(p => {
            let newProcessTarget = 0;
            if (['Front part', 'Back part', 'Assembly', 'Last process'].includes(p.process)) {
                newProcessTarget = Math.round(hourlyTarget * 1.10);
            } else {
                newProcessTarget = Math.round(hourlyTarget);
            }

            const newP = { ...p, target: newProcessTarget };

            let totalOutput = 0;
            for (let i = 1; i <= 10; i++) {
                const h = (newP as any)[`h${i}`] || 0;
                totalOutput += h;
                (newP as any)[`v${i}`] = h - newProcessTarget;
            }
            newP.total = totalOutput;
            const totalTarget = newProcessTarget * workingHours;
            newP.variance = totalOutput - totalTarget;

            return newP;
        });
    }, []);

    const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        let newSectionData = { ...sectionData, [name]: type === 'number' ? Number(value) : value };
        
        if (name === 'target') {
            newSectionData.production = recalculateTargetsAndVariance(newSectionData);
        }
        onUpdate(sectionIndex, newSectionData);
    };

    const handleManpowerChange = (mpId: string, field: 'manpower' | 'workingHours', value: number) => {
        const newManpowers = sectionData.manpowers.map(mp => mp.id === mpId ? { ...mp, [field]: value } : mp);
        const newSectionData = { ...sectionData, manpowers: newManpowers };
        newSectionData.production = recalculateTargetsAndVariance(newSectionData);
        onUpdate(sectionIndex, newSectionData);
    };

    const addManpower = () => {
        const newManpowers = [...sectionData.manpowers, { id: `mp-${Date.now()}`, manpower: 0, workingHours: 0 }];
        onUpdate(sectionIndex, { ...sectionData, manpowers: newManpowers });
    };

    const removeManpower = (mpId: string) => {
        if (sectionData.manpowers.length <= 1) return; // Prevent removing the last one
        const newManpowers = sectionData.manpowers.filter(mp => mp.id !== mpId);
        const newSectionData = { ...sectionData, manpowers: newManpowers };
        newSectionData.production = recalculateTargetsAndVariance(newSectionData);
        onUpdate(sectionIndex, newSectionData);
    };

    const handleProductionChange = (processId: string, hour: string, value: number) => {
        const newProduction = sectionData.production.map(p => {
            if (p.id === processId) {
                const updatedProcess = { ...p, [hour]: value };
                
                const hourIndex = parseInt(hour.substring(1));
                (updatedProcess as any)[`v${hourIndex}`] = value - updatedProcess.target;

                const total = Object.keys(updatedProcess)
                    .filter(k => k.startsWith('h'))
                    .reduce((sum, hKey) => sum + (Number((updatedProcess as any)[hKey]) || 0), 0);
                
                const workingHours = sectionData.manpowers.reduce((max, mp) => Math.max(max, mp.workingHours), 0);
                const totalTarget = updatedProcess.target * workingHours;
                const variance = total - totalTarget;

                return { ...updatedProcess, total, variance };
            }
            return p;
        });
        onUpdate(sectionIndex, { ...sectionData, production: newProduction });
    };

    const calculatedValues = useMemo(() => {
        const totalOutput = sectionData.production.find(p => p.process === 'PAD')?.total || 0;
        const totalMinutes = sectionData.manpowers.reduce((sum, m) => sum + (Number(m.manpower || 0) * Number(m.workingHours || 0) * 60), 0);
        const efficiency = (totalMinutes > 0 && sectionData.smv > 0)
            ? (totalOutput * sectionData.smv) / totalMinutes * 100
            : 0;
        return { efficiency };
    }, [sectionData]);

    return (
        <div className="border border-gray-300 rounded-lg p-4 mb-6 relative bg-gray-50">
            {canRemove && (
                <button type="button" onClick={onRemove} className="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center z-10 font-bold text-lg">&times;</button>
            )}
             <div>
                <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <input type="date" name="date" value={sectionData.date} onChange={handleSimpleChange} className="p-2 border rounded" />
                    <input name="lineNumber" value={sectionData.lineNumber} onChange={handleSimpleChange} placeholder="Line Number" className="p-2 border rounded" />
                    <input name="buyer" value={sectionData.buyer} onChange={handleSimpleChange} placeholder="Buyer" className="p-2 border rounded" />
                    <input name="style" value={sectionData.style} onChange={handleSimpleChange} placeholder="Style" className="p-2 border rounded" />
                    <input name="po" value={sectionData.po} onChange={handleSimpleChange} placeholder="PO" className="p-2 border rounded" />
                    <input name="pf" value={sectionData.pf} onChange={handleSimpleChange} placeholder="PF" className="p-2 border rounded" />
                    <input name="color" value={sectionData.color} onChange={handleSimpleChange} placeholder="Color" className="p-2 border rounded" />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SMV</label>
                        <input type="number" name="smv" value={sectionData.smv} onChange={handleSimpleChange} placeholder="SMV" className="p-2 border rounded w-full" step="0.0001" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target (Day)</label>
                        <input type="number" name="target" value={sectionData.target} onChange={handleSimpleChange} placeholder="Target" className="p-2 border rounded w-full" />
                    </div>
                </div>
                <div className="space-y-2">
                     {sectionData.manpowers.map(mp => (
                        <div key={mp.id} className="flex items-center gap-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manpower</label>
                                <input type="number" value={mp.manpower} onChange={e => handleManpowerChange(mp.id, 'manpower', Number(e.target.value))} placeholder="Manpower" className="p-2 border rounded w-full"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                                <input type="number" value={mp.workingHours} onChange={e => handleManpowerChange(mp.id, 'workingHours', Number(e.target.value))} placeholder="Working Hours" className="p-2 border rounded w-full"/>
                            </div>
                            <div className="self-end">
                                <button type="button" onClick={() => removeManpower(mp.id)} className="bg-red-500 text-white p-2 rounded h-10 w-12 flex items-center justify-center flex-shrink-0">-</button>
                            </div>
                        </div>
                     ))}
                     <div className="flex">
                         <button type="button" onClick={addManpower} className="bg-blue-500 text-white p-2 rounded h-10 w-12 flex items-center justify-center">+</button>
                     </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 mb-4 pb-1">Hourly Production</h3>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[2000px] text-center border-collapse">
                        <thead className="bg-gray-200 text-sm">
                            <tr>
                                <th className="p-2 border sticky left-0 bg-gray-200 min-w-[100px]">Process</th>
                                <th className="p-2 border">Target (Hr)</th>
                                {[...Array(10)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th className="p-2 border">{i + 1} H</th>
                                        <th className="p-2 border bg-gray-100">Var</th>
                                    </React.Fragment>
                                ))}
                                <th className="p-2 border">Total</th>
                                <th className="p-2 border">Variance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sectionData.production.map(p => (
                                <tr key={p.id}>
                                    <td className="p-1 border font-semibold sticky left-0 bg-white">{p.process}</td>
                                    <td className="p-1 border"><input type="number" value={p.target} readOnly className="w-full p-1 text-center bg-gray-100 border-0"/></td>
                                    {[...Array(10)].map((_, i) => (
                                        <React.Fragment key={i}>
                                            <td className="p-1 border"><input type="number" value={(p as any)[`h${i+1}`]} onChange={e => handleProductionChange(p.id, `h${i+1}`, Number(e.target.value))} className="w-full p-1 text-center"/></td>
                                            <td className="p-1 border bg-gray-50"><input type="number" value={(p as any)[`v${i+1}`]} readOnly className="w-full p-1 text-center bg-gray-100 border-0"/></td>
                                        </React.Fragment>
                                    ))}
                                    <td className="p-1 border"><input type="number" value={p.total} readOnly className="w-full p-1 text-center bg-gray-100 border-0"/></td>
                                    <td className="p-1 border"><input type="number" value={p.variance} readOnly className="w-full p-1 text-center bg-gray-100 border-0"/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="text-center p-4 bg-gray-200 rounded-lg mt-4">
                <h4 className="text-lg font-semibold text-[#1B2445]">Calculated Efficiency</h4>
                <p className="text-3xl font-bold text-blue-600">{calculatedValues.efficiency.toFixed(2)}%</p>
            </div>
        </div>
    );
};


const AddEditHourlyProductionModal: React.FC<Props> = ({ productionData, onClose, onSave, onDelete }) => {
    const [sections, setSections] = useState<FormSectionData[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (productionData) {
            setSections([{ ...productionData }]);
        } else {
            setSections([JSON.parse(JSON.stringify(defaultData))]);
        }
    }, [productionData]);
    
    const calculateAllValues = useCallback((section: FormSectionData) => {
        const totalOutput = section.production.find(p => p.process === 'PAD')?.total || 0;
        const totalManpower = section.manpowers.reduce((sum, m) => sum + Number(m.manpower || 0), 0);
        const efficiency = 0;
        return { totalOutput, totalManpower, efficiency };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const sectionsToSave = sections.map(section => {
                 const { totalOutput, totalManpower } = calculateAllValues(section);
                 const totalMinutes = section.manpowers.reduce((sum, m) => sum + (Number(m.manpower || 0) * Number(m.workingHours || 0) * 60), 0);
                 const efficiency = (totalMinutes > 0 && section.smv > 0)
                    ? (totalOutput * section.smv) / totalMinutes * 100
                    : 0;
                 return { ...section, totalOutput, totalManpower, efficiency };
            });

            if (productionData) { // Edit mode
                await onSave(sectionsToSave[0], productionData.id);
            } else { // Add mode
                await onSave(sectionsToSave);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save production data:", error);
            alert("An error occurred while saving. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const addSection = () => {
        setSections(prev => [...prev, JSON.parse(JSON.stringify(defaultData))]);
    };

    const removeSection = (index: number) => {
        setSections(prev => prev.filter((_, i) => i !== index));
    };

    const updateSection = (index: number, data: FormSectionData) => {
        setSections(prev => prev.map((s, i) => i === index ? data : s));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[95vh]">
                <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg flex-shrink-0">
                    <h2 className="text-xl font-bold">{productionData ? 'View/Edit Hourly Production' : 'Add Hourly Production'}</h2>
                    <button onClick={onClose} className="text-3xl leading-none p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
                </header>

                <form id="production-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-grow bg-white">
                    {sections.map((section, index) => (
                        <SectionForm 
                            key={index}
                            sectionData={section}
                            sectionIndex={index}
                            onUpdate={updateSection}
                            onRemove={() => removeSection(index)}
                            canRemove={!productionData && sections.length > 1}
                        />
                    ))}
                    {!productionData && (
                        <button type="button" onClick={addSection} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                            ➕ Add Hourly Production Section
                        </button>
                    )}
                </form>

                <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white flex-shrink-0">
                    {productionData && <button type="button" onClick={() => onDelete(productionData.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600" disabled={isSaving}>Delete</button>}
                    <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400" disabled={isSaving}>Cancel</button>
                    <button type="submit" form="production-form" className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] disabled:bg-gray-400" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default AddEditHourlyProductionModal;
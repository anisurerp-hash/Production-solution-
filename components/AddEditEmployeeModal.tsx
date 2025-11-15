

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Employee, EmployeeSkill, Address } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

interface Props {
  employee: Employee | null;
  allEmployees: Employee[];
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id' | 'slNo'>, id?: string) => Promise<void>;
  onDelete: (id: string) => void;
}

const defaultEmployeeData: Omit<Employee, 'id' | 'slNo'> = {
  employeeId: '', name: '', designation: '', lineNumber: '', joinDate: '', phone: '',
  skills: [{ id: `skill-${Date.now()}`, item: '', process: '' }],
  fatherName: '', motherName: '', maritalStatus: 'Unmarried', gender: 'Male', bloodGroup: 'A+',
  dateOfBirth: '',
  permanentAddress: { division: '', district: '', upazila: '', thana: '', postOffice: '', village: '' },
  presentAddress: { division: '', district: '', upazila: '', thana: '', postOffice: '', village: '' },
};

const CameraCapture: React.FC<{ onCapture: (blob: Blob) => void; onClose: () => void; }> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let stream: MediaStream | null = null;
        let active = true;

        const startCamera = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                if (active) {
                    stream = mediaStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } else {
                    // if component unmounted while waiting for permission, stop the tracks
                    mediaStream.getTracks().forEach(track => track.stop());
                }
            } catch (err) {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please check permissions.");
                onClose();
            }
        };

        startCamera();

        return () => {
            active = false;
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [onClose]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            canvas.toBlob(blob => {
                if (blob) {
                    onCapture(blob);
                }
            }, 'image/jpeg');
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[120] flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-lg rounded-lg mb-4"></video>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
            <div className="flex gap-4">
                <button type="button" onClick={handleCapture} className="bg-green-500 text-white px-6 py-2 rounded-lg">Capture</button>
                <button type="button" onClick={onClose} className="bg-red-500 text-white px-6 py-2 rounded-lg">Cancel</button>
            </div>
        </div>
    );
};


const FileInput: React.FC<{label: string, file: File | null, setFile: (f: File | null) => void, onCapture: () => void, disabled?: boolean}> = ({ label, file, setFile, onCapture, disabled = false }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if(file) {
             const reader = new FileReader();
             reader.onloadend = () => setPreview(reader.result as string);
             reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <div className="flex items-center gap-4">
                {preview && <img src={preview} alt="Preview" className="w-16 h-16 rounded-md object-cover"/>}
                <div className="flex-grow space-y-2">
                    <button type="button" onClick={onCapture} className="w-full text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:bg-gray-400" disabled={disabled}>Capture</button>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2a3760] file:text-white hover:file:bg-[#1B2445] disabled:opacity-50" disabled={disabled}/>
                </div>
            </div>
        </div>
    );
}

const AddressInputs: React.FC<{ data: Address, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, disabled: boolean }> = ({ data, onChange, disabled }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input name="division" value={data.division} onChange={onChange} placeholder="Division" className="w-full p-2 border rounded" disabled={disabled} />
        <input name="district" value={data.district} onChange={onChange} placeholder="District" className="w-full p-2 border rounded" disabled={disabled} />
        <input name="upazila" value={data.upazila} onChange={onChange} placeholder="Upazila" className="w-full p-2 border rounded" disabled={disabled} />
        <input name="thana" value={data.thana} onChange={onChange} placeholder="Thana" className="w-full p-2 border rounded" disabled={disabled} />
        <input name="postOffice" value={data.postOffice} onChange={onChange} placeholder="Post Office" className="w-full p-2 border rounded" disabled={disabled} />
        <input name="village" value={data.village} onChange={onChange} placeholder="Village/Road" className="w-full p-2 border rounded" disabled={disabled} />
    </div>
);

const AddEditEmployeeModal: React.FC<Props> = ({ employee, allEmployees, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'slNo'>>(defaultEmployeeData);
  const [isEditMode, setIsEditMode] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [officeIdFile, setOfficeIdFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<'photo'| 'officeId' | 'nidFront' | 'nidBack' | null>(null);
  const mounted = useRef(false);
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
      setIsEditMode(false);
    } else {
      setFormData(defaultEmployeeData);
      setIsEditMode(true);
    }
    setPhotoFile(null);
    setNidFile(null);
    setNidBackFile(null);
    setOfficeIdFile(null);
  }, [employee]);
  
  const openCamera = (target: 'photo' | 'officeId' | 'nidFront' | 'nidBack') => {
    setCaptureTarget(target);
    setIsCameraOpen(true);
  };
  
  const handleCameraClose = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const runOfficeIdOcr = async (imageFile: File) => {
      setIsSaving(true);
      alert("AI is extracting data from the Office ID card. This may take a moment.");
      try {
          const imagePart = await fileToGenerativePart(imageFile);
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, { text: "Extract the employee's information from this office ID card." }] },
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          employeeId: { type: Type.STRING, description: "Employee's ID number" },
                          name: { type: Type.STRING, description: "Employee's full name" },
                          designation: { type: Type.STRING, description: "Employee's job title or designation" },
                          lineNumber: { type: Type.STRING, description: "Employee's line number" },
                          joinDate: { type: Type.STRING, description: "Joining date in YYYY-MM-DD format" },
                          phone: { type: Type.STRING, description: "Employee's phone number" },
                      },
                  },
              },
          });

          const parsedData = JSON.parse(response.text);
          setFormData(prev => ({
              ...prev,
              ...parsedData,
          }));
          alert("Information extracted successfully!");
      } catch (error) {
          console.error("Error during Office ID OCR:", error);
          alert("AI failed to extract data from the Office ID card. Please enter manually.");
      } finally {
          setIsSaving(false);
      }
  };

  const runNidOcr = async (imageFile: File) => {
      setIsSaving(true);
      alert("AI is extracting data from the NID card. This may take a moment.");
      try {
          const imagePart = await fileToGenerativePart(imageFile);
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, { text: "Extract the person's name, date of birth (in YYYY-MM-DD format), father's name, and mother's name from the front of this National ID card of Bangladesh." }] },
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          name: { type: Type.STRING },
                          dateOfBirth: { type: Type.STRING },
                          fatherName: { type: Type.STRING },
                          motherName: { type: Type.STRING },
                      },
                  },
              },
          });
          
          const parsedData = JSON.parse(response.text);
          setFormData(prev => ({
              ...prev,
              name: parsedData.name || prev.name,
              dateOfBirth: parsedData.dateOfBirth || prev.dateOfBirth,
              fatherName: parsedData.fatherName || prev.fatherName,
              motherName: parsedData.motherName || prev.motherName,
          }));
          alert("Information extracted successfully!");

      } catch (error) {
          console.error("Error during NID OCR:", error);
          alert("AI failed to extract data from the NID card. Please enter manually.");
      } finally {
          setIsSaving(false);
      }
  };

  const runNidBackOcr = async (imageFile: File) => {
      setIsSaving(true);
      alert("AI is extracting address from the NID card. This may take a moment.");
      try {
          const imagePart = await fileToGenerativePart(imageFile);
          const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { parts: [imagePart, { text: "Extract the permanent address from the back of this National ID card of Bangladesh." }] },
              config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                      type: Type.OBJECT,
                      properties: {
                          permanentAddress: {
                              type: Type.OBJECT,
                              properties: {
                                  village: { type: Type.STRING },
                                  postOffice: { type: Type.STRING },
                                  thana: { type: Type.STRING },
                                  upazila: { type: Type.STRING },
                                  district: { type: Type.STRING },
                                  division: { type: Type.STRING },
                              },
                          },
                      },
                  },
              },
          });
          
          const parsedData = JSON.parse(response.text);
          if (parsedData.permanentAddress) {
            setFormData(prev => ({
                ...prev,
                permanentAddress: {
                    ...prev.permanentAddress,
                    ...parsedData.permanentAddress,
                }
            }));
            alert("Address extracted successfully!");
          } else {
            alert("Could not extract a valid address. Please enter manually.");
          }

      } catch (error) {
          console.error("Error during NID Back OCR:", error);
          alert("AI failed to extract address from the NID card. Please enter manually.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleCapture = async (blob: Blob) => {
    setIsCameraOpen(false);
    if (!captureTarget) return;

    const file = new File([blob], `${captureTarget}.jpg`, { type: 'image/jpeg' });

    switch (captureTarget) {
      case 'photo':
        setPhotoFile(file);
        break;
      case 'officeId':
        setOfficeIdFile(file);
        await runOfficeIdOcr(file);
        break;
      case 'nidFront':
        setNidFile(file);
        await runNidOcr(file);
        break;
      case 'nidBack':
        setNidBackFile(file);
        await runNidBackOcr(file);
        break;
    }
    setCaptureTarget(null);
  };

  const handleSimpleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);
  
  const handlePermanentAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, permanentAddress: { ...prev.permanentAddress, [name]: value } }));
  }, []);

  const handlePresentAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, presentAddress: { ...prev.presentAddress, [name]: value } }));
  }, []);

  const handleAddSkill = useCallback(() => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, { id: `skill-${Date.now()}`, item: '', process: '' }] }));
  }, []);

  const handleRemoveSkill = useCallback((id: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== id) }));
  }, []);

  const handleSkillChange = useCallback((id: string, field: keyof Omit<EmployeeSkill, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.map(skill => skill.id === id ? { ...skill, [field]: value } : skill) }));
  }, []);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!employee?.id) { // Only check for new employees
      const isDuplicate = allEmployees.some(emp => emp.employeeId.trim().toLowerCase() === formData.employeeId.trim().toLowerCase());
      if (isDuplicate) {
        alert('An employee with this ID number already exists. Please use a unique ID.');
        return;
      }
    }

    setIsSaving(true);
    try {
        await onSave(formData, employee?.id);
        onClose();
    } catch(error) {
        console.error("Error saving employee:", error);
        alert("Failed to save employee data. Please check your network connection and try again. See console for details.");
    } finally {
        if (mounted.current) {
            setIsSaving(false);
        }
    }
  }, [formData, employee, onSave, onClose, allEmployees]);
  
  const handleExportPdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const emp = formData; 

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Information', 105, 20, { align: 'center' });

    const drawSection = (title: string, data: (string|number|null|undefined)[][], startY: number) => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 14, startY);
      doc.setLineWidth(0.5);
      doc.line(14, startY + 2, 196, startY + 2);
      
      let y = startY + 10;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      data.forEach(([label, value]) => {
          doc.setFont('helvetica', 'bold');
          doc.text(String(label), 16, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(value || 'N/A'), 60, y);
          y += 7;
      });
      return y;
    };
    
    let currentY = 30;

    const basicInfo = [
        ['Employee ID', emp.employeeId], ['Name', emp.name], ['Designation', emp.designation],
        ['Line Number', emp.lineNumber], ['Join Date', emp.joinDate], ['Phone Number', emp.phone],
    ];
    currentY = drawSection('Basic Information', basicInfo, currentY);

    const personalInfo = [
        ["Father's Name", emp.fatherName], ["Mother's Name", emp.motherName], ['Date of Birth', emp.dateOfBirth],
        ['Gender', emp.gender], ['Marital Status', emp.maritalStatus], ['Blood Group', emp.bloodGroup],
    ];
    currentY = drawSection('Personal Information', personalInfo, currentY + 5);

    const permanentAddress = [
        ['Division', emp.permanentAddress.division], ['District', emp.permanentAddress.district],
        ['Upazila/Thana', `${emp.permanentAddress.upazila} / ${emp.permanentAddress.thana}`],
        ['Post Office', emp.permanentAddress.postOffice], ['Village/Road', emp.permanentAddress.village],
    ];
    currentY = drawSection('Permanent Address', permanentAddress, currentY + 5);
    
    const presentAddress = [
        ['Division', emp.presentAddress.division], ['District', emp.presentAddress.district],
        ['Upazila/Thana', `${emp.presentAddress.upazila} / ${emp.presentAddress.thana}`],
        ['Post Office', emp.presentAddress.postOffice], ['Village/Road', emp.presentAddress.village],
    ];
    drawSection('Present Address', presentAddress, currentY + 5);
    
    if (emp.skills.length > 0 && emp.skills.some(s => s.item || s.process)) {
        doc.addPage();
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Employee Skills', 14, 20);
        (doc as any).autoTable({
            startY: 25,
            head: [['Item', 'Process']],
            body: emp.skills.map(s => [s.item, s.process]),
            theme: 'grid',
        });
    }

    doc.save(`employee_${emp.employeeId}.pdf`);
  };

  const renderSectionHeader = (title: string) => (
    <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 border-[#2a3760] pb-1 mb-4">{title}</h3>
  );

  return (
    <>
      {isCameraOpen && <CameraCapture onCapture={handleCapture} onClose={handleCameraClose} />}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
          <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg flex-shrink-0">
            <h2 className="text-xl font-bold">{employee ? 'View/Edit Employee' : 'Add New Employee'}</h2>
            <button onClick={onClose} className="text-3xl leading-none p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
          </header>

          <form id="employee-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
            
            {isEditMode && (
                <div>
                    {renderSectionHeader('Photo Upload')}
                    <FileInput label="Employee Photo" file={photoFile} setFile={setPhotoFile} onCapture={() => openCamera('photo')} disabled={!isEditMode}/>
                </div>
            )}


            <div>
              {renderSectionHeader('Basic Information')}
              {isEditMode && (
                <FileInput label="Office ID Card" file={officeIdFile} setFile={setOfficeIdFile} onCapture={() => openCamera('officeId')} disabled={!isEditMode}/>
              )}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isEditMode ? 'mt-4' : ''}`}>
                <input name="employeeId" value={formData.employeeId} onChange={handleSimpleChange} placeholder="ID Number *" required className="w-full p-2 border rounded" disabled={!isEditMode} />
                <input name="name" value={formData.name} onChange={handleSimpleChange} placeholder="Name *" required className="w-full p-2 border rounded" disabled={!isEditMode} />
                <input name="designation" value={formData.designation} onChange={handleSimpleChange} placeholder="Designation *" required className="w-full p-2 border rounded" disabled={!isEditMode} />
                <input name="lineNumber" value={formData.lineNumber} onChange={handleSimpleChange} placeholder="Line Number" className="w-full p-2 border rounded" disabled={!isEditMode} />
                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input id="joinDate" type="date" name="joinDate" value={formData.joinDate} onChange={handleSimpleChange} className="w-full p-2 border rounded" disabled={!isEditMode} />
                </div>
                <input name="phone" value={formData.phone} onChange={handleSimpleChange} placeholder="Phone Number" className="w-full p-2 border rounded" disabled={!isEditMode} />
              </div>
            </div>
            
            <div>
              {renderSectionHeader('Skills')}
              {formData.skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 mb-2">
                  <input value={skill.item} onChange={e => handleSkillChange(skill.id, 'item', e.target.value)} placeholder="Item" className="w-full p-2 border rounded" disabled={!isEditMode}/>
                  <input value={skill.process} onChange={e => handleSkillChange(skill.id, 'process', e.target.value)} placeholder="Process" className="w-full p-2 border rounded" disabled={!isEditMode}/>
                  <button type="button" onClick={() => handleRemoveSkill(skill.id)} className="bg-[#e74c3c] text-white p-2 rounded w-10 h-10 flex-shrink-0" disabled={!isEditMode}>-</button>
                </div>
              ))}
              <button type="button" onClick={handleAddSkill} className="bg-[#1B2445] text-white p-2 rounded w-10 h-10" disabled={!isEditMode}>+</button>
            </div>

            <div>
              {renderSectionHeader('Personal Information')}
              {isEditMode && (
                <div className="space-y-4 mb-4">
                    <FileInput label="NID/Birth Certificate (Front)" file={nidFile} setFile={setNidFile} onCapture={() => openCamera('nidFront')} disabled={!isEditMode}/>
                    <FileInput label="NID/Birth Certificate (Back)" file={nidBackFile} setFile={setNidBackFile} onCapture={() => openCamera('nidBack')} disabled={!isEditMode}/>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fatherName" value={formData.fatherName} onChange={handleSimpleChange} placeholder="Father's Name" className="w-full p-2 border rounded" disabled={!isEditMode}/>
                <input name="motherName" value={formData.motherName} onChange={handleSimpleChange} placeholder="Mother's Name" className="w-full p-2 border rounded" disabled={!isEditMode}/>
                <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input id="dateOfBirth" type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleSimpleChange} className="w-full p-2 border rounded" disabled={!isEditMode} />
                </div>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleSimpleChange} className="w-full p-2 border rounded" disabled={!isEditMode}>
                  <option>Unmarried</option> <option>Married</option>
                </select>
                <select name="gender" value={formData.gender} onChange={handleSimpleChange} className="w-full p-2 border rounded" disabled={!isEditMode}>
                  <option>Male</option> <option>Female</option> <option>Other</option>
                </select>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleSimpleChange} className="w-full p-2 border rounded" disabled={!isEditMode}>
                  <option>A+</option><option>A-</option> <option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option> <option>O+</option><option>O-</option>
                </select>
              </div>
            </div>

            <div>
              {renderSectionHeader('Address Information')}
              <h4 className="font-semibold text-gray-700 mb-2">Permanent Address (from NID)</h4>
              <AddressInputs data={formData.permanentAddress} onChange={handlePermanentAddressChange} disabled={!isEditMode} />
              
              <h4 className="font-semibold text-gray-700 mt-4 mb-2">Present Address (Type manually)</h4>
              <AddressInputs data={formData.presentAddress} onChange={handlePresentAddressChange} disabled={!isEditMode} />
            </div>

          </form>
          <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white flex-shrink-0">
                {isEditMode ? (
                    <>
                        {employee && <button type="button" onClick={() => onDelete(employee.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400" disabled={isSaving}>Delete</button>}
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-400" disabled={isSaving}>Cancel</button>
                        <button type="submit" form="employee-form" className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] disabled:bg-gray-400" disabled={isSaving}>{isSaving ? 'Processing...' : 'Save'}</button>
                    </>
                ) : (
                     <>
                        <button type="button" onClick={handleExportPdf} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Export PDF</button>
                        <button type="button" onClick={() => setIsEditMode(true)} className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">Edit</button>
                        <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Close</button>
                    </>
                )}
          </footer>
        </div>
      </div>
    </>
  );
};

export default AddEditEmployeeModal;
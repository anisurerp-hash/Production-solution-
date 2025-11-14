import React, { useState, useEffect, useRef } from 'react';
import { Employee, EmployeeSkill, Address } from '../types';
import { uploadEmployeeFile } from '../services/firebaseService';

interface Props {
  employee: Employee | null;
  onClose: () => void;
  onSave: (employeeData: Omit<Employee, 'id' | 'slNo'>, id?: string) => void;
  onDelete: (id: string) => void;
}

const defaultEmployeeData: Omit<Employee, 'id' | 'slNo'> = {
  employeeId: '', name: '', designation: '', lineNumber: '', joinDate: '', phone: '',
  skills: [{ id: `skill-${Date.now()}`, item: '', process: '' }],
  fatherName: '', motherName: '', maritalStatus: 'Unmarried', gender: 'Male', bloodGroup: 'A+',
  permanentAddress: { division: '', district: '', upazila: '', thana: '', postOffice: '', village: '' },
  presentAddress: { division: '', district: '', upazila: '', thana: '', postOffice: '', village: '' },
  photoUrl: '', nidUrl: '', nidBackUrl: '', officeIdCardUrl: '',
};

const CameraCapture: React.FC<{ onCapture: (blob: Blob) => void; onClose: () => void; }> = ({ onCapture, onClose }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        let active = true;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(mediaStream => {
                if (active && videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    setStream(mediaStream);
                }
            })
            .catch(err => {
                console.error("Error accessing camera:", err);
                alert("Could not access camera. Please check permissions.");
                onClose();
            });

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


const FileInput: React.FC<{label: string, file: File | null, setFile: (f: File | null) => void, onCapture: () => void, currentUrl?: string}> = ({ label, file, setFile, onCapture, currentUrl }) => {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if(file) {
             const reader = new FileReader();
             reader.onloadend = () => setPreview(reader.result as string);
             reader.readAsDataURL(file);
        } else if (currentUrl) {
            setPreview(currentUrl);
        } else {
            setPreview(null);
        }
    }, [file, currentUrl]);

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
                    <button type="button" onClick={onCapture} className="w-full text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Capture</button>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#2a3760] file:text-white hover:file:bg-[#1B2445]"/>
                </div>
            </div>
        </div>
    );
}

const AddEditEmployeeModal: React.FC<Props> = ({ employee, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Omit<Employee, 'id' | 'slNo'>>(defaultEmployeeData);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [nidBackFile, setNidBackFile] = useState<File | null>(null);
  const [officeIdFile, setOfficeIdFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [captureTarget, setCaptureTarget] = useState<'photo'| 'officeId' | 'nidFront' | 'nidBack' | null>(null);
  
  useEffect(() => {
    if (employee) {
      setFormData({ ...employee });
    } else {
      setFormData(defaultEmployeeData);
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

  const simulateOfficeIdOcr = () => {
    alert("AI Simulation: Capturing data from Office ID card...");
    setFormData(prev => ({
      ...prev,
      employeeId: 'OCR' + Math.floor(1000 + Math.random() * 9000),
      name: 'Simulated Name',
      designation: 'OCR Operator',
      lineNumber: String(Math.floor(1 + Math.random() * 10)),
      joinDate: new Date().toISOString().split('T')[0],
      phone: '01' + Math.floor(100000000 + Math.random() * 900000000),
    }));
  };

  const simulateNidOcr = () => {
    alert("AI Simulation: Capturing data from NID card...");
    setFormData(prev => ({
      ...prev,
      fatherName: 'Simulated Father Name',
      motherName: 'Simulated Mother Name',
      permanentAddress: {
        division: 'Dhaka', district: 'Dhaka', upazila: 'Savar',
        thana: 'Savar', postOffice: '1340', village: 'OCR Village, Sim Road',
      }
    }));
  };

  const handleCapture = (blob: Blob) => {
    setIsCameraOpen(false);
    if (!captureTarget) return;

    const file = new File([blob], `${captureTarget}.jpg`, { type: 'image/jpeg' });

    switch (captureTarget) {
      case 'photo':
        setPhotoFile(file);
        break;
      case 'officeId':
        setOfficeIdFile(file);
        simulateOfficeIdOcr();
        break;
      case 'nidFront':
        setNidFile(file);
        simulateNidOcr();
        break;
      case 'nidBack':
        setNidBackFile(file);
        break;
    }
    setCaptureTarget(null);
  };

  const handleSimpleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddressChange = (addressType: 'permanentAddress' | 'presentAddress', e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [addressType]: { ...prev[addressType], [name]: value } }));
  };

  const handleAddSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, { id: `skill-${Date.now()}`, item: '', process: '' }] }));
  };

  const handleRemoveSkill = (id: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(skill => skill.id !== id) }));
  };

  const handleSkillChange = (id: string, field: keyof Omit<EmployeeSkill, 'id'>, value: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.map(skill => skill.id === id ? { ...skill, [field]: value } : skill) }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaving(true);
    try {
        const dataToSave = { ...formData };
        const employeeIdentifier = employee?.id || formData.employeeId || `new_${Date.now()}`;

        if(photoFile) dataToSave.photoUrl = await uploadEmployeeFile(photoFile, employeeIdentifier, 'photo');
        if(officeIdFile) dataToSave.officeIdCardUrl = await uploadEmployeeFile(officeIdFile, employeeIdentifier, 'officeId');
        if(nidFile) dataToSave.nidUrl = await uploadEmployeeFile(nidFile, employeeIdentifier, 'nid');
        if(nidBackFile) dataToSave.nidBackUrl = await uploadEmployeeFile(nidBackFile, employeeIdentifier, 'nidBack');

        onSave(dataToSave, employee?.id);
    } catch(error) {
        console.error("Error saving employee:", error);
        alert("Failed to save employee data. Check console for details.");
    } finally {
        setIsSaving(false);
    }
  };

  const triggerSubmit = () => {
      // Create a dummy event to pass to handleSubmit
      const dummyEvent = { preventDefault: () => {}, stopPropagation: () => {} } as React.FormEvent;
      handleSubmit(dummyEvent);
  }

  const renderSectionHeader = (title: string) => (
    <h3 className="text-lg font-semibold text-[#1B2445] border-b-2 border-[#2a3760] pb-1 mb-4">{title}</h3>
  );
  
  const AddressInputs: React.FC<{ type: 'permanentAddress' | 'presentAddress', data: Address, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ type, data, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <input name="division" value={data.division} onChange={onChange} placeholder="Division" className="w-full p-2 border rounded" />
        <input name="district" value={data.district} onChange={onChange} placeholder="District" className="w-full p-2 border rounded" />
        <input name="upazila" value={data.upazila} onChange={onChange} placeholder="Upazila" className="w-full p-2 border rounded" />
        <input name="thana" value={data.thana} onChange={onChange} placeholder="Thana" className="w-full p-2 border rounded" />
        <input name="postOffice" value={data.postOffice} onChange={onChange} placeholder="Post Office" className="w-full p-2 border rounded" />
        <input name="village" value={data.village} onChange={onChange} placeholder="Village/Road" className="w-full p-2 border rounded" />
    </div>
  );

  return (
    <>
      {isCameraOpen && <CameraCapture onCapture={handleCapture} onClose={() => setIsCameraOpen(false)} />}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
          <header className="flex items-center justify-between p-4 border-b bg-[#1B2445] text-white rounded-t-lg flex-shrink-0">
            <h2 className="text-xl font-bold">{employee ? 'View/Edit Employee' : 'Add New Employee'}</h2>
            <button onClick={onClose} className="text-3xl leading-none p-1 rounded-full hover:bg-[#2a3760]">&times;</button>
          </header>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-grow">
            <div>
              {renderSectionHeader('Photo Upload')}
              <FileInput label="Employee Photo" file={photoFile} setFile={setPhotoFile} onCapture={() => openCamera('photo')} currentUrl={formData.photoUrl} />
            </div>

            <div>
              {renderSectionHeader('Basic Information')}
              <FileInput label="Office ID Card" file={officeIdFile} setFile={setOfficeIdFile} onCapture={() => openCamera('officeId')} currentUrl={formData.officeIdCardUrl} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <input name="employeeId" value={formData.employeeId} onChange={handleSimpleChange} placeholder="ID Number *" required className="w-full p-2 border rounded" />
                <input name="name" value={formData.name} onChange={handleSimpleChange} placeholder="Name *" required className="w-full p-2 border rounded" />
                <input name="designation" value={formData.designation} onChange={handleSimpleChange} placeholder="Designation *" required className="w-full p-2 border rounded" />
                <input name="lineNumber" value={formData.lineNumber} onChange={handleSimpleChange} placeholder="Line Number" className="w-full p-2 border rounded" />
                <div>
                  <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
                  <input id="joinDate" type="date" name="joinDate" value={formData.joinDate} onChange={handleSimpleChange} className="w-full p-2 border rounded" />
                </div>
                <input name="phone" value={formData.phone} onChange={handleSimpleChange} placeholder="Phone Number" className="w-full p-2 border rounded" />
              </div>
            </div>
            
            <div>
              {renderSectionHeader('Skills')}
              {formData.skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 mb-2">
                  <input value={skill.item} onChange={e => handleSkillChange(skill.id, 'item', e.target.value)} placeholder="Item" className="w-full p-2 border rounded" />
                  <input value={skill.process} onChange={e => handleSkillChange(skill.id, 'process', e.target.value)} placeholder="Process" className="w-full p-2 border rounded" />
                  <button type="button" onClick={() => handleRemoveSkill(skill.id)} className="bg-[#e74c3c] text-white p-2 rounded w-10 h-10 flex-shrink-0">-</button>
                </div>
              ))}
              <button type="button" onClick={handleAddSkill} className="bg-[#1B2445] text-white p-2 rounded w-10 h-10">+</button>
            </div>

            <div>
              {renderSectionHeader('Personal Information')}
              <div className="space-y-4 mb-4">
                  <FileInput label="NID/Birth Certificate (Front)" file={nidFile} setFile={setNidFile} onCapture={() => openCamera('nidFront')} currentUrl={formData.nidUrl} />
                  <FileInput label="NID/Birth Certificate (Back)" file={nidBackFile} setFile={setNidBackFile} onCapture={() => openCamera('nidBack')} currentUrl={formData.nidBackUrl} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="fatherName" value={formData.fatherName} onChange={handleSimpleChange} placeholder="Father's Name" className="w-full p-2 border rounded" />
                <input name="motherName" value={formData.motherName} onChange={handleSimpleChange} placeholder="Mother's Name" className="w-full p-2 border rounded" />
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleSimpleChange} className="w-full p-2 border rounded">
                  <option>Unmarried</option> <option>Married</option>
                </select>
                <select name="gender" value={formData.gender} onChange={handleSimpleChange} className="w-full p-2 border rounded">
                  <option>Male</option> <option>Female</option> <option>Other</option>
                </select>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleSimpleChange} className="w-full p-2 border rounded">
                  <option>A+</option><option>A-</option> <option>B+</option><option>B-</option>
                  <option>AB+</option><option>AB-</option> <option>O+</option><option>O-</option>
                </select>
              </div>
            </div>

            <div>
              {renderSectionHeader('Address Information')}
              <h4 className="font-semibold text-gray-700 mb-2">Permanent Address (from NID)</h4>
              <AddressInputs type="permanentAddress" data={formData.permanentAddress} onChange={(e) => handleAddressChange('permanentAddress', e)} />
              
              <h4 className="font-semibold text-gray-700 mt-4 mb-2">Present Address (Type manually)</h4>
              <AddressInputs type="presentAddress" data={formData.presentAddress} onChange={(e) => handleAddressChange('presentAddress', e)} />
            </div>

          </form>
          <footer className="flex justify-end items-center gap-4 p-4 border-t sticky bottom-0 bg-white flex-shrink-0">
              {employee && <button type="button" onClick={() => onDelete(employee.id)} className="bg-[#e74c3c] text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:bg-gray-400" disabled={isSaving}>Delete</button>}
              <button type="button" onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-400" disabled={isSaving}>Cancel</button>
              <button type="button" onClick={triggerSubmit} className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] disabled:bg-gray-400" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default AddEditEmployeeModal;
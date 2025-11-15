
import React, { useState, useEffect, useMemo } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../services/firebaseService';
import { Employee } from '../types';
import AddEditEmployeeModal from '../components/AddEditEmployeeModal';

// Add type declarations for window objects from script tags
declare global {
    interface Window {
        jspdf: any;
    }
}

const EmployeesInformationPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    setLoading(true);
    const data = await getEmployees();
    setEmployees(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddClick = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleViewDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleSaveEmployee = async (employeeData: Omit<Employee, 'id' | 'slNo'>, id?: string) => {
    if (id) {
        await updateEmployee(id, employeeData);
    } else {
        await addEmployee(employeeData);
    }
    await fetchEmployees();
  };
  
  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
        await deleteEmployee(id);
        await fetchEmployees();
        handleCloseModal();
    }
  };


  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
        emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);
  
  const handleExportPdf = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 1. Title
    doc.setFontSize(18);
    doc.text('Employee Information Report', 14, 22);

    // 2. Summary
    doc.setFontSize(11);
    doc.setTextColor(100);
    
    const totalEmployees = employees.length;
    const designationCounts = employees.reduce((acc, emp) => {
        acc[emp.designation] = (acc[emp.designation] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    
    let summaryY = 32;
    doc.text(`Total Employees: ${totalEmployees}`, 14, summaryY);
    summaryY += 7;

    if (Object.keys(designationCounts).length > 0) {
        doc.text('Breakdown by Designation:', 14, summaryY);
        summaryY += 7;
        Object.entries(designationCounts).forEach(([designation, count]) => {
            doc.text(`- ${designation}: ${count}`, 14, summaryY);
            summaryY += 5;
        });
    } else if (totalEmployees === 0) {
        doc.text('No employee data available.', 14, summaryY);
        summaryY += 7;
    }
    
    // 3. Table
    const tableColumn = ["SL No.", "ID Number", "Name", "Designation", "Line Number", "Phone Number"];
    const tableRows = employees.map(emp => [
        emp.slNo,
        emp.employeeId,
        emp.name,
        emp.designation,
        emp.lineNumber,
        emp.phone
    ]);

    // Add table only if there are employees
    if (employees.length > 0) {
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: summaryY + 5,
            theme: 'grid',
            headStyles: { fillColor: [27, 36, 69] }, // #1B2445
        });
    }

    // 4. Save
    doc.save('employee_information.pdf');
  };

  return (
    <div className="p-1">
      <h1 className="text-2xl font-bold text-[#1B2445] mb-4">Employees Information</h1>
      
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <input 
          type="text"
          placeholder="Search by ID or Phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B2445] outline-none"
        />
        <button onClick={handleExportPdf} className="bg-[#1B2445] text-white px-4 py-2 rounded-lg hover:bg-[#2a3760] whitespace-nowrap">Export PDF</button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm text-left text-gray-700">
          <thead className="text-xs text-white uppercase bg-[#1B2445]">
            <tr>
              <th scope="col" className="px-4 py-3">SL No.</th>
              <th scope="col" className="px-4 py-3">ID Number</th>
              <th scope="col" className="px-4 py-3">Name</th>
              <th scope="col" className="px-4 py-3">Designation</th>
              <th scope="col" className="px-4 py-3">Line No.</th>
              <th scope="col" className="px-4 py-3">Phone</th>
              <th scope="col" className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center p-4">Loading...</td></tr>
            ) : (
              filteredEmployees.map((emp, index) => (
                <tr key={emp.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{emp.slNo}</td>
                  <td className="px-4 py-2 font-medium">{emp.employeeId}</td>
                  <td className={`px-4 py-2 ${index % 3 === 0 ? 'text-blue-600' : 'text-black'}`}>{emp.name}</td>
                  <td className="px-4 py-2">{emp.designation}</td>
                  <td className={`px-4 py-2 ${index % 3 === 1 ? 'text-green-600' : 'text-black'}`}>{emp.lineNumber}</td>
                  <td className="px-4 py-2">{emp.phone}</td>
                  <td className="px-4 py-2">
                    <button onClick={() => handleViewDetails(emp)} className="font-medium text-[#1B2445] hover:underline">View Details</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-5 bg-[#1B2445] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-[#2a3760] transition-transform transform hover:scale-110"
        aria-label="Add Employee"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <AddEditEmployeeModal
          employee={selectedEmployee}
          allEmployees={employees}
          onClose={handleCloseModal}
          onSave={handleSaveEmployee}
          onDelete={handleDeleteEmployee}
        />
      )}
    </div>
  );
};

export default EmployeesInformationPage;
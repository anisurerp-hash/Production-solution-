
import { User, Employee, InputData, OutputData } from '../types';

export const MOCK_USERS: User[] = [
  {
    uid: 'user-1',
    fullName: 'Mehedi Hasan',
    officeId: 'ST-0101',
    designation: 'Sr. Frontend Engineer',
    department: 'IT',
    email: 'test@example.com',
    phone: '01700000000',
    profilePictureUrl: 'https://picsum.photos/id/237/200/200'
  }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1', slNo: 1, employeeId: 'EMP001', name: 'Abul Kalam', designation: 'Sewing Operator', lineNumber: '5', joinDate: '2022-08-15', phone: '01911111111',
    skills: [{id: 's1', item: 'T-Shirt', process: 'Neck Join'}], fatherName: 'Abdur Rahim', motherName: 'Fatima Begum', maritalStatus: 'Married', gender: 'Male', bloodGroup: 'B+',
    permanentAddress: { division: 'Dhaka', district: 'Dhaka', upazila: 'Savar', thana: 'Savar', postOffice: 'Savar', village: 'Bank Colony' },
    presentAddress: { division: 'Dhaka', district: 'Dhaka', upazila: 'Savar', thana: 'Savar', postOffice: 'Savar', village: 'Bank Colony' },
    photoUrl: 'https://picsum.photos/id/1005/200/200'
  },
  {
    id: 'emp-2', slNo: 2, employeeId: 'EMP002', name: 'Fatema Akter', designation: 'Quality Inspector', lineNumber: '3', joinDate: '2023-01-20', phone: '01822222222',
    skills: [{id: 's2', item: 'Polo Shirt', process: 'Button Attach'}], fatherName: 'Korim Sheikh', motherName: 'Amena Begum', maritalStatus: 'Unmarried', gender: 'Female', bloodGroup: 'O+',
    permanentAddress: { division: 'Rajshahi', district: 'Bogura', upazila: 'Sadar', thana: 'Sadar', postOffice: 'Bogura', village: 'Malatinagar' },
    presentAddress: { division: 'Dhaka', district: 'Dhaka', upazila: 'Savar', thana: 'Savar', postOffice: 'Savar', village: 'Genda' },
    photoUrl: 'https://picsum.photos/id/1011/200/200'
  }
];

export const MOCK_INPUTS: InputData[] = [
    {
        id: 'in-1', slNo: 1, date: '2024-07-20', buyer: 'H&M', pf: 'PF2401', color: 'Red', po: 'PO123', lineNumber: '5', style: 'Basic Tee', sewingFinishDate: '2024-08-10',
        sizes: [
// FIX: Added missing 'cuttingNo' property.
            { id: 'sz1', cuttingNo: 'C01', size: 'M', shade: 'A', quantity: 500 },
// FIX: Added missing 'cuttingNo' property.
            { id: 'sz2', cuttingNo: 'C01', size: 'L', shade: 'A', quantity: 700 }
        ],
        totalQuantity: 1200
    },
    {
        id: 'in-2', slNo: 2, date: '2024-07-21', buyer: 'ZARA', pf: 'PF2402', color: 'Blue', po: 'PO456', lineNumber: '3', style: 'V-Neck', sewingFinishDate: '2024-08-15',
        sizes: [
// FIX: Added missing 'cuttingNo' property.
            { id: 'sz3', cuttingNo: 'C02', size: 'S', shade: 'B', quantity: 300 },
// FIX: Added missing 'cuttingNo' property.
            { id: 'sz4', cuttingNo: 'C02', size: 'M', shade: 'B', quantity: 400 }
        ],
        totalQuantity: 700
    }
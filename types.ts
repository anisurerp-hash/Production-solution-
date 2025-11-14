

export enum Page {
  Loading,
  Login,
  Register,
  ForgotPassword,
  Home,
  Employees,
  OperationBreakdown,
  Input,
  Output,
  HourlyProductionReport,
  ProductionSummary,
  QualityRequirement,
  ProductionPlanning,
  POFile,
}

export interface User {
  uid: string;
  fullName: string;
  officeId: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
  profilePictureUrl?: string;
}

export interface EmployeeSkill {
    id: string;
    item: string;
    process: string;
}

export interface Employee {
    id: string;
    slNo: number;
    employeeId: string;
    name: string;
    designation: string;
    lineNumber: string;
    joinDate: string;
    phone: string;
    skills: EmployeeSkill[];
    fatherName: string;
    motherName: string;
    maritalStatus: 'Married' | 'Unmarried';
    gender: 'Male' | 'Female' | 'Other';
    bloodGroup: string;
    permanentAddress: Address;
    presentAddress: Address;
    photoUrl?: string;
    nidUrl?: string;
    nidBackUrl?: string;
    officeIdCardUrl?: string;
}

export interface Address {
    division: string;
    district: string;
    upazila: string;
    thana: string;
    postOffice: string;
    village: string;
}

export interface InputDataSize {
    id: string;
    cuttingNo: string;
    size: string;
    shade: string;
    quantity: number;
}

export interface InputData {
    id: string;
    slNo: number;
    date: string;
    buyer: string;
    pf: string;
    color: string;
    po: string;
    lineNumber: string;
    style: string;
    sewingFinishDate: string;
    sizes: InputDataSize[];
    totalQuantity: number;
}

export interface OutputDataSize {
    id: string;
    size: string;
    shade: string;
    inputQuantity: number;
    outputQuantity: number;
    balanceQuantity: number;
}

export interface OutputData {
    id: string;
    slNo: number;
    date: string;
    buyer: string;
    pf: string;
    color: string;
    po: string;
    lineNumber: string;
    style: string;
    sewingFinishDate: string;
    sizes: OutputDataSize[];
    totalOutputQuantity: number;
    totalBalanceQuantity: number;
}

export interface OperationBreakdownPerson {
    id: string;
    process: string;
    part: 'front part' | 'back part' | 'assembly' | '';
    employeeId: string;
    name: string;
    manType: string;
    mcType: string;
    noOfMc: number;
}

export interface OperationBreakdownData {
    id: string;
    slNo: number;
    outputDate: string;
    lineNumber: string;
    buyer: string;
    po: string;
    pf: string;
    color: string;
    style: string;
    smv: number;
    manpower: number;
    persons: OperationBreakdownPerson[];
}
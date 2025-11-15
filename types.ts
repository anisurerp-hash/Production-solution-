export enum Page {
  Loading,
  Login,
  Register,
  ForgotPassword,
  Home,

  // Home Page Buttons
  EmployeesInformation,
  OperationBreakdown,
  Input,
  Output,
  HourlyProductionReport,
  ProductionSummary,
  OTList,
  QualityRequirement,
  ProductionPlanning,
  POFile,

  // Footer Buttons
  Calculator,
  Settings,
  Messages,
  Contacts,

  // --- Slider Menu ---
  // Production
  ProdCutting,
  ProdBundle,
  ProdLineFeeding,
  ProdSewing,
  ProdWIP,
  ProdBottleneck,
  ProdFinishing,
  ProdFinishingStatus,
  ProdPacking,
  ProdCarton,
  ProdReportDaily,
  ProdReportTarget,
  ProdReportRework,

  // Quality
  QualityFabric,
  Quality4Point,
  QualityShrinkage,
  QualityLabTest,
  QualityInline,
  QualityDefectEntry,
  QualityRework,
  QualityEndline,
  QualityMeasurement,
  QualityAQL,
  QualityFinal,
  QualityCarton,
  QualityReportDaily,
  QualityReportDefect,
  QualityReportMeasurement,
  
  // IE
  IETimeStudy,
  IELineBalance,
  IEEfficiency,
  IELossTime,
  IEReportDaily,
  IEReportCapacity,
  IEReportEfficiency,
}

export interface User {
  uid: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  officeId: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
}

// FIX: Added all missing type definitions.
export interface Address {
  division: string;
  district: string;
  upazila: string;
  thana: string;
  postOffice: string;
  village: string;
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
  maritalStatus: string;
  gender: string;
  bloodGroup: string;
  dateOfBirth: string;
  permanentAddress: Address;
  presentAddress: Address;
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
  lineNumber: string;
  buyer: string;
  po: string;
  style: string;
  pf: string;
  color: string;
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
    lineNumber: string;
    buyer: string;
    po: string;
    style: string;
    pf: string;
    color: string;
    sewingFinishDate: string;
    sizes: OutputDataSize[];
    totalOutputQuantity: number;
    totalBalanceQuantity: number;
}

export interface OperationBreakdownPerson {
    id: string;
    process: string;
    part: string;
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
    style: string;
    pf: string;
    color: string;
    smv: number;
    manpower: number;
    persons: OperationBreakdownPerson[];
}

export interface HourlyProductionManpower {
    id: string;
    manpower: number;
    workingHours: number;
}

export interface HourlyProductionProcess {
    id: string;
    process: 'Front part' | 'Back part' | 'Assembly' | 'Last process' | 'QC pass' | 'PAD';
    target: number; // Hourly target
    h1: number; v1: number;
    h2: number; v2: number;
    h3: number; v3: number;
    h4: number; v4: number;
    h5: number; v5: number;
    h6: number; v6: number;
    h7: number; v7: number;
    h8: number; v8: number;
    h9: number; v9: number;
    h10: number; v10: number;
    total: number;
    variance: number; // Total variance
}

export interface HourlyProductionData {
    id: string;
    slNo: number;
    date: string;
    lineNumber: string;
    buyer: string;
    style: string;
    po: string;
    pf: string;
    color: string;
    smv: number;
    manpowers: HourlyProductionManpower[];
    target: number; // The main target set in the details section
    production: HourlyProductionProcess[];
    // Calculated fields
    totalOutput: number;
    totalManpower: number;
    efficiency: number;
}

export interface OTEmployee {
  id: string; // for React key
  employeeId: string;
  name: string;
  process: string;
  otTime: '8:00' | '9:30';
}

export interface OTListData {
  id: string;
  slNo: number;
  date: string;
  lineNumber: string;
  buyer: string;
  po: string;
  style: string;
  pf: string;
  color: string;
  employees: OTEmployee[];
}
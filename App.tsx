import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Page, User } from './types';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

import EmployeesInformationPage from './pages/EmployeesInformationPage';
import InputPage from './pages/InputPage';
import OutputPage from './pages/OutputPage';
import OperationBreakdownPage from './pages/OperationBreakdownPage';
import POFilePage from './pages/POFilePage';
import PlaceholderPage from './components/PlaceholderPage';
import HourlyProductionReportPage from './pages/HourlyProductionReportPage';
import OTListPage from './pages/OTListPage';


interface AppContextType {
  navigate: (page: Page) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  currentPage: Page;
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(Page.Loading);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useCallback((page: Page) => {
    setPage(page);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ uid: firebaseUser.uid, ...userDoc.data() } as User);
           if (page === Page.Loading || page === Page.Login || page === Page.Register || page === Page.ForgotPassword) {
            navigate(Page.Home);
           }
        } else {
          // No user data in Firestore, something is wrong
          auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
        if (page !== Page.Register && page !== Page.ForgotPassword) {
             navigate(Page.Login);
        }
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [navigate, page]);


  if (authLoading) {
    return <LoadingPage />;
  }

  const renderPage = () => {
    const publicPages = [Page.Login, Page.Register, Page.ForgotPassword];
    if (!user && !publicPages.includes(page)) {
       return <LoginPage />;
    }

    switch (page) {
      case Page.Loading:
        return <LoadingPage />;
      case Page.Login:
        return <LoginPage />;
      case Page.Register:
        return <RegisterPage />;
      case Page.ForgotPassword:
        return <ForgotPasswordPage />;
      case Page.Home:
        return <HomePage />;
      
      // Home page routes
      case Page.EmployeesInformation:
        return <EmployeesInformationPage />;
      case Page.Input:
        return <InputPage />;
      case Page.Output:
        return <OutputPage />;
      case Page.OperationBreakdown:
        return <OperationBreakdownPage />;
      case Page.POFile:
        return <POFilePage />;

      // New placeholder pages from home
      case Page.HourlyProductionReport: return <HourlyProductionReportPage />;
      case Page.ProductionSummary: return <PlaceholderPage title="Production Summary" />;
      case Page.OTList: return <OTListPage />;
      case Page.QualityRequirement: return <PlaceholderPage title="Quality Requirement" />;
      case Page.ProductionPlanning: return <PlaceholderPage title="Production Planning" />;
        
      // Footer routes
      case Page.Calculator: return <PlaceholderPage title="Calculator" />;
      case Page.Settings: return <PlaceholderPage title="Settings" />;
      case Page.Messages: return <PlaceholderPage title="Messages" />;
      case Page.Contacts: return <PlaceholderPage title="Contacts" />;
      
      // Slider Menu: Production
      case Page.ProdCutting: return <PlaceholderPage title="Cutting" />;
      case Page.ProdBundle: return <PlaceholderPage title="Bundle" />;
      case Page.ProdLineFeeding: return <PlaceholderPage title="Line Feeding" />;
      case Page.ProdSewing: return <PlaceholderPage title="Sewing" />;
      case Page.ProdWIP: return <PlaceholderPage title="WIP" />;
      case Page.ProdBottleneck: return <PlaceholderPage title="Bottleneck" />;
      case Page.ProdFinishing: return <PlaceholderPage title="Finishing" />;
      case Page.ProdFinishingStatus: return <PlaceholderPage title="Finishing Status" />;
      case Page.ProdPacking: return <PlaceholderPage title="Packing" />;
      case Page.ProdCarton: return <PlaceholderPage title="Carton" />;
      case Page.ProdReportDaily: return <PlaceholderPage title="Daily Production Report" />;
      case Page.ProdReportTarget: return <PlaceholderPage title="Target vs Achievement Report" />;
      case Page.ProdReportRework: return <PlaceholderPage title="Rework / Reject Report" />;

      // Slider Menu: Quality
      case Page.QualityFabric: return <PlaceholderPage title="Fabric QC" />;
      case Page.Quality4Point: return <PlaceholderPage title="4-Point System" />;
      case Page.QualityShrinkage: return <PlaceholderPage title="Shrinkage Test" />;
      case Page.QualityLabTest: return <PlaceholderPage title="Lab Test" />;
      case Page.QualityInline: return <PlaceholderPage title="Inline QC" />;
      case Page.QualityDefectEntry: return <PlaceholderPage title="Defect Entry" />;
      case Page.QualityRework: return <PlaceholderPage title="Rework" />;
      case Page.QualityEndline: return <PlaceholderPage title="Endline QC" />;
      case Page.QualityMeasurement: return <PlaceholderPage title="Measurement" />;
      case Page.QualityAQL: return <PlaceholderPage title="AQL" />;
      case Page.QualityFinal: return <PlaceholderPage title="Final QC" />;
      case Page.QualityCarton: return <PlaceholderPage title="Carton QC" />;
      case Page.QualityReportDaily: return <PlaceholderPage title="Daily QC Report" />;
      case Page.QualityReportDefect: return <PlaceholderPage title="Defect Trend Report" />;
      case Page.QualityReportMeasurement: return <PlaceholderPage title="Measurement Report" />;
      
      // Slider Menu: IE
      case Page.IETimeStudy: return <PlaceholderPage title="Time Study" />;
      case Page.IELineBalance: return <PlaceholderPage title="Line Balance" />;
      case Page.IEEfficiency: return <PlaceholderPage title="Efficiency" />;
      case Page.IELossTime: return <PlaceholderPage title="Loss Time" />;
      case Page.IEReportDaily: return <PlaceholderPage title="IE Daily Report" />;
      case Page.IEReportCapacity: return <PlaceholderPage title="Capacity Report" />;
      case Page.IEReportEfficiency: return <PlaceholderPage title="Efficiency Report" />;

      default:
        return user ? <HomePage /> : <LoginPage/>;
    }
  };
  
  const showLayout = !!user;

  return (
    <AppContext.Provider value={{ navigate, user, setUser, currentPage: page }}>
        <div className="bg-white font-sans">
            {showLayout ? <Layout>{renderPage()}</Layout> : renderPage()}
        </div>
    </AppContext.Provider>
  );
};

export default App;
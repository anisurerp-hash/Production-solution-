import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Page, User } from './types';
import LoadingPage from './pages/LoadingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import EmployeesInformationPage from './pages/EmployeesInformationPage';
import InputPage from './pages/InputPage';
import OutputPage from './pages/OutputPage';
import POFilePage from './pages/POFilePage';
import OperationBreakdownPage from './pages/OperationBreakdownPage';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';
import { db } from './firebase';


interface AppContextType {
  navigate: (page: Page) => void;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
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
      case Page.Employees:
        return <EmployeesInformationPage />;
      case Page.Input:
        return <InputPage />;
      case Page.Output:
        return <OutputPage />;
      case Page.POFile:
        return <POFilePage />;
      case Page.OperationBreakdown:
        return <OperationBreakdownPage />;
      default:
        return user ? <HomePage /> : <LoginPage/>;
    }
  };
  
  const showLayout = !!user;

  return (
    <AppContext.Provider value={{ navigate, user, setUser }}>
        <div className="bg-white font-sans">
            {showLayout ? <Layout>{renderPage()}</Layout> : renderPage()}
        </div>
    </AppContext.Provider>
  );
};

export default App;
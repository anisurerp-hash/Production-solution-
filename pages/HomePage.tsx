import React from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';

interface ButtonData {
  label: string;
  page: Page;
  icon: React.ReactNode;
}

const hrButtons: ButtonData[] = [
  { label: 'Employees Information', page: Page.EmployeesInformation, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M9 13.75c-2.97 0-6.1 1.46-6.1 2.12V17h12.2v-1.12c0-.66-3.13-2.13-6.1-2.13zM9 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm7.5-3c.83 0 1.5-.67 1.5-1.5S17.33 6 16.5 6s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-2.5 3.5c-1.28 0-3.58.61-4.5 1.43.91.82 3.22 1.43 4.5 1.43.3 0 .59-.02.87-.06.2-.31.36-.66.47-1.03A4.409 4.409 0 0 0 14 15.5z"/></svg> },
];

const sewingButtons: ButtonData[] = [
    { label: 'Operation breakdown', page: Page.OperationBreakdown, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z"/></svg> },
    { label: 'Input', page: Page.Input, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"/></svg> },
    { label: 'Output', page: Page.Output, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="m17 7-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg> },
    { label: 'Hourly Production', page: Page.HourlyProductionReport, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19.5 3.5 18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20h18V2l-1.5 1.5zM11 17H9v-4h2v4zm4 0h-2v-7h2v7zM7 17H5v-2h2v2z"/></svg> },
    { label: 'Production Summary', page: Page.ProductionSummary, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M15 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V9l-6-6zM8 17c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 1V4.5l5.5 5.5H14z"/></svg> },
    { label: 'OT List', page: Page.OTList, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3 5.49-5.5z"/></svg> },
    { label: 'Quality Requirement', page: Page.QualityRequirement, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg> },
    { label: 'Production Planning', page: Page.ProductionPlanning, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M17 10H7v2h10v-2zm2-7h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zm-5-5H7v2h7v-2z"/></svg> },
    { label: 'PO File', page: Page.POFile, icon: <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2.06 11L15 15.28 12.06 17l.78-3.33-2.59-2.24 3.41-.29L15 8l1.34 3.14 3.41.29-2.59 2.24.78 3.33z"/></svg> },
];

const HomePage: React.FC = () => {
    const { navigate } = useAppContext();

    const Section: React.FC<{ title: string; buttons: ButtonData[] }> = ({ title, buttons }) => (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-700 mb-4 pb-2 border-b-2 border-gray-200">{title}</h2>
        <div className="grid grid-cols-3 gap-4">
          {buttons.map((button) => (
            <div key={button.label} className="flex flex-col items-center">
              <button
                onClick={() => navigate(button.page)}
                className="w-20 h-20 bg-[#1B2445] rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-105"
                aria-label={button.label}
              >
                <div className="w-8 h-8">
                    {button.icon}
                </div>
              </button>
              <p className="mt-2 text-center text-xs font-semibold text-gray-600">{button.label}</p>
            </div>
          ))}
        </div>
      </div>
    );
  
    return (
      <div className="p-4 bg-white">
        <Section title="HR and Administration" buttons={hrButtons} />
        <Section title="Sewing Production" buttons={sewingButtons} />
      </div>
    );
};

export default HomePage;
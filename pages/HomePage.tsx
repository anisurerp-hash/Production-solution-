import React from 'react';
import { useAppContext } from '../App';
import { Page } from '../types';

const iconClass = "w-8 h-8";

const icons = {
    employees: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    operationBreakdown: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
    input: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>,
    output: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>,
    hourlyProduction: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>,
    productionSummary: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    quality: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>,
    planning: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>,
    poFile: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>,
};


const HomePage: React.FC = () => {
    const { navigate } = useAppContext();

    const sections = [
        { 
            title: "HR and Administration", 
            buttons: [
                { label: "Employees Information", icon: icons.employees, page: Page.Employees },
            ] 
        },
        { 
            title: "Sewing Production", 
            buttons: [
                { label: "Operation Breakdown", icon: icons.operationBreakdown, page: Page.OperationBreakdown },
                { label: "Input", icon: icons.input, page: Page.Input },
                { label: "Output", icon: icons.output, page: Page.Output },
                { label: "Hourly Production Report", icon: icons.hourlyProduction, page: Page.HourlyProductionReport },
                { label: "Production Summary", icon: icons.productionSummary, page: Page.ProductionSummary },
                { label: "Quality Requirement", icon: icons.quality, page: Page.QualityRequirement },
                { label: "Production Planning", icon: icons.planning, page: Page.ProductionPlanning },
                { label: "PO File", icon: icons.poFile, page: Page.POFile },
            ] 
        },
    ];

    const handleNavigate = (page: Page | null) => {
        if (page !== null) {
            navigate(page);
        } else {
            alert("This page is not yet implemented.");
        }
    }

    return (
        <div className="p-4 space-y-8">
            {sections.map(section => (
                <div key={section.title}>
                    <h2 className="text-xl font-bold text-[#1B2445] mb-4 border-b-2 border-[#1B2445] pb-2">{section.title}</h2>
                    <div className="grid grid-cols-3 gap-4">
                        {section.buttons.map(button => (
                            <button 
                                key={button.label} 
                                onClick={() => handleNavigate(button.page)}
                                className="flex flex-col items-center justify-center p-2 space-y-2 bg-[#1B2445] text-white rounded-full aspect-square shadow-lg transform hover:scale-105 transition-transform duration-300"
                            >
                                <div className="text-white">{button.icon}</div>
                                <span className="text-xs text-center font-semibold">{button.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HomePage;
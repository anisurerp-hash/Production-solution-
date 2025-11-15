import React from 'react';
import { useAppContext } from '../App';
import { signOutUser } from '../services/firebaseService';
import { Page } from '../types';

interface SliderMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
    title: string;
    page?: Page;
    icon?: React.ReactNode;
    subItems?: MenuItem[];
}

const menuData: MenuItem[] = [
    { 
        title: 'Production', 
        subItems: [
            { title: 'Input', page: Page.Input },
            { title: 'Cutting', page: Page.ProdCutting },
            { title: 'Bundle', page: Page.ProdBundle },
            { title: 'Line Feeding', page: Page.ProdLineFeeding },
            { title: 'Sewing', page: Page.ProdSewing },
            { title: 'Hourly Prod.', page: Page.HourlyProductionReport },
            { title: 'WIP', page: Page.ProdWIP },
            { title: 'Bottleneck', page: Page.ProdBottleneck },
            { title: 'Finishing', page: Page.ProdFinishing },
            { title: 'Finishing Status', page: Page.ProdFinishingStatus },
            { title: 'Packing', page: Page.ProdPacking },
            { title: 'Carton', page: Page.ProdCarton },
            { title: 'Reports', subItems: [
                { title: 'Daily Prod.', page: Page.ProdReportDaily },
                { title: 'Target vs Achv', page: Page.ProdReportTarget },
                { title: 'Rework / Reject', page: Page.ProdReportRework },
            ]}
        ]
    },
    {
        title: 'Quality',
        subItems: [
            { title: 'Fabric QC', subItems: [
                { title: '4-Point', page: Page.Quality4Point },
                { title: 'Shrinkage', page: Page.QualityShrinkage },
                { title: 'Lab Test', page: Page.QualityLabTest },
            ] },
            { title: 'Inline QC', subItems: [
                { title: 'Inline Check', page: Page.QualityInline },
                { title: 'Defect Entry', page: Page.QualityDefectEntry },
                { title: 'Rework', page: Page.QualityRework },
            ] },
            { title: 'Endline QC', subItems: [
                { title: 'Endline Check', page: Page.QualityEndline },
                { title: 'Measurement', page: Page.QualityMeasurement },
                { title: 'AQL', page: Page.QualityAQL },
            ] },
            { title: 'Final QC', subItems: [
                { title: 'Final Inspection', page: Page.QualityFinal },
                { title: 'Carton QC', page: Page.QualityCarton },
            ] },
             { title: 'Reports', subItems: [
                { title: 'Daily QC', page: Page.QualityReportDaily },
                { title: 'Defect Trend', page: Page.QualityReportDefect },
                { title: 'Measurement', page: Page.QualityReportMeasurement },
            ]}
        ]
    },
    {
        title: 'IE',
        subItems: [
            { title: 'Time Study', page: Page.IETimeStudy },
            { title: 'Line Balance', page: Page.IELineBalance },
            { title: 'Efficiency', page: Page.IEEfficiency },
            { title: 'Loss Time', page: Page.IELossTime },
            { title: 'Reports', subItems: [
                { title: 'IE Daily', page: Page.IEReportDaily },
                { title: 'Capacity', page: Page.IEReportCapacity },
                { title: 'Efficiency', page: Page.IEReportEfficiency },
            ] }
        ]
    }
];

const MenuNode: React.FC<{ item: MenuItem, level: number, onNavigate: () => void }> = ({ item, level, onNavigate }) => {
    const { navigate } = useAppContext();
    const hasSubItems = item.subItems && item.subItems.length > 0;

    const style = { paddingLeft: `${1 + level * 1.25}rem` };

    const handleClick = () => {
        if (item.page !== undefined) {
            navigate(item.page);
            onNavigate();
        }
    };

    // Determine the styling based on the item's role
    const isClickable = item.page !== undefined;
    const isTopLevelHeader = level === 0;
    const isSubHeader = hasSubItems && !isClickable;

    const getClasses = () => {
        const base = "flex items-center w-full text-left px-4";
        if (isTopLevelHeader) {
            return `${base} py-3 font-bold text-[#1B2445] text-base`;
        }
        if (isSubHeader) {
            return `${base} py-2 font-semibold text-gray-500 cursor-default`;
        }
        // It's a clickable item
        return `${base} py-2 text-gray-700 hover:bg-gray-100`;
    };

    return (
        <div>
            <button
                onClick={handleClick}
                className={getClasses()}
                style={style}
                disabled={!isClickable}
            >
                <span>{item.title}</span>
            </button>

            {hasSubItems && (
                <div>
                    {item.subItems?.map((subItem) => (
                        <MenuNode key={subItem.title} item={subItem} level={level + 1} onNavigate={onNavigate} />
                    ))}
                </div>
            )}
        </div>
    );
};


const SliderMenu: React.FC<SliderMenuProps> = ({ isOpen, onClose }) => {
  const { user, navigate } = useAppContext();

  const handleLogout = async () => {
    onClose();
    await signOutUser();
    navigate(Page.Login);
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-[60] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 left-0 h-full bg-white w-[250px] max-w-[85%] z-[70] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Slider Header */}
          <div className="h-[60px] bg-[#1B2445] flex items-center px-4 text-white flex-shrink-0">
            <button onClick={onClose} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 flex flex-col items-center text-center flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
            </div>
            <h3 className="font-bold text-lg text-gray-800">{user?.fullName || 'Guest User'}</h3>
            <p className="text-sm text-gray-500">{user?.email || 'no-email@example.com'}</p>
            <p className="text-sm text-gray-500">{user?.phone || 'No phone number'}</p>
          </div>

          <div className="border-t border-[#1B2445] mx-4 flex-shrink-0"></div>
          
          {/* Menu Items */}
          <nav className="flex-grow overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1B2445 #f1f1f1' }}>
             {menuData.map(item => <MenuNode key={item.title} item={item} level={0} onNavigate={onClose} />)}
          </nav>

            {/* Logout Button */}
            <div className="flex-shrink-0 border-t border-gray-200">
                <button
                onClick={handleLogout}
                className="flex items-center gap-4 px-6 py-4 text-[#e74c3c] w-full text-left hover:bg-gray-100 transition-colors"
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default SliderMenu;
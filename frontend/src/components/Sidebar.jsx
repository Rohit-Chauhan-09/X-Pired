import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  PlusCircle, 
  MapPin, 
  Percent, 
  Printer, 
  CheckSquare, 
  TrendingUp, 
  Trash2, 
  SlidersHorizontal 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'FEFO Inventory', path: '/inventory', icon: PackageSearch },
  { name: 'Add Product', path: '/add-product', icon: PlusCircle },
  { name: 'Rack & Shelf Locator', path: '/locator', icon: MapPin },
  { name: 'Smart Discounter', path: '/discounts', icon: Percent },
  { name: 'Clearance Posters', path: '/posters', icon: Printer },
  { name: 'Staff Daily Tasks', path: '/tasks', icon: CheckSquare },
  { name: 'Financial Tracker', path: '/financials', icon: TrendingUp },
  { name: 'Disposal History', path: '/disposals', icon: Trash2 },
  { name: 'Store Settings', path: '/settings', icon: SlidersHorizontal },
];

const Sidebar = () => {
  const { isOwner } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 no-print h-[calc(100vh-4rem)] border-r border-slate-800 overflow-hidden select-none">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-slate-800/80 shrink-0">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">
          Store Operations
        </p>
      </div>

      {/* Navigation List - Non-Scrollable & Perfectly Spaced */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-hidden flex flex-col justify-evenly">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* System Footer Card */}
      <div className="p-3 m-3 rounded-xl bg-slate-800/70 border border-slate-700/50 text-xs shrink-0">
        <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
          <span>Project Version</span>
          <span className="font-mono text-emerald-400 font-bold">v1.0 (B1)</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-tight">
          Developed by <strong className="text-slate-200">Rohit Chauhan</strong> & <strong className="text-slate-200">Atharva Chavan</strong>
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

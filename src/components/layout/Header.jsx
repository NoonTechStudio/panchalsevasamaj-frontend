// Update src/components/layout/Header.jsx
import { useState } from "react";
import { Bell, User, ChevronDown, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex justify-between items-center px-4 py-3 sm:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden mr-3 text-gray-500 hover:text-gray-700"
            >
              {showMobileMenu ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              Community Family Records System
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-1 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
            </button>

            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">
                {user?.fullName || "Admin User"}
              </span>
              <ChevronDown className="ml-1 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Dashboard
            </a>
            <a
              href="/families"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Families
            </a>
            <a
              href="/deceased"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Deceased
            </a>
            <a
              href="/settings"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Settings
            </a>
            <button
              onClick={logout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-900 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

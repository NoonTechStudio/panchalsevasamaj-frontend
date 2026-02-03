// src/components/export/FamilyExportModal.jsx
import { useState } from "react";
import { X, Printer, FileSpreadsheet } from "lucide-react";
import FamilyExport from "./FamilyExport";

const FamilyExportModal = ({ isOpen, onClose, familyData, formData }) => {
  const [exportMode, setExportMode] = useState(null);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Export Family Details
                </h3>
                <p className="text-sm text-gray-600">
                  Choose export format for {formData.headOfFamily.fullName}'s
                  family
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Select Export Format:
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {/* Excel Export */}
                <button
                  onClick={() => setExportMode("excel")}
                  className="flex flex-col items-center justify-center p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-500 hover:bg-green-100 transition-all duration-200"
                >
                  <FileSpreadsheet className="h-8 w-8 text-green-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Export to Excel
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Same format as web view
                  </span>
                </button>

                {/* Print */}
                <button
                  onClick={() => setExportMode("print")}
                  className="flex flex-col items-center justify-center p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:border-blue-500 hover:bg-blue-100 transition-all duration-200"
                >
                  <Printer className="h-8 w-8 text-blue-600 mb-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Print
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Print-friendly layout
                  </span>
                </button>
              </div>
            </div>

            {/* Family Info Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Family Summary:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Family Head:</span>
                  <span className="font-medium">
                    {formData.headOfFamily.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Members:</span>
                  <span className="font-medium">
                    {formData.familyMembers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member No:</span>
                  <span className="font-medium">
                    {formData.headOfFamily.srNo || formData.formSrNo || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">
                    {formData.correspondenceAddress.branch || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t">
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden export component that triggers when mode is selected */}
      {exportMode && (
        <FamilyExport
          familyData={familyData}
          formData={formData}
          onClose={() => {
            setExportMode(null);
            onClose();
          }}
          mode={exportMode}
        />
      )}
    </>
  );
};

export default FamilyExportModal;

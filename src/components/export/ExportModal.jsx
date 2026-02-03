// src/components/export/ExportModal.jsx
import { useState } from "react";
import { Download, X, Filter, Users, Heart } from "lucide-react";

const ExportModal = ({
  isOpen,
  onClose,
  onExport,
  families = [],
  deceasedRecords = [],
  loading = false,
}) => {
  const [exportType, setExportType] = useState("families");
  const [filters, setFilters] = useState({
    area: "",
    locality: "",
  });
  const [fileName, setFileName] = useState("community_data");

  if (!isOpen) return null;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onExport(exportType, filters, fileName);
  };

  const getUniqueAreas = () => {
    const areas = new Set();
    families.forEach((family) => {
      // Get area from correspondenceAddress.branch (which is the Branch field in the form)
      if (family.correspondenceAddress?.branch) {
        areas.add(family.correspondenceAddress.branch);
      }
      // Fallback to homeAddress area if branch is not available
      if (family.homeAddress?.area && !family.correspondenceAddress?.branch) {
        areas.add(family.homeAddress.area);
      }
    });
    return Array.from(areas).sort();
  };

  const getUniqueCities = () => {
    const cities = new Set();
    families.forEach((family) => {
      if (family.correspondenceAddress?.city)
        cities.add(family.correspondenceAddress.city);
      if (family.homeAddress?.city) cities.add(family.homeAddress.city);
    });
    return Array.from(cities).sort();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Download className="h-6 w-6 text-blue-600 mr-2" />
            <h3 className="text-xl font-bold text-gray-900">Export Data</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Export Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExportType("families")}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  exportType === "families"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users className="h-5 w-5 mr-2" />
                <span>Families</span>
                <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                  {families.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setExportType("deceased")}
                className={`flex items-center justify-center p-3 rounded-lg border-2 transition-all ${
                  exportType === "deceased"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Heart className="h-5 w-5 mr-2" />
                <span>Deceased</span>
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                  {deceasedRecords.length}
                </span>
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-3">
              <Filter className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Filters (Optional)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City (Branch)
                </label>
                <select
                  name="area"
                  value={filters.area}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Areas</option>
                  {getUniqueAreas().map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Cities</option>
                  {getUniqueCities().map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Locality (Optional)
                </label>
                <input
                  type="text"
                  name="locality"
                  value={filters.locality}
                  onChange={handleFilterChange}
                  placeholder="Enter locality name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* File Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter file name"
            />
            <p className="mt-1 text-sm text-gray-500">
              File will be saved as: {fileName}_YYYY-MM-DD.xlsx
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExportModal;

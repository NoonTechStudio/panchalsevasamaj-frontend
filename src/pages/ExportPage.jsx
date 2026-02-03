// src/pages/ExportPage.jsx
import { useState, useEffect } from "react";
import { Download, Filter, Users, Heart, Home, Calendar } from "lucide-react";
import { familiesAPI, deceasedAPI } from "../services/api";
import {
  exportFamiliesToExcel,
  exportDeceasedToExcel,
} from "../utils/exportToExcel";
import toast from "react-hot-toast";

const ExportPage = () => {
  const [loading, setLoading] = useState(false);
  const [families, setFamilies] = useState([]);
  const [deceased, setDeceased] = useState([]);
  const [filters, setFilters] = useState({
    type: "families",
    area: "",
    city: "",
    locality: "",
    fromDate: "",
    toDate: "",
  });
  const [areas, setAreas] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [familiesRes, deceasedRes] = await Promise.all([
        familiesAPI.getAll({ limit: 10000 }),
        deceasedAPI.getAll({ limit: 10000 }),
      ]);

      setFamilies(familiesRes.data.families || []);
      setDeceased(deceasedRes.data.deceased || []);

      // Extract unique areas and cities
      const areaSet = new Set();
      const citySet = new Set();

      familiesRes.data.families?.forEach((family) => {
        if (family.correspondenceAddress?.area)
          areaSet.add(family.correspondenceAddress.area);
        if (family.homeAddress?.area) areaSet.add(family.homeAddress.area);
        if (family.correspondenceAddress?.city)
          citySet.add(family.correspondenceAddress.city);
        if (family.homeAddress?.city) citySet.add(family.homeAddress.city);
      });

      setAreas(Array.from(areaSet).sort());
      setCities(Array.from(citySet).sort());
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);

      let result;
      if (filters.type === "families") {
        result = exportFamiliesToExcel(families, filters, "community_families");
      } else {
        result = exportDeceasedToExcel(deceased, filters, "deceased_records");
      }

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-8">
          <Download className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Export</h1>
            <p className="text-gray-600">
              Export community data to Excel with advanced filters
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Filters Panel */}
          <div className="lg:col-span-1 bg-gray-50 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Export Settings
            </h2>

            <div className="space-y-6">
              {/* Export Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Type
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.type === "families"}
                      onChange={() =>
                        setFilters((prev) => ({ ...prev, type: "families" }))
                      }
                      className="h-4 w-4 text-blue-600"
                    />
                    <Users className="h-5 w-5 ml-2 mr-2 text-blue-600" />
                    <span className="text-gray-700">
                      Families ({families.length})
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={filters.type === "deceased"}
                      onChange={() =>
                        setFilters((prev) => ({ ...prev, type: "deceased" }))
                      }
                      className="h-4 w-4 text-red-600"
                    />
                    <Heart className="h-5 w-5 ml-2 mr-2 text-red-600" />
                    <span className="text-gray-700">
                      Deceased ({deceased.length})
                    </span>
                  </label>
                </div>
              </div>

              {/* Area Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Area
                </label>
                <select
                  value={filters.area}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, area: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Areas</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <select
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Cities</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Date Range
                </label>
                <div className="space-y-3">
                  <input
                    type="date"
                    value={filters.fromDate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        fromDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="date"
                    value={filters.toDate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        toDate: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview and Export */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Export Preview
              </h2>

              <div className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    {filters.type === "families" ? (
                      <Users className="h-6 w-6 text-blue-600 mr-3" />
                    ) : (
                      <Heart className="h-6 w-6 text-red-600 mr-3" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Exporting{" "}
                        {filters.type === "families" ? "Family" : "Deceased"}{" "}
                        Records
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Total records:{" "}
                        {filters.type === "families"
                          ? families.length
                          : deceased.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Filters Applied:</h4>
                <div className="flex flex-wrap gap-2">
                  {filters.area && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      <Home className="h-3 w-3 mr-1" /> Area: {filters.area}
                    </span>
                  )}
                  {filters.city && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      City: {filters.city}
                    </span>
                  )}
                  {filters.fromDate && filters.toDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      <Calendar className="h-3 w-3 mr-1" /> {filters.fromDate}{" "}
                      to {filters.toDate}
                    </span>
                  )}
                  {!filters.area && !filters.city && !filters.fromDate && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      No filters applied
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Export to Excel
                    </>
                  )}
                </button>
                <p className="text-sm text-gray-500 text-center mt-3">
                  The Excel file will contain all data with formatting and
                  multiple sheets
                </p>
              </div>
            </div>

            {/* Export History (Optional) */}
            <div className="mt-6 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export History
              </h3>
              <div className="text-center py-8">
                <Download className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No export history yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your export history will appear here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPage;

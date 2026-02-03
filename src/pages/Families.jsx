// src/pages/Families.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import FamilyForm from "../components/forms/FamilyForm";
import { familiesAPI } from "../services/api";

const Families = () => {
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    area: "",
    familyType: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    fetchFamilies();
  }, [pagination.page, filters]);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await familiesAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters,
      });
      setFamilies(response.data.families);
      setPagination((prev) => ({
        ...prev,
        total: response.data.totalFamilies,
        totalPages: response.data.totalPages,
      }));
    } catch (error) {
      console.error("Error fetching families:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchFamilies();
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFamilyAdded = () => {
    setShowFamilyForm(false);
    fetchFamilies();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this family?")) {
      try {
        await familiesAPI.delete(id);
        fetchFamilies();
      } catch (error) {
        alert("Error deleting family: " + error.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {showFamilyForm && (
        <FamilyForm
          onClose={() => setShowFamilyForm(false)}
          onSuccess={handleFamilyAdded}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Families Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            View and manage all family records in the community
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0">
          <button className="btn-secondary">
            <Download className="mr-2 h-4 w-4" />
            Export
          </button>
          <button
            className="btn-primary"
            onClick={() => setShowFamilyForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Family
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
            <div className="flex-grow">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Search by name, mobile, Aadhar, Family ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn-primary mt-2 md:mt-0">
              <Search className="mr-2 h-4 w-4" />
              Search
            </button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Area
              </label>
              <select
                className="mt-1 form-input text-sm"
                value={filters.area}
                onChange={(e) => handleFilterChange("area", e.target.value)}
              >
                <option value="">All Areas</option>
                <option value="Downtown">Downtown</option>
                <option value="Suburban">Suburban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Family Type
              </label>
              <select
                className="mt-1 form-input text-sm"
                value={filters.familyType}
                onChange={(e) =>
                  handleFilterChange("familyType", e.target.value)
                }
              >
                <option value="">All Types</option>
                <option value="Nuclear">Nuclear</option>
                <option value="Joint">Joint</option>
                <option value="Extended">Extended</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Families Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                All Families ({pagination.total})
              </h3>
            </div>
            <div className="mt-3 sm:mt-0">
              <select className="form-input text-sm">
                <option>20 per page</option>
                <option>50 per page</option>
                <option>100 per page</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading families...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Family ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Head of Family
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Added On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {families.map((family) => (
                      <tr key={family._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {family.serialNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Family ID: {family.familyId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {family.headOfFamily?.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {family.headOfFamily?.aadharNumber || "No Aadhar"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {family.contact?.mobile}
                          </div>
                          <div className="text-sm text-gray-500">
                            {family.contact?.email || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {family.homeAddress?.street || "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {family.homeAddress?.area || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              family.familyType === "Nuclear"
                                ? "bg-green-100 text-green-800"
                                : family.familyType === "Joint"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {family.familyType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(family.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-primary-600 hover:text-primary-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDelete(family._id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {(pagination.page - 1) * pagination.limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        families
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: Math.max(1, prev.page - 1),
                            }))
                          }
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        {[...Array(pagination.totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: i + 1,
                              }))
                            }
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pagination.page === i + 1
                                ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: Math.min(
                                pagination.totalPages,
                                prev.page + 1,
                              ),
                            }))
                          }
                          disabled={pagination.page === pagination.totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Families;

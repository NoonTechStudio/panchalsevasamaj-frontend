// src/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Users,
  Home,
  Heart,
  UserPlus,
  LogOut,
  Eye,
  Edit,
  RefreshCw,
  Download,
  Trash2,
  X,
} from "lucide-react";
import FamilyForm from "../components/forms/FamilyForm";
import ExportModal from "../components/export/ExportModal";
import {
  exportFamiliesToExcel,
  exportDeceasedToExcel,
} from "../utils/exportToExcel";
import DeceasedForm from "../components/forms/DeceasedForm";
import { familiesAPI, deceasedAPI } from "../services/api";
import CommunityLogo from "../assets/SamajLogo.png";
import UserMenu from "../components/layout/UserMenu";
import toast from "react-hot-toast";
import LordPhoto from "../assets/Photo.png";

const Dashboard = () => {
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [showDeceasedForm, setShowDeceasedForm] = useState(false);
  const [deleteConfirmFamily, setDeleteConfirmFamily] = useState(null);
  const [deletingFamily, setDeletingFamily] = useState(false);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deceasedRecords, setDeceasedRecords] = useState([]);
  const [deceasedLoading, setDeceasedLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalMembers: 0,
    areasCovered: 0,
    deceased: 0,
  });

  // Add state for selected family and mode
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [selectedDeceased, setSelectedDeceased] = useState(null);
  const [isEditingDeceased, setIsEditingDeceased] = useState(false);
  const [isViewModeDeceased, setIsViewModeDeceased] = useState(false);
  const [deleteConfirmDeceased, setDeleteConfirmDeceased] = useState(null);

  const fetchStats = async () => {
    try {
      // Fetch families
      const familiesResponse = await familiesAPI.getAll({ limit: 1000 });
      const families = familiesResponse.data.families;
      const deceasedResponse = await deceasedAPI.getAll({ limit: 1 });

      // Calculate areas - FIXED: Use correspondenceAddress area first
      const areas = new Set();
      families.forEach((family) => {
        // Try correspondenceAddress area first, then homeAddress area
        const area =
          family.correspondenceAddress?.area || family.homeAddress?.area;
        if (area) {
          areas.add(area);
        }
      });

      // Calculate total members
      const totalMembers = families.reduce((total, family) => {
        return total + (family.members?.length || 0);
      }, 0);

      setStats({
        totalFamilies: familiesResponse.data.totalFamilies || 0,
        totalMembers: totalMembers,
        areasCovered: areas.size,
        deceased: deceasedResponse.data.totalRecords || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchFamilies();
    fetchStats();
    fetchDeceasedRecords();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await familiesAPI.getAll({
        page: 1,
        limit: 10,
        search: searchTerm,
      });

      // Now families should have members included
      setFamilies(response.data.families || []);

      // Update stats if needed
      const totalMembers = response.data.families.reduce((total, family) => {
        return total + (family.members?.length || 0);
      }, 0);

      setStats((prev) => ({
        ...prev,
        totalMembers: totalMembers,
      }));
    } catch (error) {
      console.error("Error fetching families:", error);
    } finally {
      setLoading(false);
    }
  };

  // Deceased member data
  const fetchDeceasedRecords = async () => {
    try {
      setDeceasedLoading(true);
      const response = await deceasedAPI.getAll({
        page: 1,
        limit: 10,
      });
      setDeceasedRecords(response.data.deceased || []);

      // Update stats with actual deceased count
      setStats((prev) => ({
        ...prev,
        deceased: response.data.totalRecords || 0,
      }));
    } catch (error) {
      console.error("Error fetching deceased records:", error);
    } finally {
      setDeceasedLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFamilies();
  };

  const handleDeleteFamily = (family) => {
    if (isViewMode) {
      toast.error("Cannot delete while in view mode");
      return;
    }
    setDeleteConfirmFamily(family);
  };

  const confirmDeleteFamily = async () => {
    if (!deleteConfirmFamily) return;

    try {
      setDeletingFamily(true);
      await familiesAPI.delete(deleteConfirmFamily._id);

      toast.success("Family deleted successfully");

      // Refresh families and stats
      fetchFamilies();
      fetchStats();

      // Close confirmation
      setDeleteConfirmFamily(null);
    } catch (error) {
      console.error("Error deleting family:", error);
      toast.error(error.response?.data?.error || "Failed to delete family");
    } finally {
      setDeletingFamily(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // If search term is cleared, fetch all families immediately
    if (value === "") {
      fetchFamilies();
    }
  };

  const handleFamilyFormSuccess = () => {
    setSelectedFamily(null);
    setShowFamilyForm(false);
    setIsEditing(false);
    setIsViewMode(false);
    fetchFamilies();
    fetchStats();
  };

  const handleDeceasedAdded = () => {
    setShowDeceasedForm(false);
    fetchStats();
    fetchDeceasedRecords(); // Refresh deceased records
  };

  // Handle view deceased record
  const handleViewDeceased = (record) => {
    console.log("Viewing deceased record:", record);
    setSelectedDeceased(record);
    setIsEditingDeceased(false);
    setIsViewModeDeceased(true);
    setShowDeceasedForm(true);
  };

  // Handle edit deceased record
  const handleEditDeceased = (record) => {
    console.log("Editing deceased record:", record);
    setSelectedDeceased(record);
    setIsEditingDeceased(true);
    setIsViewModeDeceased(false);
    setShowDeceasedForm(true);
  };

  // Handle delete deceased record
  const handleDeleteDeceased = (record) => {
    setDeleteConfirmDeceased(record);
  };

  const confirmDeleteDeceased = async () => {
    if (!deleteConfirmDeceased) return;

    try {
      setDeceasedLoading(true);
      await deceasedAPI.delete(deleteConfirmDeceased._id);

      toast.success("Deceased record deleted successfully");

      // Refresh deceased records
      fetchDeceasedRecords();
      fetchStats();

      // Close confirmation
      setDeleteConfirmDeceased(null);
    } catch (error) {
      console.error("Error deleting deceased record:", error);
      toast.error(error.response?.data?.error || "Failed to delete record");
    } finally {
      setDeceasedLoading(false);
    }
  };

  // Handle view family
  const handleViewFamily = (family) => {
    console.log("Viewing family:", family);
    debugFamilyData(family);
    setSelectedFamily(family);
    setIsEditing(false);
    setIsViewMode(true);
    setShowFamilyForm(true);
  };

  // Handle edit family
  const handleEditFamily = (family) => {
    console.log("Editing family:", family);
    debugFamilyData(family);
    setSelectedFamily(family);
    setIsEditing(true);
    setIsViewMode(false);
    setShowFamilyForm(true);
  };

  // Handle adding new family
  const handleAddNewFamily = () => {
    setSelectedFamily(null);
    setIsEditing(false);
    setIsViewMode(false);
    setShowFamilyForm(true);
  };

  const handleExportData = async (exportType, filters, fileName) => {
    try {
      setExporting(true);

      let result;
      if (exportType === "families") {
        // Fetch all families for export
        const response = await familiesAPI.getAll({ limit: 10000 });
        const allFamilies = response.data.families || [];

        // Note: filters object now only has area and locality (no city)
        result = exportFamiliesToExcel(allFamilies, filters, fileName);
      } else {
        // Fetch all deceased records for export
        const response = await deceasedAPI.getAll({ limit: 10000 });
        const allDeceased = response.data.deceased || [];
        result = exportDeceasedToExcel(allDeceased, filters, fileName);
      }

      if (result.success) {
        toast.success(result.message);
        setShowExportModal(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Add this function in Dashboard.jsx for debugging
  const debugFamilyData = (family) => {
    console.log("=== FAMILY DEBUG INFO ===");
    console.log("Family ID:", family._id);
    console.log("Serial Number:", family.serialNumber);
    console.log("FormFiller MemberNo:", family.formFiller?.memberNo);
    console.log("Has members array?", Array.isArray(family.members));
    console.log("Number of members:", family.members?.length || 0);
    console.log("Members data:", family.members);
    console.log("Head of Family:", family.headOfFamily);
    console.log("=========================");
  };

  const handleFamilyFormClose = () => {
    setShowFamilyForm(false);
    setSelectedFamily(null);
    setIsEditing(false);
    setIsViewMode(false);
  };

  return (
    <div className="space-y-8 px-8 py-6">
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportData}
        families={families}
        deceasedRecords={deceasedRecords}
        loading={exporting}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmDeceased && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Heart className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Delete
                </h3>
              </div>
              <button
                onClick={() => setDeleteConfirmDeceased(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this deceased record?
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {deleteConfirmDeceased.fullName}
                  </div>
                  <div className="text-gray-600 mt-1">
                    Date of Death:{" "}
                    {deleteConfirmDeceased.dateOfDeath
                      ? new Date(
                          deleteConfirmDeceased.dateOfDeath,
                        ).toLocaleDateString("en-IN")
                      : "N/A"}
                  </div>
                  <div className="text-gray-600">
                    Age: {deleteConfirmDeceased.ageAtDeath || "N/A"} years
                  </div>
                </div>
              </div>
              <p className="text-sm text-red-600 mt-4 font-medium">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setDeleteConfirmDeceased(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteDeceased}
                disabled={deceasedLoading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {deceasedLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Record
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Family Confirmation Modal */}
      {deleteConfirmFamily && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-xl font-bold text-gray-900">
                  Confirm Delete Family
                </h3>
              </div>
              <button
                onClick={() => setDeleteConfirmFamily(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this family and all its members?
              </p>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {deleteConfirmFamily.headOfFamily?.fullName || "N/A"}
                  </div>
                  <div className="text-gray-600 mt-1">
                    Family ID:{" "}
                    {deleteConfirmFamily.familyId ||
                      deleteConfirmFamily.serialNumber}
                  </div>
                  <div className="text-gray-600">
                    Members: {deleteConfirmFamily.members?.length || 0}
                  </div>
                  <div className="text-gray-600">
                    Area:{" "}
                    {deleteConfirmFamily.correspondenceAddress?.area ||
                      deleteConfirmFamily.homeAddress?.area ||
                      "N/A"}
                  </div>
                </div>
              </div>
              <p className="text-sm text-red-600 mt-4 font-medium">
                ⚠️ This will delete the family and all associated members. This
                action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => setDeleteConfirmFamily(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteFamily}
                disabled={deletingFamily}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {deletingFamily ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Family
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Family Form Modal - UPDATED */}
      {showFamilyForm && (
        <FamilyForm
          onClose={handleFamilyFormClose}
          onSuccess={handleFamilyFormSuccess}
          familyData={selectedFamily}
          isEditing={isEditing}
          isViewMode={isViewMode}
        />
      )}
      {/* Deceased Form Modal */}
      {showDeceasedForm && (
        <DeceasedForm
          onClose={() => {
            setShowDeceasedForm(false);
            setSelectedDeceased(null);
            setIsEditingDeceased(false);
            setIsViewModeDeceased(false);
          }}
          onSuccess={handleDeceasedAdded}
          deceasedData={selectedDeceased}
          isEditing={isEditingDeceased}
          isViewMode={isViewModeDeceased}
        />
      )}
      {/* Community Logo Banner */}
      <div className="bg-white shadow-md mx-auto mx-w-7xl rounded-xl p-8 overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left Side - God's Photo */}
          <div className="lg:w-2/5 mb-8 lg:mb-0 lg:pr-8">
            <div className="bg-white">
              <div className="text-center">
                <div className="w-60 h-72 mx-auto overflow-hidden border-4 border-amber-300 shadow-xl mb-4">
                  {/* Replace with your actual God's photo import */}
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <img
                      src={LordPhoto}
                      alt="God's Blessing"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">
                  श्री धान्धार पंचाल सेवा समाज
                </h3>
              </div>
            </div>
          </div>

          {/* Right Side - Existing Content */}
          <div className="lg:w-3/5">
            <div className="text-center">
              {/* Existing Community Logo */}
              <img
                src={CommunityLogo}
                alt="Community Logo"
                className="h-20 w-full object-contain mb-4"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
              <div class="text-center">
                <h1 class="text-2xl font-bold text-gray-800">શ્રી ધાન્ધાર પંચાલ સેવા સમાજ, વરોદરા</h1>
                <p class="text-gray-600 mt-2">Community Family Records System</p>
              </div>
            `;
                }}
              />

              {/* Dashboard Title Section */}
              <div className="text-center mt-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Welcome to Community Family Records Portal
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <button
                  className="btn-primary bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center transform hover:-translate-y-1"
                  onClick={handleAddNewFamily}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Family
                </button>
                <button
                  className="btn-secondary bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center transform hover:-translate-y-1"
                  onClick={() => setShowDeceasedForm(true)}
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Add Deceased
                </button>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to logout?")) {
                      localStorage.removeItem("token");
                      localStorage.removeItem("user");
                      window.location.href = "/login";
                    }
                  }}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center transform hover:-translate-y-1"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Logout
                </button>

                <button
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center transform hover:-translate-y-1"
                  onClick={() => setShowExportModal(true)}
                >
                  <Download className="mr-2 h-5 w-5" />
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden shadow-lg rounded-xl border border-blue-200 transform transition-transform hover:scale-105 duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-700 truncate">
                    Total Families
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.totalFamilies}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 overflow-hidden shadow-lg rounded-xl border border-green-200 transform transition-transform hover:scale-105 duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserPlus className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-green-700 truncate">
                    Total Members
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.totalMembers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden shadow-lg rounded-xl border border-amber-200 transform transition-transform hover:scale-105 duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Home className="h-8 w-8 text-amber-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-amber-700 truncate">
                    Areas Covered
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.areasCovered}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 overflow-hidden shadow-lg rounded-xl border border-red-200 transform transition-transform hover:scale-105 duration-300">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-red-700 truncate">
                    Deceased
                  </dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.deceased}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Search Bar */}
      <div className="bg-white shadow-xl rounded-xl p-5 border border-gray-200">
        <form
          onSubmit={handleSearch}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="flex-grow">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                className="block w-full pl-10 pr-3 py-3 border-2 border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors duration-300"
                placeholder="Search families by name, area, mobile, Aadhar..."
                value={searchTerm}
                onChange={handleSearchChange} // Changed from (e) => setSearchTerm(e.target.value)
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    fetchFamilies();
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg
                    className="h-5 w-5 text-gray-400 hover:text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="btn-primary bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </button>
            <button
              type="button"
              onClick={fetchFamilies}
              className="btn-secondary bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Family Records Table Header with improved export */}
      {/* Family List Table - FIXED SECTION */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Family Records
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                List of all registered families in the community
                {searchTerm && (
                  <span className="text-blue-600 font-medium">
                    {" "}
                    - Showing results for "{searchTerm}"
                  </span>
                )}
              </p>
            </div>
            {/* <div className="mt-3 sm:mt-0 flex items-center space-x-3">
              <select className="form-input text-sm border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-colors duration-300">
                <option>Sort by: Recently Added</option>
                <option>Sort by: Name (A-Z)</option>
                <option>Sort by: Family ID</option>
                <option>Sort by: Area</option>
              </select>
              <button
                onClick={async () => {
                  try {
                    toast.loading("Exporting families...");
                    if (searchTerm) {
                      const result = exportFamiliesToExcel(
                        families,
                        { search: searchTerm },
                        `families_search_${searchTerm}`,
                      );
                      toast.dismiss();
                      toast.success(`Exported ${result.count} families!`);
                    } else {
                      const response = await familiesAPI.getAll({
                        limit: 10000,
                      });
                      const result = exportFamiliesToExcel(
                        response.data.families || [],
                        {},
                        "all_families",
                      );
                      toast.dismiss();
                      toast.success(result.message);
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error("Failed to export families");
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div> */}
          </div>
        </div>

        {/* Make sure this div is not hidden */}
        <div className="border-t border-gray-200">
          {loading ? (
            <div className="px-6 py-16 text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <p className="mt-6 text-gray-500 text-lg font-medium">
                Loading families...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Family ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Head of Family
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      City [Area]
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Added Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {families.length > 0 ? (
                    families.map((family) => (
                      <tr
                        key={family._id}
                        className="hover:bg-blue-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {family.formFiller?.memberNo ||
                              family.serialNumber ||
                              "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            Family ID:{" "}
                            {family.familyId ||
                              `FAM-${String(family.serialNumber).padStart(3, "0")}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">
                                {family.headOfFamily?.fullName || "N/A"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {family.headOfFamily?.occupation || ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {family.contact?.mobile || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {family.contact?.email || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                            {family.correspondenceAddress?.area ||
                              family.homeAddress?.area ||
                              "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                          {new Date(family.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewFamily(family)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditFamily(family)}
                              className="inline-flex items-center px-3 py-1.5 border-2 border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-blue-500 shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Edit
                            </button>
                            {/* Add Delete Button */}
                            <button
                              onClick={() => handleDeleteFamily(family)}
                              className="inline-flex items-center px-3 py-1.5 border-2 border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 hover:border-red-500 shadow-md hover:shadow-lg transition-all duration-300"
                              title="Delete Family"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
                          <Users className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="mt-6 text-lg font-bold text-gray-900">
                          No families found
                        </h3>
                        <p className="mt-2 text-gray-500">
                          {searchTerm
                            ? "No families match your search. Try a different search term or"
                            : "Get started by adding your first family"}
                        </p>
                        <div className="mt-6">
                          <button
                            className="btn-primary bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
                            onClick={handleAddNewFamily}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Family
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Deceased Records Table */}
      <div className="bg-white shadow-xl rounded-xl overflow-hidden border border-gray-200 mt-8">
        <div className="px-6 py-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Deceased Records ({stats.deceased})
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                List of all deceased community members
              </p>
            </div>
            {/* FIX: Add flex container for buttons */}
            <div className="mt-3 sm:mt-0 flex items-center space-x-3">
              <button
                className="btn-secondary bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 px-5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center transform hover:-translate-y-0.5"
                onClick={() => setShowDeceasedForm(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Deceased
              </button>
              <button
                onClick={async () => {
                  try {
                    toast.loading("Exporting deceased records...");
                    const response = await deceasedAPI.getAll({ limit: 10000 });
                    const result = exportDeceasedToExcel(
                      response.data.deceased || [],
                    );
                    if (result.success) {
                      toast.dismiss();
                      toast.success(result.message);
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error("Failed to export deceased records");
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          {deceasedLoading ? (
            <div className="px-6 py-10 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-red-600 border-t-transparent mx-auto"></div>
              <p className="mt-4 text-gray-500 text-sm">
                Loading deceased records...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-linear-to-r from-red-50 to-red-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date of Death
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Gujarati Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Age at Death
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Gender
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Village/City/Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cause of Death
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deceasedRecords.length > 0 ? (
                    deceasedRecords.map((record) => (
                      <tr
                        key={record._id}
                        className="hover:bg-red-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">
                            {record.fullName || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.relationToHead || ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.dateOfDeath
                            ? new Date(record.dateOfDeath).toLocaleDateString(
                                "en-IN",
                              )
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-gujarati">
                          {record.dateOfDeathGujarati || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {record.ageAtDeath
                              ? `${record.ageAtDeath} years`
                              : "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.gender || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {[record.village, record.city, record.area]
                            .filter(Boolean)
                            .join(", ") || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.causeOfDeath || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDeceased(record)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all duration-300"
                              title="View Record"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditDeceased(record)}
                              className="inline-flex items-center px-3 py-1.5 border-2 border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-red-500 shadow-md hover:shadow-lg transition-all duration-300"
                              title="Edit Record"
                            >
                              <Edit className="h-3.5 w-3.5 mr-1.5" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteDeceased(record)}
                              className="inline-flex items-center px-3 py-1.5 border-2 border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 hover:border-red-500 shadow-md hover:shadow-lg transition-all duration-300"
                              title="Delete Record"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center">
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                          <Heart className="h-10 w-10 text-red-400" />
                        </div>
                        <h3 className="mt-6 text-lg font-bold text-gray-900">
                          No deceased records found
                        </h3>
                        <p className="mt-2 text-gray-500">
                          Add deceased records to keep track of departed
                          community members
                        </p>
                        <div className="mt-6">
                          <button
                            className="btn-secondary bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-2.5 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center mx-auto"
                            onClick={() => setShowDeceasedForm(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add First Deceased Record
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

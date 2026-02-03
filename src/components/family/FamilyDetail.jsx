// src/components/family/FamilyDetail.jsx
import { useState, useEffect } from "react";
import {
  X,
  Users,
  Home,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
} from "lucide-react";
import { familiesAPI } from "../../services/api";

const FamilyDetail = ({ familyId, onClose, onEdit }) => {
  const [family, setFamily] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (familyId) {
      fetchFamilyDetails();
    }
  }, [familyId]);

  // Helper function to format date as DD-MM-YYYY
  const formatDateDMY = (dateString) => {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If it's already in DD-MM-YYYY format, return as is
        if (typeof dateString === "string" && dateString.includes("-")) {
          return dateString;
        }
        return "-";
      }

      // Format as DD-MM-YYYY
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const fetchFamilyDetails = async () => {
    try {
      setLoading(true);
      const response = await familiesAPI.getById(familyId);
      setFamily(response.data.family);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error("Error fetching family details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!familyId) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!family) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">
              Family not found
            </h3>
            <button onClick={onClose} className="mt-4 btn-secondary">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white mb-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {family.headOfFamily?.fullName}'s Family
            </h2>
            <p className="text-sm text-gray-600">
              Member No.: {family.serialNumber}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Family Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Family Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Family Type</p>
                  <p className="font-medium">{family.familyType}</p>
                </div>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Native Place</p>
                  <p className="font-medium">
                    {family.nativePlace || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Years in Current City</p>
                  <p className="font-medium">
                    {family.yearsInCity || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Mobile</p>
                  <p className="font-medium">
                    {family.contact?.mobile || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Alternate Mobile</p>
                  <p className="font-medium">
                    {family.contact?.alternateMobile || "Not specified"}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {family.contact?.email || "Not specified"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Home Address
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Street:</span>{" "}
                {family.homeAddress?.street || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Area:</span>{" "}
                {family.homeAddress?.area || "Not specified"}
              </p>
              <p>
                <span className="font-medium">City:</span>{" "}
                {family.homeAddress?.city || "Not specified"}
              </p>
              <p>
                <span className="font-medium">State:</span>{" "}
                {family.homeAddress?.state || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Pincode:</span>{" "}
                {family.homeAddress?.pincode || "Not specified"}
              </p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Correspondence Address
            </h3>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Street:</span>{" "}
                {family.correspondenceAddress?.street || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Postal Address:</span>{" "}
                {family.correspondenceAddress?.landmark ||
                  family.correspondenceAddress?.postOffice ||
                  "Not specified"}
              </p>
              <p>
                <span className="font-medium">City:</span>{" "}
                {family.correspondenceAddress?.city || "Not specified"}
              </p>
              <p>
                <span className="font-medium">State:</span>{" "}
                {family.correspondenceAddress?.state || "Not specified"}
              </p>
              <p>
                <span className="font-medium">Pincode:</span>{" "}
                {family.correspondenceAddress?.pincode || "Not specified"}
              </p>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Family Members ({members.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aadhar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Education
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Occupation
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member._id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {member.fullName}
                      </div>
                      {member.isHead && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
                          Head
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.relationToHead}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.dateOfBirth
                        ? formatDateDMY(member.dateOfBirth)
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.gender || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.aadharNumber || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.education || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {member.occupation || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FamilyDetail;

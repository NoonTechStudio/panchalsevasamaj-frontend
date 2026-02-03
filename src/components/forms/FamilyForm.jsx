// src/components/forms/FamilyForm.jsx
import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Save, Printer, Download } from "lucide-react";
import { familiesAPI } from "../../services/api";
import toast from "react-hot-toast";
import FamilyExportModal from "../export/FamilyExportModal";
import {
  RELATIONS,
  MARITAL_STATUS,
  EDUCATION_LEVELS,
  BLOOD_GROUPS,
  GENDER_OPTIONS,
  OCCUPATIONS,
} from "../../utils/constants";
import {
  validateFamilyForm,
  validateAadhar,
  validateMobile,
} from "../../utils/validation";

// FIXED: Moved outside the main component to prevent re-creation on every render
const UnderlinedInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  type = "text",
  disabled = false,
  showBorder = true,
  ...props
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className={`w-full px-2 py-1 bg-transparent text-sm ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${showBorder ? "border-0 border-b border-dashed border-gray-400 focus:border-solid focus:border-blue-500 focus:ring-0" : "border-0"} ${className}`}
    placeholder={placeholder}
    disabled={disabled}
    {...props}
  />
);

// Helper function to format date as DD-MM-YYYY
const formatDateDMY = (dateString) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      // If it's already in DD-MM-YYYY format, return as is
      if (typeof dateString === "string" && dateString.includes("-")) {
        // Check if it's already in DD-MM-YYYY format
        const parts = dateString.split("-");
        if (
          parts.length === 3 &&
          parts[0].length <= 2 &&
          parts[1].length <= 2
        ) {
          return dateString;
        }
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

const UnderlinedTextarea = ({
  value,
  onChange,
  placeholder = "",
  rows = 1,
  className = "",
  disabled = false,
  showBorder = true,
}) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={rows}
    className={`w-full px-2 py-1 bg-transparent resize-none text-sm ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${showBorder ? "border-0 border-b border-dashed border-gray-400 focus:border-solid focus:border-blue-500 focus:ring-0" : "border-0"} ${className}`}
    placeholder={placeholder}
    disabled={disabled}
  />
);

// Helper function to calculate age from date of birth
const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return "";

  try {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  } catch (error) {
    console.error("Error calculating age:", error);
    return "";
  }
};

// Update the transformFamilyToForm function in FamilyForm.jsx:
const transformFamilyToForm = (family) => {
  console.log("DEBUG: Transforming family data:", family);

  // Use the members that come from backend
  const allFamilyMembers = family.members || [];

  // Find head member
  const headMember =
    allFamilyMembers.find(
      (member) => member.isHead === true || member.relationToHead === "Self",
    ) || {};

  console.log("DEBUG: Head member found:", headMember);
  console.log(
    "DEBUG: Checking gender fields in members:",
    allFamilyMembers.map((m) => ({ name: m.fullName, gender: m.gender })),
  );

  const formData = {
    formSrNo: family.serialNumber || "",
    formFillerName: family.formFiller?.name || "",
    formFillerSignature: family.formFiller?.signature || "",
    formFillerDate:
      family.formFiller?.date || new Date().toISOString().split("T")[0],

    headOfFamily: {
      srNo: family.formFiller?.memberNo || family.serialNumber || "",
      fullName: headMember.fullName || family.headOfFamily?.fullName || "",
      address: family.homeAddress?.street || "",
      city: family.homeAddress?.city || "",
      pincode: family.homeAddress?.pincode || "",
      phoneNo: family.contact?.emergencyContact || "",
      mobileNo: family.contact?.mobile || headMember.mobileNumber || "",
      officeAddress: family.headOfFamily?.officeAddress?.street || "",
      officePhoneNo: "",
      officeMobileNo: family.contact?.alternateMobile || "",
      aadharNumber:
        headMember.aadharNumber || family.headOfFamily?.aadharNumber || "",
      panNumber: headMember.panNumber || family.headOfFamily?.panNumber || "",
      occupation:
        headMember.occupation || family.headOfFamily?.occupation || "",
    },

    correspondenceAddress: {
      branch:
        family.correspondenceAddress?.area || family.homeAddress?.area || "",
      village: "",
      postOffice: "", // Initialize Postal Address
      taluka: "",
      district: family.correspondenceAddress?.city || "",
      pincode: family.correspondenceAddress?.pincode || "",
      phoneNo: "",
      email: family.contact?.email || "",
    },

    // Use members from backend response - FIXED to preserve all data
    familyMembers:
      allFamilyMembers.length > 0
        ? allFamilyMembers.map((member, index) => ({
            serialNo: String(member.serialNumber || index + 1),
            fullName: member.fullName || "",
            relation:
              member.relationToHead ||
              (member.isHead ? "Self" : index === 0 ? "Self" : "Spouse"),
            nativePlace: member.nativePlace || family.nativePlace || "",
            dateOfBirth: member.dateOfBirth
              ? typeof member.dateOfBirth === "string"
                ? member.dateOfBirth.includes("T")
                  ? member.dateOfBirth.split("T")[0]
                  : member.dateOfBirth
                : new Date(member.dateOfBirth).toISOString().split("T")[0]
              : "",
            age: member.age || calculateAge(member.dateOfBirth) || "",
            gender: member.gender || "Male",
            maritalStatus: member.maritalStatus || "Single",
            education: member.education || "",
            occupation: member.occupation || "",
            businessActivity:
              member.businessActivity || member.occupation || "",
            memberNo: member.memberNo || "",
            bloodGroup: member.bloodGroup || "",
            mobileNumber: member.mobileNumber || "",
            aadharNumber: member.aadharNumber || "",
            panNumber: member.panNumber || "",
            remarks: member.remarks || "",
          }))
        : [
            // Default empty member
            {
              serialNo: "1",
              fullName: family.headOfFamily?.fullName || "",
              relation: "Self",
              nativePlace: family.nativePlace || "",
              dateOfBirth: "",
              age: "",
              gender: "Male",
              maritalStatus: "Single",
              education: "",
              occupation: family.headOfFamily?.occupation || "",
              businessActivity: "",
              memberNo: family.formFiller?.memberNo || "",
              bloodGroup: "",
              mobileNumber: family.contact?.mobile || "",
              aadharNumber: family.headOfFamily?.aadharNumber || "",
              panNumber: family.headOfFamily?.panNumber || "",
              remarks: "",
            },
          ],
  };

  console.log("DEBUG: Transformed form data:", formData);
  return formData;
};
// Transform Family ends here

const FamilyForm = ({
  onClose,
  onSuccess,
  familyData = null,
  isEditing = false,
  isViewMode = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Initialize formData with useEffect to properly handle familyData changes
  const [formData, setFormData] = useState({
    formSrNo: "",
    formFillerName: "",
    formFillerSignature: "",
    formFillerDate: new Date().toISOString().split("T")[0],

    headOfFamily: {
      srNo: "",
      fullName: "",
      address: "",
      city: "",
      pincode: "",
      phoneNo: "",
      mobileNo: "",
      officeAddress: "",
      officePhoneNo: "",
      officeMobileNo: "",
      aadharNumber: "",
      panNumber: "",
      occupation: "",
    },

    correspondenceAddress: {
      branch: "",
      village: "",
      postOffice: "",
      taluka: "",
      district: "",
      pincode: "",
      phoneNo: "",
      email: "",
    },

    familyMembers: [
      {
        serialNo: 1,
        fullName: "",
        relation: "Self",
        nativePlace: "",
        dateOfBirth: "",
        age: "",
        gender: "Male",
        maritalStatus: "Single",
        education: "",
        occupation: "",
        businessActivity: "",
        memberNo: "",
        bloodGroup: "",
        mobileNumber: "",
        aadharNumber: "",
        panNumber: "",
        remarks: "",
      },
    ],
  });

  // Use useEffect to properly transform familyData when it's provided
  useEffect(() => {
    if (familyData && Object.keys(familyData).length > 0) {
      console.log("Family data received in form:", familyData);
      const transformedData = transformFamilyToForm(familyData);
      console.log("Setting transformed data:", transformedData);
      setFormData(transformedData);
    }
  }, [familyData]);

  // Update title based on mode
  const getTitle = () => {
    if (isViewMode) return "View Family Details";
    if (isEditing) return "Edit Family Details";
    return "Family Registration Form";
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...formData.familyMembers];
    updatedMembers[index][field] = value;

    if (field === "dateOfBirth" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      updatedMembers[index].age = age.toString();
    }

    setFormData((prev) => ({
      ...prev,
      familyMembers: updatedMembers,
    }));
  };

  const addFamilyMember = () => {
    const newMember = {
      serialNo: formData.familyMembers.length + 1,
      fullName: "",
      relation: "Spouse",
      nativePlace: "",
      dateOfBirth: "",
      age: "",
      gender: "Male",
      maritalStatus: "Single",
      education: "",
      occupation: "",
      businessActivity: "",
      memberNo: "",
      bloodGroup: "",
      mobileNumber: "",
      aadharNumber: "",
      panNumber: "",
      remarks: "",
    };

    setFormData((prev) => ({
      ...prev,
      familyMembers: [...prev.familyMembers, newMember],
    }));
  };

  const removeFamilyMember = (index) => {
    if (formData.familyMembers.length > 1) {
      const updatedMembers = formData.familyMembers.filter(
        (_, i) => i !== index,
      );
      updatedMembers.forEach((member, idx) => {
        member.serialNo = idx + 1;
      });

      setFormData((prev) => ({
        ...prev,
        familyMembers: updatedMembers,
      }));
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.headOfFamily.fullName) {
        toast.error("Head of family name is required");
        setLoading(false);
        return;
      }

      if (!formData.headOfFamily.mobileNo) {
        toast.error("Mobile number is required");
        setLoading(false);
        return;
      }

      if (
        formData.headOfFamily.mobileNo &&
        !validateMobile(formData.headOfFamily.mobileNo)
      ) {
        toast.error("Mobile number must be 10 digits");
        setLoading(false);
        return;
      }

      // TRANSFORM DATA TO MATCH BACKEND SCHEMA - UPDATED
      const transformedData = {
        // Serial number for family - use the entered number
        serialNumber:
          formData.headOfFamily.srNo ||
          formData.formSrNo ||
          familyData?.serialNumber,

        // Head of Family
        headOfFamily: {
          fullName: formData.headOfFamily.fullName,
          aadharNumber: formData.headOfFamily.aadharNumber || "",
          panNumber: formData.headOfFamily.panNumber || "",
          occupation: formData.headOfFamily.occupation || "",
          officeAddress: {
            street: formData.headOfFamily.officeAddress || "",
            city: formData.headOfFamily.city || "",
            pincode: formData.headOfFamily.pincode || "",
          },
          srNo: formData.headOfFamily.srNo || formData.formSrNo,
        },

        // Home Address
        homeAddress: {
          street: formData.headOfFamily.address || "",
          city: formData.headOfFamily.city || "",
          pincode: formData.headOfFamily.pincode || "",
          area: formData.correspondenceAddress.branch || "",
          state: "",
          landmark: "",
        },

        // Correspondence Address
        correspondenceAddress: {
          street: formData.headOfFamily.address || "",
          area: formData.correspondenceAddress.branch || "",
          city: formData.correspondenceAddress.district || "",
          state: "",
          pincode: formData.correspondenceAddress.pincode || "",
          landmark: formData.correspondenceAddress.postOffice || "",
        },

        // Contact information
        contact: {
          mobile: formData.headOfFamily.mobileNo || "",
          alternateMobile: formData.headOfFamily.officeMobileNo || "",
          email: formData.correspondenceAddress.email || "",
          emergencyContact: formData.headOfFamily.phoneNo || "",
        },

        // Family information - use from first member
        nativePlace: formData.familyMembers[0]?.nativePlace || "",
        currentCity: formData.headOfFamily.city || "",

        // Family type
        familyType: "Nuclear",

        // Family members - transform properly
        familyMembers: formData.familyMembers
          .filter((member) => member.fullName.trim() !== "")
          .map((member, index) => ({
            serialNo: String(member.serialNo || index + 1),
            fullName: member.fullName,
            relation: member.relation,
            nativePlace: member.nativePlace || "",
            dateOfBirth: member.dateOfBirth || null,
            aadharNumber: member.aadharNumber || "",
            panNumber: member.panNumber || "",
            gender: member.gender,
            maritalStatus: member.maritalStatus,
            education: member.education,
            occupation: member.occupation,
            businessActivity: member.businessActivity || "",
            bloodGroup: member.bloodGroup,
            mobileNumber: member.mobileNumber,
            remarks: member.remarks,
            isHead: member.relation === "Self",
            memberNo: member.memberNo || "",
            isLiving: true,
          })),

        // Form filler information
        formFiller: {
          name: formData.formFillerName,
          signature: formData.formFillerSignature,
          date: formData.formFillerDate,
          memberNo: formData.formSrNo,
        },

        // Meta data
        isActive: true,
      };

      console.log("DEBUG: Data being sent to backend:", transformedData);

      let response;
      if (isEditing && familyData?._id) {
        // Update existing family
        console.log("DEBUG: Calling update API");
        response = await familiesAPI.update(familyData._id, transformedData);
        console.log("DEBUG: Update response:", response);
        toast.success("Family updated successfully!");
      } else {
        // Create new family
        console.log("DEBUG: Calling create API");
        response = await familiesAPI.create(transformedData);
        console.log("DEBUG: Create response:", response);
        toast.success("Family registered successfully!");
      }

      // Check for response errors
      if (response && response.status >= 200 && response.status < 300) {
        console.log("DEBUG: Success response data:", response.data);

        if (onSuccess) {
          onSuccess(response.data.family || response.data);
        }
        onClose();
      } else {
        console.error("DEBUG: API returned error status:", response?.status);
        toast.error(response?.data?.error || "Failed to save family");
      }
    } catch (error) {
      console.error("DEBUG: Submission error details:", error);
      console.error("DEBUG: Error response:", error.response);

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to save family.";

      console.error("DEBUG: Error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  // handleSubmit ends here

  // Helper function to render form controls based on mode
  const renderFormControl = (
    type,
    value,
    onChange,
    placeholder,
    options = [],
    required = false,
    disabled = false,
  ) => {
    if (isViewMode) {
      // Special handling for dates in view mode
      if (type === "date") {
        return (
          <div className="px-2 py-1 min-h-[30px]">
            <span className="text-sm">{formatDateDMY(value) || "N/A"}</span>
          </div>
        );
      }

      return (
        <div className="px-2 py-1 min-h-[30px]">
          <span className="text-sm">{value || "N/A"}</span>
        </div>
      );
    }

    // ✅ ADD THIS BACK: Handle select dropdowns
    if (type === "select") {
      return (
        <select
          className="w-full px-1 py-0.5 border-0 focus:ring-0 focus:outline-none bg-transparent text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (type === "textarea") {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-1 py-0.5 border-0 focus:ring-0 focus:outline-none text-xs resize-none"
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={2}
        />
      );
    }

    return (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-1 py-0.5 border-0 focus:ring-0 focus:outline-none text-xs"
        placeholder={placeholder}
        disabled={disabled}
        required={required}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      {/* Add Export Modal */}
      {showExportModal && (
        <FamilyExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          familyData={familyData}
          formData={formData}
        />
      )}
      <div className="relative top-0 mx-auto p-0 border w-full max-w-screen-2xl shadow-2xl bg-white">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>
            <p className="text-sm text-gray-600">
              Community Family Records System
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-4">
          {/* Form Information */}
          <div className="bg-gray-50 p-3 rounded">
            <h2 className="text-base font-semibold text-gray-800 mb-3">
              Form Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Form Filler's Name
                </label>
                <UnderlinedInput
                  value={formData.formFillerName}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, formFillerName: value }))
                  }
                  placeholder="Enter name"
                  disabled={isViewMode}
                  showBorder={!isViewMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date
                </label>
                <UnderlinedInput
                  type="date"
                  value={formData.formFillerDate}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, formFillerDate: value }))
                  }
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Section 1: Current Address */}
            <div className="bg-white p-4 border border-gray-300 rounded">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-1 border-b border-gray-300">
                Current Address (For Correspondence)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Member No.
                  </label>
                  <UnderlinedInput
                    value={formData.headOfFamily.srNo}
                    onChange={(value) =>
                      handleInputChange("headOfFamily", "srNo", value)
                    }
                    placeholder="Enter SR. No."
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <UnderlinedInput
                    value={formData.headOfFamily.fullName}
                    onChange={(value) =>
                      handleInputChange("headOfFamily", "fullName", value)
                    }
                    placeholder="Enter head of family name"
                    required
                    disabled={isViewMode}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <UnderlinedTextarea
                    value={formData.headOfFamily.address}
                    onChange={(value) =>
                      handleInputChange("headOfFamily", "address", value)
                    }
                    placeholder="Enter complete address"
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <UnderlinedInput
                      value={formData.headOfFamily.city}
                      onChange={(value) =>
                        handleInputChange("headOfFamily", "city", value)
                      }
                      placeholder="Enter city"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <UnderlinedInput
                      value={formData.headOfFamily.pincode}
                      onChange={(value) =>
                        handleInputChange("headOfFamily", "pincode", value)
                      }
                      placeholder="Enter pincode"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Phone No.
                  </label>
                  <UnderlinedInput
                    type="tel"
                    value={formData.headOfFamily.phoneNo}
                    onChange={(value) =>
                      handleInputChange("headOfFamily", "phoneNo", value)
                    }
                    placeholder="Enter phone number"
                    disabled={isViewMode}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mobile No.
                    </label>
                    <UnderlinedInput
                      type="tel"
                      value={formData.headOfFamily.mobileNo}
                      onChange={(value) =>
                        handleInputChange("headOfFamily", "mobileNo", value)
                      }
                      placeholder="Enter mobile number"
                      required
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Office Phone No.
                    </label>
                    <UnderlinedInput
                      type="tel"
                      value={formData.headOfFamily.officePhoneNo}
                      onChange={(value) =>
                        handleInputChange(
                          "headOfFamily",
                          "officePhoneNo",
                          value,
                        )
                      }
                      placeholder="Enter office phone"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Office Address
                  </label>
                  <UnderlinedTextarea
                    value={formData.headOfFamily.officeAddress}
                    onChange={(value) =>
                      handleInputChange("headOfFamily", "officeAddress", value)
                    }
                    placeholder="Enter office address"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
            {/* Section 2: Address for Correspondence */}
            <div className="bg-white p-4 border border-gray-300 rounded">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-1 border-b border-gray-300">
                Address for Correspondence
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Branch
                    </label>
                    <UnderlinedInput
                      value={formData.correspondenceAddress.branch}
                      onChange={(value) =>
                        handleInputChange(
                          "correspondenceAddress",
                          "branch",
                          value,
                        )
                      }
                      placeholder="Enter branch"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Taluka
                    </label>
                    <UnderlinedInput
                      value={formData.correspondenceAddress.taluka}
                      onChange={(value) =>
                        handleInputChange(
                          "correspondenceAddress",
                          "taluka",
                          value,
                        )
                      }
                      placeholder="Enter taluka"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Village
                    </label>
                    <UnderlinedInput
                      value={formData.correspondenceAddress.village}
                      onChange={(value) =>
                        handleInputChange(
                          "correspondenceAddress",
                          "village",
                          value,
                        )
                      }
                      placeholder="Enter village"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      District
                    </label>
                    <UnderlinedInput
                      value={formData.correspondenceAddress.district}
                      onChange={(value) =>
                        handleInputChange(
                          "correspondenceAddress",
                          "district",
                          value,
                        )
                      }
                      placeholder="Enter district"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                {/* UPDATED: Postal Address section - changed from Post Office to Postal Address */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Postal Address
                  </label>
                  <UnderlinedTextarea
                    value={formData.correspondenceAddress.postOffice}
                    onChange={(value) =>
                      handleInputChange(
                        "correspondenceAddress",
                        "postOffice",
                        value,
                      )
                    }
                    placeholder="Enter complete postal address"
                    disabled={isViewMode}
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pincode
                    </label>
                    <UnderlinedInput
                      value={formData.correspondenceAddress.pincode}
                      onChange={(value) =>
                        handleInputChange(
                          "correspondenceAddress",
                          "pincode",
                          value,
                        )
                      }
                      placeholder="Enter pincode"
                      disabled={isViewMode}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Phone No.
                    </label>
                    <UnderlinedInput
                      type="tel"
                      value={formData.correspondenceAddress.phoneNo}
                      onChange={(value) =>
                        handleInputChange(
                          "correspondenceAddress",
                          "phoneNo",
                          value,
                        )
                      }
                      placeholder="Enter phone number"
                      disabled={isViewMode}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <UnderlinedInput
                    type="email"
                    value={formData.correspondenceAddress.email}
                    onChange={(value) =>
                      handleInputChange("correspondenceAddress", "email", value)
                    }
                    placeholder="Enter email address"
                    disabled={isViewMode}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Family Members Table */}
          <div className="bg-white p-4 border border-gray-300 rounded">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">
                Family Members Details
              </h2>
              {!isViewMode && (
                <button
                  type="button"
                  onClick={addFamilyMember}
                  className="inline-flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Member
                </button>
              )}
            </div>

            {/* Table Starts here */}

            <div className="overflow-x-auto border border-gray-300">
              <table
                className="min-w-full divide-y divide-gray-200"
                style={{ minWidth: "1980px" }}
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-2 py-2 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "50px" }}
                    >
                      NO.
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "210px" }}
                    >
                      FAMILY HEAD & MEMBER'S NAME
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "100px" }}
                    >
                      RELATION
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "130px" }}
                    >
                      NATIVE PLACE
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "140px" }}
                    >
                      DOB
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "50px" }}
                    >
                      AGE
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "120px" }}
                    >
                      GENDER
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "150px" }}
                    >
                      MARITAL STATUS
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "160px" }}
                    >
                      EDUCATION
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "190px" }}
                    >
                      BUSINESS ACTIVITY
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "110px" }}
                    >
                      MEMBER NO.
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "130px" }}
                    >
                      BLOOD GROUP
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "130px" }}
                    >
                      MOBILE NUMBER
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "140px" }}
                    >
                      AADHAR NUMBER
                    </th>
                    <th
                      className="px-2 py-2 text-left text-xs font-bold text-gray-700 uppercase border border-gray-300"
                      style={{ width: "130px" }}
                    >
                      PAN NUMBER
                    </th>
                    {!isViewMode && (
                      <th
                        className="px-2 py-2 text-center text-xs font-bold text-gray-700 uppercase border border-gray-300"
                        style={{ width: "80px" }}
                      >
                        ACTIONS
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.familyMembers.map((member, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-1 text-center border border-gray-300">
                        <input
                          type="text"
                          className="w-full px-1 py-0.5 border-0 text-center bg-transparent text-xs"
                          value={member.serialNo}
                          readOnly
                        />
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "text",
                          member.fullName,
                          (value) =>
                            handleMemberChange(index, "fullName", value),
                          "Enter full name",
                          [],
                          true,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "select",
                          member.relation,
                          (value) =>
                            handleMemberChange(index, "relation", value),
                          "",
                          RELATIONS,
                          true,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "text",
                          member.nativePlace,
                          (value) =>
                            handleMemberChange(index, "nativePlace", value),
                          "Enter native place",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "date",
                          member.dateOfBirth,
                          (value) =>
                            handleMemberChange(index, "dateOfBirth", value),
                          "",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        <input
                          type="text"
                          className="w-full px-1 py-0.5 border-0 text-center text-xs"
                          value={member.age}
                          readOnly
                        />
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "select",
                          member.gender,
                          (value) => handleMemberChange(index, "gender", value),
                          "",
                          GENDER_OPTIONS,
                          true,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "select",
                          member.maritalStatus,
                          (value) =>
                            handleMemberChange(index, "maritalStatus", value),
                          "",
                          MARITAL_STATUS,
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "select",
                          member.education,
                          (value) =>
                            handleMemberChange(index, "education", value),
                          "Select Education",
                          EDUCATION_LEVELS,
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "text",
                          member.businessActivity,
                          (value) =>
                            handleMemberChange(
                              index,
                              "businessActivity",
                              value,
                            ),
                          "Business/Activity",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "text",
                          member.memberNo,
                          (value) =>
                            handleMemberChange(index, "memberNo", value),
                          "Assign number",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "select",
                          member.bloodGroup,
                          (value) =>
                            handleMemberChange(index, "bloodGroup", value),
                          "Select",
                          BLOOD_GROUPS,
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "tel",
                          member.mobileNumber,
                          (value) =>
                            handleMemberChange(index, "mobileNumber", value),
                          "10-digit mobile",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "text",
                          member.aadharNumber,
                          (value) =>
                            handleMemberChange(index, "aadharNumber", value),
                          "12-digit Aadhar",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-300">
                        {renderFormControl(
                          "text",
                          member.panNumber,
                          (value) =>
                            handleMemberChange(index, "panNumber", value),
                          "10-digit PAN",
                          [],
                          false,
                          isViewMode,
                        )}
                      </td>
                      {!isViewMode && (
                        <td className="px-2 py-1 text-center border border-gray-300">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => removeFamilyMember(index)}
                              className="p-0.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                              title="Remove member"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Table ends here */}

            <div className="mt-3 text-xs text-gray-500 font-medium">
              Total Members: {formData.familyMembers.length}
            </div>
          </div>

          {/* Form Filler's Section */}
          <div className="bg-gray-50 p-4 border border-gray-300 rounded">
            <h3 className="text-base font-semibold text-gray-800 mb-3">
              Form Filler's Section
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Form Filler's Name
                </label>
                <UnderlinedInput
                  value={formData.formFillerName}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, formFillerName: value }))
                  }
                  className="text-gray-500 text-xs"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Signature (Type name)
                </label>
                <UnderlinedInput
                  value={formData.formFillerSignature}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      formFillerSignature: value,
                    }))
                  }
                  placeholder="Type your name as signature"
                  disabled={isViewMode}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date
                </label>
                <UnderlinedInput
                  type="date"
                  value={formData.formFillerDate}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, formFillerDate: value }))
                  }
                  className="text-gray-500 text-xs"
                  disabled={isViewMode}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
              >
                <X className="h-3 w-3 mr-1" /> {isViewMode ? "Close" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(true)} // Change this
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
              >
                <Printer className="h-3 w-3 mr-1" /> Export/Print
              </button>
            </div>

            <div className="flex space-x-2">
              {!isViewMode && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      toast.success("Draft saved locally");
                      localStorage.setItem(
                        "familyFormDraft",
                        JSON.stringify(formData),
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <Download className="h-3 w-3 mr-1" /> Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow hover:shadow-md flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4 mr-1" />{" "}
                    {loading
                      ? "Saving..."
                      : isEditing
                        ? "Update Family"
                        : "Register Family"}
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
      {/* change till here */}
    </div>
  );
};

export default FamilyForm;

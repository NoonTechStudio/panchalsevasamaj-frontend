// src/components/forms/DeceasedForm.jsx
import { useState, useEffect } from "react";
import {
  X,
  User,
  Calendar,
  MapPin,
  Users,
  Heart,
  FileText,
  Save,
  Printer,
  // REMOVE UnderlinedInput from this import
} from "lucide-react";
import { deceasedAPI } from "../../services/api";
import toast from "react-hot-toast";
import {
  convertToGujaratiDate,
  getGujaratiDateSuggestion,
  GUJARATI_MONTHS,
  TITHIS,
  PAKSHA,
} from "../../utils/gujaratiCalendar";

// KEEP your custom UnderlinedInput and UnderlinedTextarea components
const UnderlinedInput = ({
  value,
  onChange,
  placeholder = "",
  className = "",
  type = "text",
  name,
  required = false,
  readOnly = false,
}) => (
  <div className="relative">
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-2 py-1 bg-transparent border-0 border-b border-dashed border-gray-400 focus:border-solid focus:border-red-500 focus:ring-0 text-sm ${className}`}
      placeholder={placeholder}
      required={required}
      readOnly={readOnly}
    />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
  </div>
);

const UnderlinedTextarea = ({
  value,
  onChange,
  placeholder = "",
  rows = 1,
  name,
  className = "",
}) => (
  <div className="relative">
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`w-full px-2 py-1 bg-transparent border-0 border-b border-dashed border-gray-400 focus:border-solid focus:border-red-500 focus:ring-0 resize-none text-sm ${className}`}
      placeholder={placeholder}
    />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
  </div>
);

const DeceasedForm = ({
  onClose,
  onSuccess,
  deceasedData = null,
  isEditing = false,
  isViewMode = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    dateOfDeath: "",
    dateOfBirthGujarati: "",
    dateOfDeathGujarati: "",
    gender: "Male",
    city: "",
    area: "",
    village: "",
    relationToHead: "",
    familyId: "",
    causeOfDeath: "",
    lastRitesPlace: "",
    remarks: "",
  });

  // Initialize form with deceasedData if provided
  useEffect(() => {
    if (deceasedData && Object.keys(deceasedData).length > 0) {
      setFormData({
        fullName: deceasedData.fullName || "",
        dateOfBirth: deceasedData.dateOfBirth
          ? deceasedData.dateOfBirth.split("T")[0]
          : "",
        dateOfDeath: deceasedData.dateOfDeath
          ? deceasedData.dateOfDeath.split("T")[0]
          : "",
        dateOfBirthGujarati: deceasedData.dateOfBirthGujarati || "",
        dateOfDeathGujarati: deceasedData.dateOfDeathGujarati || "",
        gender: deceasedData.gender || "Male",
        city: deceasedData.city || "",
        area: deceasedData.area || "",
        village: deceasedData.village || "",
        relationToHead: deceasedData.relationToHead || "",
        familyId: deceasedData.familyId || "",
        causeOfDeath: deceasedData.causeOfDeath || "",
        lastRitesPlace: deceasedData.lastRitesPlace || "",
        remarks: deceasedData.remarks || "",
      });
    }
  }, [deceasedData]);

  // Update title based on mode
  const getTitle = () => {
    if (isViewMode) return "View Deceased Record";
    if (isEditing) return "Edit Deceased Record";
    return "Deceased Record Registration";
  };

  // State for manual Gujarati date entry
  const [showManualGujaratiEntry, setShowManualGujaratiEntry] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes to auto-suggest Gujarati date
  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = { ...prev, [name]: value };

      // Auto-suggest Gujarati dates
      if (name === "dateOfBirth" && value) {
        const suggestion = convertToGujaratiDate(value);
        updatedData.dateOfBirthGujarati = suggestion;
      }

      if (name === "dateOfDeath" && value) {
        const suggestion = convertToGujaratiDate(value);
        updatedData.dateOfDeathGujarati = suggestion;
      }

      return updatedData;
    });
  };

  // Manual Gujarati date input handler
  const handleManualGujaratiDateChange = (field, part, value) => {
    setFormData((prev) => {
      const current = prev[field] || "";
      const parts = current.split(" ");

      let newDate = "";
      if (part === "month") {
        newDate =
          `${value} ${parts[1] || ""} ${parts[2] || ""} ${parts[3] || ""}`.trim();
      } else if (part === "paksha") {
        newDate =
          `${parts[0] || ""} ${value} ${parts[2] || ""} ${parts[3] || ""}`.trim();
      } else if (part === "tithi") {
        newDate =
          `${parts[0] || ""} ${parts[1] || ""} ${value} ${parts[3] || ""}`.trim();
      } else if (part === "year") {
        newDate =
          `${parts[0] || ""} ${parts[1] || ""} ${parts[2] || ""} ${value}`.trim();
      }

      return { ...prev, [field]: newDate };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (isEditing && deceasedData?._id) {
        // Update existing record
        response = await deceasedAPI.update(deceasedData._id, formData);
        toast.success("Deceased record updated successfully");
      } else {
        // Create new record
        response = await deceasedAPI.create(formData);
        toast.success("Deceased record added successfully");
      }

      if (onSuccess) {
        onSuccess(response.data.deceased);
      }
      onClose();
    } catch (error) {
      console.error("Error saving deceased record:", error);
      toast.error(error.response?.data?.error || "Failed to save record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-0 border w-full max-w-4xl shadow-2xl bg-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-red-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Deceased Record Registration
              </h2>
              <p className="text-sm text-gray-600">
                Register departed community members
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Personal Information Section */}
          <div className="bg-white p-4 border border-gray-300 rounded">
            <div className="flex items-center mb-4 pb-2 border-b">
              <User className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">
                Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <UnderlinedInput
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  disabled={isViewMode} // Add this
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <div className="relative">
                  <select
                    name="gender"
                    className="w-full px-2 py-1 bg-transparent border-0 border-b border-dashed border-gray-400 focus:border-solid focus:border-red-500 focus:ring-0 text-sm"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={isViewMode} // Add this
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-300"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Date Information Section - UPDATED */}
          <div className="bg-white p-4 border border-gray-300 rounded">
            <div className="flex items-center mb-4 pb-2 border-b">
              <Calendar className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">
                Date Information
              </h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth (Gregorian)
                  </label>
                  <UnderlinedInput
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleDateChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Death (Gregorian) *
                  </label>
                  <UnderlinedInput
                    type="date"
                    name="dateOfDeath"
                    value={formData.dateOfDeath}
                    onChange={handleDateChange}
                    required
                  />
                </div>
              </div>

              {/* Gujarati Dates Section */}
              <div className="bg-yellow-50 p-4 border border-yellow-200 rounded">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-yellow-800">
                    Gujarati Calendar Dates
                  </h4>
                  <button
                    type="button"
                    onClick={() =>
                      setShowManualGujaratiEntry(!showManualGujaratiEntry)
                    }
                    className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                  >
                    {showManualGujaratiEntry
                      ? "Use Auto-suggest"
                      : "Enter Manually"}
                  </button>
                </div>

                {showManualGujaratiEntry ? (
                  // Manual Entry Mode
                  <div className="space-y-4">
                    {/* Date of Birth Gujarati - Manual */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth (Gujarati)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <select
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfBirthGujarati",
                              "month",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">મહિનો</option>
                          {GUJARATI_MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfBirthGujarati",
                              "paksha",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">પક્ષ</option>
                          <option value={PAKSHA.SHUKLA}>{PAKSHA.SHUKLA}</option>
                          <option value={PAKSHA.KRISHNA}>
                            {PAKSHA.KRISHNA}
                          </option>
                        </select>
                        <select
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfBirthGujarati",
                              "tithi",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">તિથિ</option>
                          {TITHIS.map((tithi) => (
                            <option key={tithi} value={tithi}>
                              {tithi}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Year"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfBirthGujarati",
                              "year",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-2">
                        <UnderlinedInput
                          name="dateOfBirthGujarati"
                          value={formData.dateOfBirthGujarati}
                          onChange={handleChange}
                          placeholder="ગુજરાતી તારીખ (માસ પક્ષ તિથિ વર્ષ)"
                          className="font-gujarati"
                        />
                      </div>
                    </div>

                    {/* Date of Death Gujarati - Manual */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Death (Gujarati) *
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        <select
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfDeathGujarati",
                              "month",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">મહિનો</option>
                          {GUJARATI_MONTHS.map((month) => (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          ))}
                        </select>
                        <select
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfDeathGujarati",
                              "paksha",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">પક્ષ</option>
                          <option value={PAKSHA.SHUKLA}>{PAKSHA.SHUKLA}</option>
                          <option value={PAKSHA.KRISHNA}>
                            {PAKSHA.KRISHNA}
                          </option>
                        </select>
                        <select
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfDeathGujarati",
                              "tithi",
                              e.target.value,
                            )
                          }
                        >
                          <option value="">તિથિ</option>
                          {TITHIS.map((tithi) => (
                            <option key={tithi} value={tithi}>
                              {tithi}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Year"
                          onChange={(e) =>
                            handleManualGujaratiDateChange(
                              "dateOfDeathGujarati",
                              "year",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <div className="mt-2">
                        <UnderlinedInput
                          name="dateOfDeathGujarati"
                          value={formData.dateOfDeathGujarati}
                          onChange={handleChange}
                          placeholder="ગુજરાતી તારીખ (માસ પક્ષ તિથિ વર્ષ)"
                          className="font-gujarati"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  // Auto-suggest Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth (Gujarati)
                      </label>
                      <UnderlinedInput
                        name="dateOfBirthGujarati"
                        value={formData.dateOfBirthGujarati}
                        onChange={handleChange}
                        placeholder="ગુજરાતી તારીખ (માસ પક્ષ તિથિ વર્ષ)"
                        className="font-gujarati"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: માસ પક્ષ તિથિ વર્ષ (ઉદા: માગશર સુદ ચોથ २०८१)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Death (Gujarati) *
                      </label>
                      <UnderlinedInput
                        name="dateOfDeathGujarati"
                        value={formData.dateOfDeathGujarati}
                        onChange={handleChange}
                        placeholder="ગુજરાતી તારીખ (માસ પક્ષ તિથિ વર્ષ)"
                        className="font-gujarati"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Format: માસ પક્ષ તિથિ વર્ષ
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-3 text-xs text-yellow-700">
                  <strong>Note:</strong> Auto-suggestion is approximate. For
                  accuracy, please verify with actual Gujarati calendar or enter
                  manually.
                </div>
              </div>
            </div>
          </div>

          {/* Location & Family Information */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            <div className="bg-white p-4 border border-gray-300 rounded">
              <div className="flex items-center mb-4 pb-2 border-b">
                <MapPin className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-800">
                  Location Information
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village
                  </label>
                  <UnderlinedInput
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    placeholder="Enter village"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <UnderlinedInput
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area/Locality
                  </label>
                  <UnderlinedInput
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="Enter area or locality"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Death Details Section */}
          <div className="bg-white p-4 border border-gray-300 rounded">
            <div className="flex items-center mb-4 pb-2 border-b">
              <FileText className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-bold text-gray-800">Death Details</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cause of Death
                </label>
                <UnderlinedInput
                  name="causeOfDeath"
                  value={formData.causeOfDeath}
                  onChange={handleChange}
                  placeholder="Enter cause of death"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Rites Place
                </label>
                <UnderlinedInput
                  name="lastRitesPlace"
                  value={formData.lastRitesPlace}
                  onChange={handleChange}
                  placeholder="Enter last rites place"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <UnderlinedTextarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  placeholder="Additional remarks or notes"
                  rows="2"
                />
              </div>
            </div>
          </div>

          {/* Form Summary */}
          <div className="bg-red-50 p-4 border border-red-200 rounded">
            <h3 className="text-sm font-semibold text-red-800 mb-2">
              Record Summary
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Name:</div>
              <div className="font-medium">
                {formData.fullName || "Not specified"}
              </div>

              <div className="text-gray-600">Date of Death:</div>
              <div className="font-medium">
                {formData.dateOfDeath || "Not specified"}
              </div>

              <div className="text-gray-600">Gujarati Date:</div>
              <div className="font-medium font-gujarati">
                {formData.dateOfDeathGujarati || "Not specified"}
              </div>

              <div className="text-gray-600">Location:</div>
              <div className="font-medium">
                {[formData.village, formData.city, formData.area]
                  .filter(Boolean)
                  .join(", ") || "Not specified"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors flex items-center text-sm"
              >
                <Printer className="h-3 w-3 mr-1" />
                Print
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isViewMode} // Add isViewMode here
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded hover:from-red-700 hover:to-red-800 transition-colors shadow-lg hover:shadow-xl flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-1" />
              {loading
                ? "Saving..."
                : isViewMode
                  ? "View Mode"
                  : isEditing
                    ? "Update Record"
                    : "Save Deceased Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeceasedForm;

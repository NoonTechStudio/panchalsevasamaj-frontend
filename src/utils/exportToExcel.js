// src/utils/exportToExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export families data to Excel with filtering options
 * @param {Array} families - Array of family objects
 * @param {Object} filters - Filter criteria (area, locality, etc.)
 * @param {String} fileName - Name of the exported file
 */
// Update the exportFamiliesToExcel function in src/utils/exportToExcel.js
export const exportFamiliesToExcel = (
  families,
  filters = {},
  fileName = "community_families",
) => {
  try {
    // Apply filters if provided
    let filteredData = families;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter((family) => {
        // Search in multiple fields
        return (
          (family.headOfFamily?.fullName || "")
            .toLowerCase()
            .includes(searchTerm) ||
          (family.formFiller?.memberNo || "")
            .toLowerCase()
            .includes(searchTerm) ||
          (family.contact?.mobile || "").includes(searchTerm) ||
          (family.correspondenceAddress?.area || "")
            .toLowerCase()
            .includes(searchTerm) ||
          (family.homeAddress?.area || "").toLowerCase().includes(searchTerm) ||
          (family.contact?.email || "").toLowerCase().includes(searchTerm) ||
          (family.headOfFamily?.occupation || "")
            .toLowerCase()
            .includes(searchTerm)
        );
      });
    }

    // Apply area filter
    if (filters.area) {
      filteredData = filteredData.filter(
        (family) =>
          family.correspondenceAddress?.area
            ?.toLowerCase()
            .includes(filters.area.toLowerCase()) ||
          family.homeAddress?.area
            ?.toLowerCase()
            .includes(filters.area.toLowerCase()),
      );
    }

    // Apply locality filter
    if (filters.locality) {
      filteredData = filteredData.filter(
        (family) =>
          family.correspondenceAddress?.locality
            ?.toLowerCase()
            .includes(filters.locality.toLowerCase()) ||
          family.homeAddress?.locality
            ?.toLowerCase()
            .includes(filters.locality.toLowerCase()),
      );
    }

    // Apply city filter
    // if (filters.city) {
    //   filteredData = filteredData.filter(
    //     (family) =>
    //       family.correspondenceAddress?.city
    //         ?.toLowerCase()
    //         .includes(filters.city.toLowerCase()) ||
    //       family.homeAddress?.city
    //         ?.toLowerCase()
    //         .includes(filters.city.toLowerCase()),
    //   );
    // }

    // Transform data for Excel
    const excelData = filteredData.map((family, index) => {
      // Flatten family members
      const members = family.members || [];
      const memberDetails = members
        .map(
          (member) =>
            `${member.fullName} (${member.relationToHead || "Member"})`,
        )
        .join("; ");

      return {
        "Sr. No.": index + 1,
        "Family ID":
          family.familyId ||
          `FAM-${String(family.serialNumber).padStart(3, "0")}`,
        "Member No.":
          family.formFiller?.memberNo || family.serialNumber || "N/A",
        "Head of Family": family.headOfFamily?.fullName || "N/A",
        "Head Occupation": family.headOfFamily?.occupation || "",
        "Mobile Number": family.contact?.mobile || "",
        Email: family.contact?.email || "",
        "Home Address": family.homeAddress?.address || "",
        "Home Area": family.homeAddress?.area || "",
        "Home City": family.homeAddress?.city || "",
        "Home Pincode": family.homeAddress?.pincode || "",
        "Correspondence Address": family.correspondenceAddress?.address || "",
        "City (Branch)":
          family.correspondenceAddress?.branch ||
          family.correspondenceAddress?.area ||
          "",
        "Correspondence City": family.correspondenceAddress?.city || "",
        "Correspondence Pincode": family.correspondenceAddress?.pincode || "",
        "Total Members": members.length,
        "Family Members": memberDetails,
        "Added Date": new Date(family.createdAt).toLocaleDateString("en-IN"),
        Notes: family.notes || "",
      };
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 8 }, // Sr. No.
      { wch: 15 }, // Family ID
      { wch: 12 }, // Member No.
      { wch: 25 }, // Head of Family
      { wch: 20 }, // Head Occupation
      { wch: 15 }, // Mobile Number
      { wch: 25 }, // Email
      { wch: 30 }, // Home Address
      { wch: 20 }, // Home Area
      { wch: 15 }, // Home City
      { wch: 10 }, // Home Pincode
      { wch: 30 }, // Correspondence Address
      { wch: 20 }, // City (Branch) - Updated from "Correspondence Area"
      { wch: 15 }, // Correspondence City
      { wch: 10 }, // Correspondence Pincode
      { wch: 12 }, // Total Members
      { wch: 40 }, // Family Members
      { wch: 15 }, // Added Date
      { wch: 30 }, // Notes
    ];
    ws["!cols"] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Family Records");

    // Add metadata sheet
    const metadata = [
      ["Export Information"],
      ["Export Date", new Date().toLocaleString()],
      ["Total Families", filteredData.length],
      [
        "Filters Applied",
        JSON.stringify(
          {
            ...filters,
            // Remove city from the displayed filters
            city: undefined,
          },
          null,
          2,
        ),
      ],
      [""],
      ["Generated by", "Community Portal System"],
    ];
    const wsMeta = XLSX.utils.aoa_to_sheet(metadata);
    XLSX.utils.book_append_sheet(wb, wsMeta, "Export Info");

    // Generate Excel file
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Save file
    saveAs(data, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);

    return {
      success: true,
      message: `Exported ${filteredData.length} families successfully!`,
      count: filteredData.length,
    };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return {
      success: false,
      message: "Failed to export data. Please try again.",
    };
  }
};

/**
 * Export deceased records to Excel
 */
export const exportDeceasedToExcel = (
  deceasedRecords,
  filters = {},
  fileName = "deceased_records",
) => {
  try {
    // Apply filters if provided
    let filteredData = deceasedRecords;

    if (filters.area) {
      filteredData = filteredData.filter(
        (family) =>
          // Check in correspondenceAddress.branch (Branch field)
          family.correspondenceAddress?.branch
            ?.toLowerCase()
            .includes(filters.area.toLowerCase()) ||
          // Fallback to other area fields
          family.correspondenceAddress?.area
            ?.toLowerCase()
            .includes(filters.area.toLowerCase()) ||
          family.homeAddress?.area
            ?.toLowerCase()
            .includes(filters.area.toLowerCase()),
      );
    }

    // Transform data
    const excelData = filteredData.map((record, index) => ({
      "Sr. No.": index + 1,
      Name: record.fullName || "N/A",
      "Date of Death": record.dateOfDeath
        ? new Date(record.dateOfDeath).toLocaleDateString("en-IN")
        : "N/A",
      "Age at Death": record.ageAtDeath ? `${record.ageAtDeath} years` : "N/A",
      Gender: record.gender || "N/A",
      "Relation to Head": record.relationToHead || "",
      "Father/Husband Name": record.fatherOrHusbandName || "",
      City: record.city || "",
      Area: record.area || "",
      Address: record.address || "",
      "Cause of Death": record.causeOfDeath || "",
      "Last Rites Place": record.lastRitesPlace || "",
      "Added Date": new Date(record.createdAt).toLocaleDateString("en-IN"),
      Notes: record.notes || "",
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    ws["!cols"] = [
      { wch: 8 }, // Sr. No.
      { wch: 25 }, // Name
      { wch: 15 }, // Date of Death
      { wch: 12 }, // Age at Death
      { wch: 10 }, // Gender
      { wch: 20 }, // Relation to Head
      { wch: 25 }, // Father/Husband Name
      { wch: 15 }, // City
      { wch: 20 }, // Area
      { wch: 30 }, // Address
      { wch: 25 }, // Cause of Death
      { wch: 25 }, // Last Rites Place
      { wch: 15 }, // Added Date
      { wch: 30 }, // Notes
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Deceased Records");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(data, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);

    return {
      success: true,
      message: `Exported ${filteredData.length} deceased records successfully!`,
      count: filteredData.length,
    };
  } catch (error) {
    console.error("Error exporting deceased records:", error);
    return {
      success: false,
      message: "Failed to export deceased records.",
    };
  }
};

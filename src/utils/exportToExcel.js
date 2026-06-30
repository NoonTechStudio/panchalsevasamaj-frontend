// src/utils/exportToExcel.js
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import i18n from "../i18n.js";
import { tv } from "./translateValue.js";

const t = (key) => i18n.t(key);

export const exportFamiliesToExcel = (
  families,
  filters = {},
  fileName = "community_families",
) => {
  try {
    let filteredData = families;

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredData = filteredData.filter((family) =>
        (family.headOfFamily?.fullName || "").toLowerCase().includes(searchTerm) ||
        (family.formFiller?.memberNo || "").toLowerCase().includes(searchTerm) ||
        (family.contact?.mobile || "").includes(searchTerm) ||
        (family.correspondenceAddress?.area || "").toLowerCase().includes(searchTerm) ||
        (family.homeAddress?.area || "").toLowerCase().includes(searchTerm) ||
        (family.contact?.email || "").toLowerCase().includes(searchTerm) ||
        (family.headOfFamily?.occupation || "").toLowerCase().includes(searchTerm)
      );
    }

    if (filters.area) {
      filteredData = filteredData.filter(
        (family) =>
          family.correspondenceAddress?.area?.toLowerCase().includes(filters.area.toLowerCase()) ||
          family.homeAddress?.area?.toLowerCase().includes(filters.area.toLowerCase())
      );
    }

    if (filters.locality) {
      filteredData = filteredData.filter(
        (family) =>
          family.correspondenceAddress?.locality?.toLowerCase().includes(filters.locality.toLowerCase()) ||
          family.homeAddress?.locality?.toLowerCase().includes(filters.locality.toLowerCase())
      );
    }

    const excelData = filteredData.map((family, index) => {
      const members = family.members || [];
      // Translate relation inside member details
      const memberDetails = members
        .map((member) => `${member.fullName} (${tv(member.relationToHead) || t("values.Other")})`)
        .join("; ");

      return {
        [t("srNo")]: index + 1,
        [t("familyId")]: family.familyId || `FAM-${String(family.serialNumber).padStart(3, "0")}`,
        [t("memberNo")]: family.formFiller?.memberNo || family.serialNumber || "N/A",
        [t("headOfFamily")]: family.headOfFamily?.fullName || "N/A",
        [t("occupation")]: tv(family.headOfFamily?.occupation) || "",
        [t("mobile")]: family.contact?.mobile || "",
        [t("email")]: family.contact?.email || "",
        [t("homeAddress")]: family.homeAddress?.address || "",
        [t("homeArea")]: family.homeAddress?.area || "",
        [t("homeCity")]: family.homeAddress?.city || "",
        [t("homePincode")]: family.homeAddress?.pincode || "",
        [t("correspondenceAddress")]: family.correspondenceAddress?.address || "",
        [t("cityArea")]: family.correspondenceAddress?.branch || family.correspondenceAddress?.area || "",
        [t("correspondenceCity")]: family.correspondenceAddress?.city || "",
        [t("correspondencePincode")]: family.correspondenceAddress?.pincode || "",
        [t("totalMembers")]: members.length,
        [t("familyMembers")]: memberDetails,
        [t("addedDate")]: new Date(family.createdAt).toLocaleDateString("en-IN"),
        [t("notes")]: family.notes || "",
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = [
      { wch: 8 }, { wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 20 },
      { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 },
      { wch: 10 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
      { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, t("familyRecords"));

    const metadata = [
      [t("exportInfo")],
      [t("exportDate"), new Date().toLocaleString()],
      [t("totalFamilies"), filteredData.length],
      [t("generatedBy"), "Community Portal System"],
    ];
    const wsMeta = XLSX.utils.aoa_to_sheet(metadata);
    XLSX.utils.book_append_sheet(wb, wsMeta, t("exportInfoSheet"));

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);

    return { success: true, message: `Exported ${filteredData.length} families successfully!`, count: filteredData.length };
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    return { success: false, message: "Failed to export data. Please try again." };
  }
};

export const exportDeceasedToExcel = (
  deceasedRecords,
  filters = {},
  fileName = "deceased_records",
) => {
  try {
    let filteredData = deceasedRecords;

    if (filters.area) {
      filteredData = filteredData.filter(
        (record) =>
          record.correspondenceAddress?.branch?.toLowerCase().includes(filters.area.toLowerCase()) ||
          record.correspondenceAddress?.area?.toLowerCase().includes(filters.area.toLowerCase()) ||
          record.homeAddress?.area?.toLowerCase().includes(filters.area.toLowerCase())
      );
    }

    const excelData = filteredData.map((record, index) => ({
      [t("srNo")]: index + 1,
      [t("name")]: record.fullName || "N/A",
      [t("dateOfDeath")]: record.dateOfDeath
        ? new Date(record.dateOfDeath).toLocaleDateString("en-IN")
        : "N/A",
      [t("ageAtDeath")]: record.ageAtDeath
        ? `${record.ageAtDeath} ${tv("years")}`
        : "N/A",
      [t("gender")]: tv(record.gender) || "N/A",
      [t("relationToHead")]: tv(record.relationToHead) || "",
      [t("fatherHusbandName")]: record.fatherOrHusbandName || "",
      [t("city")]: record.city || "",
      [t("area")]: record.area || "",
      [t("address")]: record.address || "",
      [t("causeOfDeath")]: record.causeOfDeath || "",
      [t("lastRitesPlace")]: record.lastRitesPlace || "",
      [t("addedDate")]: new Date(record.createdAt).toLocaleDateString("en-IN"),
      [t("notes")]: record.notes || "",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws["!cols"] = [
      { wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 10 },
      { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 30 },
      { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 30 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, t("deceasedRecords"));

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);

    return { success: true, message: `Exported ${filteredData.length} deceased records successfully!`, count: filteredData.length };
  } catch (error) {
    console.error("Error exporting deceased records:", error);
    return { success: false, message: "Failed to export deceased records." };
  }
};

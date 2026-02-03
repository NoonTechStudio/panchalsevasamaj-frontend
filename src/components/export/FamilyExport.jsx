// src/components/export/FamilyExport.jsx
import { useEffect, useRef } from "react";
import * as XLSX from "xlsx";

// Helper function to format date
const formatDateDMY = (dateString) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      if (typeof dateString === "string" && dateString.includes("-")) {
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

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch (error) {
    return "-";
  }
};

// Create Excel workbook with proper formatting
const exportToExcel = (formData, familyData) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // ===== SHEET 1: FAMILY SUMMARY =====
  const summaryData = [
    ["શ્રી ધાન્ધાર પંચાલ સેવા સમાજ, વરોદરા"],
    ["Community Family Records System"],
    ["Family Registration Details"],
    [""],
    ["FAMILY INFORMATION"],
    ["Family ID:", formData.headOfFamily.srNo || formData.formSrNo || "N/A"],
    ["Family Head:", formData.headOfFamily.fullName || "N/A"],
    ["Status:", familyData?.isActive ? "Active" : "Inactive"],
    ["Family Type:", "Nuclear"],
    ["Generated on:", new Date().toLocaleDateString("en-IN")],
    [""],
    ["HEAD OF FAMILY DETAILS"],
    ["Name:", formData.headOfFamily.fullName || "N/A"],
    ["Address:", formData.headOfFamily.address || "N/A"],
    ["City:", formData.headOfFamily.city || "N/A"],
    ["Pincode:", formData.headOfFamily.pincode || "N/A"],
    ["Phone:", formData.headOfFamily.phoneNo || "N/A"],
    ["Mobile:", formData.headOfFamily.mobileNo || "N/A"],
    ["Email:", formData.correspondenceAddress.email || "N/A"],
    ["Aadhar:", formData.headOfFamily.aadharNumber || "N/A"],
    ["PAN:", formData.headOfFamily.panNumber || "N/A"],
    ["Occupation:", formData.headOfFamily.occupation || "N/A"],
    [""],
    ["CORRESPONDENCE ADDRESS"],
    ["Branch/Area:", formData.correspondenceAddress.branch || "N/A"],
    ["Village:", formData.correspondenceAddress.village || "N/A"],
    ["Taluka:", formData.correspondenceAddress.taluka || "N/A"],
    ["District:", formData.correspondenceAddress.district || "N/A"],
    ["Post Office:", formData.correspondenceAddress.postOffice || "N/A"],
    ["Pincode:", formData.correspondenceAddress.pincode || "N/A"],
    ["Phone:", formData.correspondenceAddress.phoneNo || "N/A"],
    ["Office Address:", formData.headOfFamily.officeAddress || "N/A"],
    ["Office Mobile:", formData.headOfFamily.officeMobileNo || "N/A"],
    [""],
    ["FORM FILLER DETAILS"],
    ["Name:", formData.formFillerName || "N/A"],
    ["Signature:", formData.formFillerSignature || "N/A"],
    ["Date:", formatDateDMY(formData.formFillerDate)],
  ];

  const ws_summary = XLSX.utils.aoa_to_sheet(summaryData);

  // Set column widths for summary sheet
  const summaryColWidths = [
    { wch: 25 }, // Column A width
    { wch: 40 }, // Column B width
  ];
  ws_summary["!cols"] = summaryColWidths;

  // Add the summary sheet to workbook
  XLSX.utils.book_append_sheet(wb, ws_summary, "Family Summary");

  // ===== SHEET 2: FAMILY MEMBERS DETAILS =====
  const memberHeaders = [
    "Sr. No.",
    "Family Head & Member's Name",
    "Relation",
    "Native Place",
    "Date of Birth",
    "Age",
    "Gender",
    "Marital Status",
    "Education",
    "Business Activity",
    "Member No.",
    "Blood Group",
    "Mobile Number",
    "Aadhar Number",
    "PAN Number",
  ];

  const memberRows = formData.familyMembers.map((member, index) => [
    index + 1,
    member.fullName + (member.relation === "Self" ? " (Head)" : ""),
    member.relation,
    member.nativePlace || "-",
    formatDateDMY(member.dateOfBirth),
    member.age || calculateAge(member.dateOfBirth) || "",
    member.gender,
    member.maritalStatus,
    member.education || "-",
    member.businessActivity || member.occupation || "-",
    member.memberNo || "-",
    member.bloodGroup || "-",
    member.mobileNumber || "-",
    member.aadharNumber || "-",
    member.panNumber || "-",
  ]);

  const membersData = [memberHeaders, ...memberRows];
  const ws_members = XLSX.utils.aoa_to_sheet(membersData);

  // Set column widths for members sheet
  const memberColWidths = [
    { wch: 8 }, // A: Sr. No.
    { wch: 30 }, // B: Name
    { wch: 12 }, // C: Relation
    { wch: 15 }, // D: Native Place
    { wch: 12 }, // E: DOB
    { wch: 6 }, // F: Age
    { wch: 8 }, // G: Gender
    { wch: 15 }, // H: Marital Status
    { wch: 20 }, // I: Education
    { wch: 20 }, // J: Business Activity
    { wch: 12 }, // K: Member No.
    { wch: 12 }, // L: Blood Group
    { wch: 15 }, // M: Mobile
    { wch: 20 }, // N: Aadhar
    { wch: 15 }, // O: PAN
  ];
  ws_members["!cols"] = memberColWidths;

  // Style the header row
  const headerRange = XLSX.utils.decode_range(ws_members["!ref"]);
  for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws_members[cellAddress]) continue;
    ws_members[cellAddress].s = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F81BD" } },
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Style alternate rows
  for (let R = 1; R <= memberRows.length; ++R) {
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws_members[cellAddress]) continue;

      // Alternate row colors
      if (R % 2 === 0) {
        ws_members[cellAddress].s = {
          fill: { fgColor: { rgb: "E6F2FF" } },
        };
      }

      // Center align numeric and ID columns
      if (C === 0 || C === 5 || C === 6 || C === 10) {
        ws_members[cellAddress].s = {
          ...ws_members[cellAddress].s,
          alignment: { horizontal: "center" },
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, ws_members, "Family Members");

  // ===== SHEET 3: PRINT VIEW (for printing) =====
  const printData = [
    // Header
    ["શ્રી ધાન્ધાર પંચાલ સેવા સમાજ, વરોદરા"],
    ["Community Family Records System"],
    ["Family Registration Details"],
    [""],
    ["FAMILY INFORMATION"],
    ["Family ID:", formData.headOfFamily.srNo || formData.formSrNo || "N/A"],
    ["Family Head:", formData.headOfFamily.fullName || "N/A"],
    ["Status:", familyData?.isActive ? "Active" : "Inactive"],
    ["Family Type:", "Nuclear"],
    ["Generated on:", new Date().toLocaleDateString("en-IN")],
    [""],
    ["FORM INFORMATION"],
    ["Form Filler's Name:", formData.formFillerName || "N/A"],
    ["Date:", formatDateDMY(formData.formFillerDate)],
    [""],
    ["CURRENT ADDRESS (FOR CORRESPONDENCE)"],
    ["Member No.:", formData.headOfFamily.srNo || formData.formSrNo || "N/A"],
    ["Name:", formData.headOfFamily.fullName || "N/A"],
    ["Address:", formData.headOfFamily.address || "N/A"],
    ["City:", formData.headOfFamily.city || "N/A"],
    ["Pincode:", formData.headOfFamily.pincode || "N/A"],
    ["Phone No.:", formData.headOfFamily.phoneNo || "N/A"],
    ["Mobile No.:", formData.headOfFamily.mobileNo || "N/A"],
    ["Office Address:", formData.headOfFamily.officeAddress || "N/A"],
    [""],
    ["ADDRESS FOR CORRESPONDENCE"],
    ["Branch:", formData.correspondenceAddress.branch || "N/A"],
    ["Village:", formData.correspondenceAddress.village || "N/A"],
    ["Postal Address:", formData.correspondenceAddress.postOffice || "N/A"],
    ["Taluka:", formData.correspondenceAddress.taluka || "N/A"],
    ["District:", formData.correspondenceAddress.district || "N/A"],
    ["Pincode:", formData.correspondenceAddress.pincode || "N/A"],
    ["Phone No.:", formData.correspondenceAddress.phoneNo || "N/A"],
    ["Email:", formData.correspondenceAddress.email || "N/A"],
    [""],
    ["FAMILY MEMBERS DETAILS"],
    ...memberRows.map((row) => [
      `• ${row[1]} (${row[2]})`,
      `DOB: ${row[4]}, Age: ${row[5]}, Gender: ${row[6]}, Marital: ${row[7]}, Education: ${row[8]}, Occupation: ${row[9]}, Mobile: ${row[12]}, Aadhar: ${row[13]}, PAN: ${row[14]}`,
    ]),
    [""],
    ["FORM FILLER'S SECTION"],
    ["Form Filler's Name:", formData.formFillerName || "N/A"],
    ["Signature (Type name):", formData.formFillerSignature || "N/A"],
    ["Date:", formatDateDMY(formData.formFillerDate)],
    [""],
    ["ADDITIONAL INFORMATION"],
    ["Total Members:", formData.familyMembers.length],
    ["Native Place:", formData.familyMembers[0]?.nativePlace || "N/A"],
    ["Member No.:", formData.headOfFamily.srNo || formData.formSrNo || "N/A"],
    ["Generated On:", new Date().toLocaleString("en-IN")],
    [""],
    ["This document is computer generated and doesn't require signature."],
    ["For official use only - Community Family Records System"],
  ];

  const ws_print = XLSX.utils.aoa_to_sheet(printData);
  const printColWidths = [
    { wch: 25 }, // Column A width
    { wch: 60 }, // Column B width
  ];
  ws_print["!cols"] = printColWidths;
  XLSX.utils.book_append_sheet(wb, ws_print, "Print View");

  // Generate Excel file
  const fileName = `family_${formData.headOfFamily.srNo || formData.formSrNo || "family"}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// Helper function to calculate age
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
    return "";
  }
};

// Function to print directly
const handlePrint = (formData) => {
  const printWindow = window.open("", "_blank", "width=800,height=600");

  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Family Details - ${formData.headOfFamily.fullName || "Family"}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          line-height: 1.6;
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
        }
        .header h1 { 
          color: #1e40af; 
          margin: 0;
          font-size: 24px;
        }
        .header h2 { 
          color: #374151; 
          margin: 10px 0 0 0;
          font-size: 18px;
        }
        .header h3 { 
          color: #6b7280; 
          margin: 5px 0 0 0;
          font-size: 16px;
        }
        .section { 
          margin-bottom: 25px; 
          page-break-inside: avoid;
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          color: #1e40af;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 20px;
          margin-bottom: 20px;
        }
        .info-card { 
          border: 1px solid #e5e7eb; 
          border-radius: 8px; 
          padding: 15px;
        }
        .info-card h4 { 
          margin: 0 0 15px 0; 
          color: #1e40af; 
          font-size: 16px;
          border-bottom: 1px solid #e5e7eb; 
          padding-bottom: 8px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 15px 0;
          font-size: 12px;
        }
        th, td { 
          border: 1px solid #d1d5db; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f3f4f6; 
          font-weight: bold;
          color: #374151;
        }
        tr:nth-child(even) { 
          background-color: #f9fafb;
        }
        .highlight { 
          background-color: #f8fafc; 
          padding: 15px; 
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .footer { 
          text-align: center; 
          color: #6b7280; 
          font-size: 12px; 
          margin-top: 30px; 
          padding-top: 15px; 
          border-top: 1px solid #e5e7eb;
        }
        @media print {
          body { margin: 0; padding: 10px; }
          .no-print { display: none; }
          .section { page-break-inside: avoid; }
          table { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>શ્રી ધાન્ધાર પંચાલ સેવા સમાજ, વરોદરા</h1>
        <h2>Community Family Records System</h2>
        <h3>Family Registration Details</h3>
      </div>

      <div class="highlight">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="font-size: 16px; color: #1e40af;">
              Family ID: ${formData.headOfFamily.srNo || formData.formSrNo || "N/A"}
            </strong>
            <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">
              Generated on: ${new Date().toLocaleDateString("en-IN")}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; color: #374151;">
              <strong>Status:</strong> ${formData.isActive ? "Active" : "Inactive"}
            </div>
            <div style="font-size: 14px; color: #374151; margin-top: 5px;">
              <strong>Family Type:</strong> Nuclear
            </div>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-card">
          <h4>Head of Family Details</h4>
          <table>
            <tr><td><strong>Name:</strong></td><td>${formData.headOfFamily.fullName || "N/A"}</td></tr>
            <tr><td><strong>Address:</strong></td><td>${formData.headOfFamily.address || "N/A"}</td></tr>
            <tr><td><strong>City:</strong></td><td>${formData.headOfFamily.city || "N/A"}</td></tr>
            <tr><td><strong>Pincode:</strong></td><td>${formData.headOfFamily.pincode || "N/A"}</td></tr>
            <tr><td><strong>Mobile:</strong></td><td>${formData.headOfFamily.mobileNo || "N/A"}</td></tr>
            <tr><td><strong>Email:</strong></td><td>${formData.correspondenceAddress.email || "N/A"}</td></tr>
          </table>
        </div>

        <div class="info-card">
          <h4>Correspondence Details</h4>
          <table>
            <tr><td><strong>Branch/Area:</strong></td><td>${formData.correspondenceAddress.branch || "N/A"}</td></tr>
            <tr><td><strong>District:</strong></td><td>${formData.correspondenceAddress.district || "N/A"}</td></tr>
            <tr><td><strong>Pincode:</strong></td><td>${formData.correspondenceAddress.pincode || "N/A"}</td></tr>
            <tr><td><strong>Phone:</strong></td><td>${formData.correspondenceAddress.phoneNo || "N/A"}</td></tr>
            <tr><td><strong>Office Address:</strong></td><td>${formData.headOfFamily.officeAddress || "N/A"}</td></tr>
          </table>
        </div>
      </div>

      <div class="section">
        <h4 class="section-title">Family Members Details (${formData.familyMembers.length} Members)</h4>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Relation</th>
              <th>Gender</th>
              <th>Date of Birth</th>
              <th>Age</th>
              <th>Marital Status</th>
              <th>Education</th>
              <th>Occupation</th>
              <th>Blood Group</th>
              <th>Mobile</th>
              <th>Aadhar</th>
              <th>PAN</th>
            </tr>
          </thead>
          <tbody>
            ${formData.familyMembers
              .map(
                (member, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td style="font-weight: 500;">${member.fullName}${member.relation === "Self" ? ' <span style="color: #1e40af; font-size: 10px; margin-left: 5px;">(Head)</span>' : ""}</td>
                <td>${member.relation}</td>
                <td>${member.gender}</td>
                <td>${formatDateDMY(member.dateOfBirth)}</td>
                <td style="text-align: center;">${member.age || calculateAge(member.dateOfBirth) || ""}</td>
                <td>${member.maritalStatus}</td>
                <td>${member.education || "-"}</td>
                <td>${member.occupation || member.businessActivity || "-"}</td>
                <td>${member.bloodGroup || "-"}</td>
                <td>${member.mobileNumber || "-"}</td>
                <td style="font-size: 11px;">${member.aadharNumber || "-"}</td>
                <td style="font-size: 11px;">${member.panNumber || "-"}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <div>This document is computer generated and doesn't require signature.</div>
        <div style="margin-top: 5px;">For official use only - Community Family Records System</div>
      </div>
      
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()" style="padding: 10px 20px; background-color: #4F81BD; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Print This Page
        </button>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
};

// Main export component
const FamilyExport = ({ familyData, formData, onClose, mode = "excel" }) => {
  const hasExported = useRef(false);

  // Trigger export when mode changes
  useEffect(() => {
    if (mode && !hasExported.current) {
      hasExported.current = true;

      // Small delay to ensure everything is ready
      setTimeout(() => {
        switch (mode) {
          case "excel":
            exportToExcel(formData, familyData);
            break;
          case "print":
            handlePrint(formData);
            break;
          default:
            break;
        }

        // Close the modal after a short delay
        if (onClose) {
          setTimeout(() => onClose(), 500);
        }
      }, 100);
    }
  }, [mode, onClose, formData, familyData]);

  return null; // This component doesn't render anything visible
};

export default FamilyExport;

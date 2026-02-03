// src/utils/export.js
import { format } from "date-fns";

export const exportFamiliesToCSV = (families) => {
  const headers = [
    "Family ID",
    "Head Name",
    "Mobile",
    "Email",
    "Area",
    "City",
    "Family Type",
    "Total Members",
    "Created Date",
  ];

  const data = families.map((family) => [
    family.familyId,
    family.headOfFamily?.fullName || "",
    family.contact?.mobile || "",
    family.contact?.email || "",
    family.homeAddress?.area || "",
    family.homeAddress?.city || "",
    family.familyType || "",
    family.memberCount || 0,
    format(new Date(family.createdAt), "dd/MM/yyyy"),
  ]);

  const csvContent = [
    headers.join(","),
    ...data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `families_${format(new Date(), "yyyy-MM-dd")}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDeceasedToCSV = (deceasedRecords) => {
  const headers = [
    "Name",
    "Date of Birth",
    "Date of Death",
    "Age",
    "Gender",
    "City",
    "Area",
    "Relation",
    "Cause of Death",
    "Last Rites Place",
  ];

  const data = deceasedRecords.map((record) => [
    record.fullName,
    record.dateOfBirth
      ? format(new Date(record.dateOfBirth), "dd/MM/yyyy")
      : "",
    format(new Date(record.dateOfDeath), "dd/MM/yyyy"),
    record.ageAtDeath || "",
    record.gender,
    record.city || "",
    record.area || "",
    record.relationToHead || "",
    record.causeOfDeath || "",
    record.lastRitesPlace || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...data.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `deceased_${format(new Date(), "yyyy-MM-dd")}.csv`,
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

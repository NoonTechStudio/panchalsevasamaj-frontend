// src/utils/gujaratiCalendar.js

// Gujarati months
export const GUJARATI_MONTHS = [
  "કારતક",
  "માગશર",
  "પોષ",
  "મહા",
  "ફાગણ",
  "ચૈત્ર",
  "વૈશાખ",
  "જેઠ",
  "આષાઢ",
  "શ્રાવણ",
  "ભાદરવો",
  "આસો",
];

// Tithis (lunar days) - 15 in each paksha (shukla/krishna)
export const TITHIS = [
  "પ્રથમા",
  "દ્વિતીયા",
  "તૃતીયા",
  "ચતુર્થી",
  "પંચમી",
  "ષષ્ઠી",
  "સપ્તમી",
  "અષ્ટમી",
  "નવમી",
  "દશમી",
  "એકાદશી",
  "દ્વાદશી",
  "ત્રયોદશી",
  "ચતુર્દશી",
  "પૂર્ણિમા",
];

export const PAKSHA = {
  SHUKLA: "સુદ",
  KRISHNA: "વદ",
};

/**
 * Convert Gregorian date to Gujarati calendar date
 * This is a simplified approximation - for production, use a proper library
 * like `indian-calendar` or connect to an API for accurate conversions
 */
export const convertToGujaratiDate = (gregorianDate) => {
  if (!gregorianDate) return "";

  const date = new Date(gregorianDate);
  const year = date.getFullYear();

  // Simplified conversion: Vikram Samvat = Gregorian year + 57
  // For months before April (month < 4), subtract 1 year
  let vikramYear = year + 57;
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (month < 4) {
    vikramYear = vikramYear - 1;
  }

  // For now, this returns a simplified version
  // In production, you should:
  // 1. Use a proper Indian calendar library, or
  // 2. Connect to an API that converts dates, or
  // 3. Create a comprehensive conversion table

  // Placeholder logic - you need to implement accurate conversion
  // This just shows the structure
  const gujaratiMonthIndex = (month + 1) % 12; // Simplified
  const gujaratiMonth = GUJARATI_MONTHS[gujaratiMonthIndex];

  // Determine paksha (assuming first half of month is Shukla, second half is Krishna)
  const paksha = day <= 15 ? PAKSHA.SHUKLA : PAKSHA.KRISHNA;

  // Calculate tithi (simplified)
  const tithiIndex = day % 15 || 0;
  const tithi = TITHIS[tithiIndex];

  return `${gujaratiMonth} ${paksha} ${tithi} ${vikramYear}`;
};

// Alternative: If you want to let users select/enter the Gujarati date manually
export const getGujaratiDateSuggestion = (gregorianDate) => {
  const date = new Date(gregorianDate);
  const year = date.getFullYear();

  let vikramYear = year + 57;
  const month = date.getMonth() + 1;

  if (month < 4) {
    vikramYear = vikramYear - 1;
  }

  return {
    vikramYear,
    // Return all options for user to choose from
    monthOptions: GUJARATI_MONTHS,
    tithiOptions: TITHIS,
    pakshaOptions: Object.values(PAKSHA),
  };
};

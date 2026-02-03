// src/utils/validation.js
export const validateFamilyForm = (familyData, members) => {
  const errors = {};

  // Validate Head of Family
  if (!familyData.headOfFamily?.fullName?.trim()) {
    errors.headOfFamily = "Head of family name is required";
  }

  if (!familyData.contact?.mobile?.trim()) {
    errors.mobile = "Mobile number is required";
  } else if (!/^\d{10}$/.test(familyData.contact.mobile.replace(/\D/g, ""))) {
    errors.mobile = "Mobile number must be 10 digits";
  }

  // Validate home address
  if (!familyData.homeAddress?.area?.trim()) {
    errors.area = "Area is required";
  }

  // Validate family members
  const memberErrors = [];
  members.forEach((member, index) => {
    const memberError = {};

    if (!member.fullName?.trim()) {
      memberError.fullName = "Name is required";
    }

    if (
      member.aadharNumber &&
      !/^\d{12}$/.test(member.aadharNumber.replace(/\D/g, ""))
    ) {
      memberError.aadharNumber = "Aadhar must be 12 digits";
    }

    if (Object.keys(memberError).length > 0) {
      memberErrors[index] = memberError;
    }
  });

  if (memberErrors.length > 0) {
    errors.members = memberErrors;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAadhar = (aadhar) => {
  if (!aadhar) return true; // Optional field
  const cleaned = aadhar.replace(/\D/g, "");
  return cleaned.length === 12;
};

export const validateMobile = (mobile) => {
  if (!mobile) return false;
  const cleaned = mobile.replace(/\D/g, "");
  return cleaned.length === 10;
};

export const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

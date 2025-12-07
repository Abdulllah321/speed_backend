export const validateEmployeePayload = (body) => {
  const errors = [];
  const required = ['employeeId', 'employeeName', 'officialEmail', 'joiningDate', 'dateOfBirth', 'department', 'employeeGrade', 'designation', 'employmentStatus', 'reportingManager', 'workingHoursPolicy', 'branch', 'country', 'state', 'city', 'employeeSalary'];
  for (const key of required) {
    if (!body[key] || (typeof body[key] === 'string' && !body[key].trim())) errors.push(`${key} is required`);
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (body.officialEmail && !emailRegex.test(body.officialEmail)) errors.push('officialEmail is invalid');
  const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
  if (body.cnicNumber && !cnicRegex.test(body.cnicNumber)) errors.push('cnicNumber must be XXXXX-XXXXXXX-X');
  if (body.employeeSalary && isNaN(Number(body.employeeSalary))) errors.push('employeeSalary must be numeric');
  return { valid: errors.length === 0, errors };
};


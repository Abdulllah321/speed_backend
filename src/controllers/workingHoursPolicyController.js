import prisma from '@/models/database.js';

// WorkingHoursPolicy CRUD
export const getAllWorkingHoursPolicies = async (req, res) => {
  try {
    const policies = await prisma.workingHoursPolicy.findMany({
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    const data = policies.map(p => ({
      ...p,
      shortDayMins: p.shortDayMins ? Number(p.shortDayMins) : null,
      lateDeductionPercent: p.lateDeductionPercent ? Number(p.lateDeductionPercent) : null,
      halfDayDeductionAmount: p.halfDayDeductionAmount ? Number(p.halfDayDeductionAmount) : null,
      shortDayDeductionAmount: p.shortDayDeductionAmount ? Number(p.shortDayDeductionAmount) : null,
      overtimeRate: p.overtimeRate ? Number(p.overtimeRate) : null,
      gazzetedOvertimeRate: p.gazzetedOvertimeRate ? Number(p.gazzetedOvertimeRate) : null,
      dayOverrides: p.dayOverrides ? (typeof p.dayOverrides === 'string' ? JSON.parse(p.dayOverrides) : p.dayOverrides) : null,
      createdBy: p.createdBy ? `${p.createdBy.firstName} ${p.createdBy.lastName || ''}`.trim() : null,
    }));
    res.json({ status: true, data });
  } catch (error) {
    console.error('Error fetching working hours policies:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch working hours policies' });
  }
};

export const getWorkingHoursPolicyById = async (req, res) => {
  try {
    const { id } = req.params;
    const policy = await prisma.workingHoursPolicy.findUnique({
      where: { id },
      include: { createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!policy) {
      return res.status(404).json({ status: false, message: 'Working hours policy not found' });
    }
    res.json({
      status: true,
      data: {
        ...policy,
        shortDayMins: policy.shortDayMins ? Number(policy.shortDayMins) : null,
        lateDeductionPercent: policy.lateDeductionPercent ? Number(policy.lateDeductionPercent) : null,
        halfDayDeductionAmount: policy.halfDayDeductionAmount ? Number(policy.halfDayDeductionAmount) : null,
        shortDayDeductionAmount: policy.shortDayDeductionAmount ? Number(policy.shortDayDeductionAmount) : null,
        overtimeRate: policy.overtimeRate ? Number(policy.overtimeRate) : null,
        gazzetedOvertimeRate: policy.gazzetedOvertimeRate ? Number(policy.gazzetedOvertimeRate) : null,
        dayOverrides: policy.dayOverrides ? (typeof policy.dayOverrides === 'string' ? JSON.parse(policy.dayOverrides) : policy.dayOverrides) : null,
        createdBy: policy.createdBy ? `${policy.createdBy.firstName} ${policy.createdBy.lastName || ''}`.trim() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching working hours policy:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to fetch working hours policy' });
  }
};

export const createWorkingHoursPolicy = async (req, res) => {
  try {
    const {
      name,
      startWorkingHours,
      endWorkingHours,
      shortDayMins,
      startBreakTime,
      endBreakTime,
      halfDayStartTime,
      lateStartTime,
      lateDeductionType,
      applyDeductionAfterLates,
      lateDeductionPercent,
      halfDayDeductionType,
      applyDeductionAfterHalfDays,
      halfDayDeductionAmount,
      shortDayDeductionType,
      applyDeductionAfterShortDays,
      shortDayDeductionAmount,
      overtimeRate,
      gazzetedOvertimeRate,
      dayOverrides,
      status,
    } = req.body;

    if (!name?.trim() || !startWorkingHours || !endWorkingHours) {
      return res.status(400).json({ status: false, message: 'Name, start time, and end time are required' });
    }

    // Validate dayOverrides structure if provided (now accepts grouped array)
    if (dayOverrides) {
      const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      
      // Check if it's an array (new grouped format)
      if (Array.isArray(dayOverrides)) {
        const allDaysInGroups = [];
        for (const group of dayOverrides) {
          if (!group.days || !Array.isArray(group.days)) {
            return res.status(400).json({ 
              status: false, 
              message: 'Each day group must have a "days" array' 
            });
          }
          
          // Check for duplicate days across groups
          for (const day of group.days) {
            if (!validDays.includes(day)) {
              return res.status(400).json({ 
                status: false, 
                message: `Invalid day: ${day}. Valid days are: ${validDays.join(', ')}` 
              });
            }
            if (allDaysInGroups.includes(day)) {
              return res.status(400).json({ 
                status: false, 
                message: `Day ${day} appears in multiple groups. Each day should only be in one group.` 
              });
            }
            allDaysInGroups.push(day);
          }
          
          // Validate group structure
          if (group.enabled && group.overrideHours) {
            if (!group.startTime || !group.endTime) {
              return res.status(400).json({ 
                status: false, 
                message: `Group ${group.days.join(', ')}: Start and end times are required when overrideHours is enabled` 
              });
            }
          }
        }
        
        // Check that all 7 days are covered
        if (allDaysInGroups.length !== 7) {
          const missingDays = validDays.filter(day => !allDaysInGroups.includes(day));
          return res.status(400).json({ 
            status: false, 
            message: `Missing days: ${missingDays.join(', ')}. All 7 days must be included in day groups.` 
          });
        }
      } else {
        // Legacy format: object with day keys (for backward compatibility)
        const dayKeys = Object.keys(dayOverrides);
        const invalidDays = dayKeys.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
          return res.status(400).json({ 
            status: false, 
            message: `Invalid day keys: ${invalidDays.join(', ')}. Valid days are: ${validDays.join(', ')}` 
          });
        }
        for (const [dayKey, dayData] of Object.entries(dayOverrides)) {
          if (dayData.enabled && dayData.overrideHours) {
            if (!dayData.startTime || !dayData.endTime) {
              return res.status(400).json({ 
                status: false, 
                message: `${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}: Start and end times are required when overrideHours is enabled` 
              });
            }
          }
        }
      }
    }

    const policy = await prisma.workingHoursPolicy.create({
      data: {
        name: name.trim(),
        startWorkingHours,
        endWorkingHours,
        shortDayMins: shortDayMins ? parseInt(shortDayMins) : null,
        startBreakTime: startBreakTime || null,
        endBreakTime: endBreakTime || null,
        halfDayStartTime: halfDayStartTime || null,
        lateStartTime: lateStartTime || null,
        lateDeductionType: lateDeductionType || null,
        applyDeductionAfterLates: applyDeductionAfterLates ? parseInt(applyDeductionAfterLates) : null,
        lateDeductionPercent: lateDeductionPercent ? parseFloat(lateDeductionPercent) : null,
        halfDayDeductionType: halfDayDeductionType || null,
        applyDeductionAfterHalfDays: applyDeductionAfterHalfDays ? parseInt(applyDeductionAfterHalfDays) : null,
        halfDayDeductionAmount: halfDayDeductionAmount ? parseFloat(halfDayDeductionAmount) : null,
        shortDayDeductionType: shortDayDeductionType || null,
        applyDeductionAfterShortDays: applyDeductionAfterShortDays ? parseInt(applyDeductionAfterShortDays) : null,
        shortDayDeductionAmount: shortDayDeductionAmount ? parseFloat(shortDayDeductionAmount) : null,
        overtimeRate: overtimeRate ? parseFloat(overtimeRate) : null,
        gazzetedOvertimeRate: gazzetedOvertimeRate ? parseFloat(gazzetedOvertimeRate) : null,
        dayOverrides: dayOverrides ? JSON.stringify(dayOverrides) : null,
        status: status || 'active',
        createdById: req.user?.userId || null,
      },
    });
    
    // Parse dayOverrides back to object for response
    const responseData = {
      ...policy,
      dayOverrides: policy.dayOverrides ? JSON.parse(policy.dayOverrides) : null,
    };
    
    res.status(201).json({ status: true, data: responseData, message: 'Working hours policy created successfully' });
  } catch (error) {
    console.error('Error creating working hours policy:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Working hours policy with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to create working hours policy' });
  }
};

export const updateWorkingHoursPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      startWorkingHours,
      endWorkingHours,
      shortDayMins,
      startBreakTime,
      endBreakTime,
      halfDayStartTime,
      lateStartTime,
      lateDeductionType,
      applyDeductionAfterLates,
      lateDeductionPercent,
      halfDayDeductionType,
      applyDeductionAfterHalfDays,
      halfDayDeductionAmount,
      shortDayDeductionType,
      applyDeductionAfterShortDays,
      shortDayDeductionAmount,
      overtimeRate,
      gazzetedOvertimeRate,
      dayOverrides,
      status,
    } = req.body;

    if (!name?.trim() || !startWorkingHours || !endWorkingHours) {
      return res.status(400).json({ status: false, message: 'Name, start time, and end time are required' });
    }

    // Validate dayOverrides structure if provided (now accepts grouped array)
    if (dayOverrides !== undefined) {
      if (dayOverrides === null) {
        // Allow null to clear dayOverrides
      } else {
        const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        
        // Check if it's an array (new grouped format)
        if (Array.isArray(dayOverrides)) {
          const allDaysInGroups = [];
          for (const group of dayOverrides) {
            if (!group.days || !Array.isArray(group.days)) {
              return res.status(400).json({ 
                status: false, 
                message: 'Each day group must have a "days" array' 
              });
            }
            
            // Check for duplicate days across groups
            for (const day of group.days) {
              if (!validDays.includes(day)) {
                return res.status(400).json({ 
                  status: false, 
                  message: `Invalid day: ${day}. Valid days are: ${validDays.join(', ')}` 
                });
              }
              if (allDaysInGroups.includes(day)) {
                return res.status(400).json({ 
                  status: false, 
                  message: `Day ${day} appears in multiple groups. Each day should only be in one group.` 
                });
              }
              allDaysInGroups.push(day);
            }
            
            // Validate group structure
            if (group.enabled && group.overrideHours) {
              if (!group.startTime || !group.endTime) {
                return res.status(400).json({ 
                  status: false, 
                  message: `Group ${group.days.join(', ')}: Start and end times are required when overrideHours is enabled` 
                });
              }
            }
          }
          
          // Check that all 7 days are covered
          if (allDaysInGroups.length !== 7) {
            const missingDays = validDays.filter(day => !allDaysInGroups.includes(day));
            return res.status(400).json({ 
              status: false, 
              message: `Missing days: ${missingDays.join(', ')}. All 7 days must be included in day groups.` 
            });
          }
        } else {
          // Legacy format: object with day keys (for backward compatibility)
          const dayKeys = Object.keys(dayOverrides);
          const invalidDays = dayKeys.filter(day => !validDays.includes(day));
          if (invalidDays.length > 0) {
            return res.status(400).json({ 
              status: false, 
              message: `Invalid day keys: ${invalidDays.join(', ')}. Valid days are: ${validDays.join(', ')}` 
            });
          }
          for (const [dayKey, dayData] of Object.entries(dayOverrides)) {
            if (dayData.enabled && dayData.overrideHours) {
              if (!dayData.startTime || !dayData.endTime) {
                return res.status(400).json({ 
                  status: false, 
                  message: `${dayKey.charAt(0).toUpperCase() + dayKey.slice(1)}: Start and end times are required when overrideHours is enabled` 
                });
              }
            }
          }
        }
      }
    }

    const updateData = {
      name: name.trim(),
      startWorkingHours,
      endWorkingHours,
      shortDayMins: shortDayMins !== undefined ? (shortDayMins ? parseInt(shortDayMins) : null) : undefined,
      startBreakTime: startBreakTime !== undefined ? (startBreakTime || null) : undefined,
      endBreakTime: endBreakTime !== undefined ? (endBreakTime || null) : undefined,
      halfDayStartTime: halfDayStartTime !== undefined ? (halfDayStartTime || null) : undefined,
      lateStartTime: lateStartTime !== undefined ? (lateStartTime || null) : undefined,
      lateDeductionType: lateDeductionType !== undefined ? (lateDeductionType || null) : undefined,
      applyDeductionAfterLates: applyDeductionAfterLates !== undefined ? (applyDeductionAfterLates ? parseInt(applyDeductionAfterLates) : null) : undefined,
      lateDeductionPercent: lateDeductionPercent !== undefined ? (lateDeductionPercent ? parseFloat(lateDeductionPercent) : null) : undefined,
      halfDayDeductionType: halfDayDeductionType !== undefined ? (halfDayDeductionType || null) : undefined,
      applyDeductionAfterHalfDays: applyDeductionAfterHalfDays !== undefined ? (applyDeductionAfterHalfDays ? parseInt(applyDeductionAfterHalfDays) : null) : undefined,
      halfDayDeductionAmount: halfDayDeductionAmount !== undefined ? (halfDayDeductionAmount ? parseFloat(halfDayDeductionAmount) : null) : undefined,
      shortDayDeductionType: shortDayDeductionType !== undefined ? (shortDayDeductionType || null) : undefined,
      applyDeductionAfterShortDays: applyDeductionAfterShortDays !== undefined ? (applyDeductionAfterShortDays ? parseInt(applyDeductionAfterShortDays) : null) : undefined,
      shortDayDeductionAmount: shortDayDeductionAmount !== undefined ? (shortDayDeductionAmount ? parseFloat(shortDayDeductionAmount) : null) : undefined,
      overtimeRate: overtimeRate !== undefined ? (overtimeRate ? parseFloat(overtimeRate) : null) : undefined,
      gazzetedOvertimeRate: gazzetedOvertimeRate !== undefined ? (gazzetedOvertimeRate ? parseFloat(gazzetedOvertimeRate) : null) : undefined,
      status: status || undefined,
    };

    // Handle dayOverrides update
    if (dayOverrides !== undefined) {
      updateData.dayOverrides = dayOverrides ? JSON.stringify(dayOverrides) : null;
    }

    const policy = await prisma.workingHoursPolicy.update({
      where: { id },
      data: updateData,
    });

    // Parse dayOverrides back to object for response
    const responseData = {
      ...policy,
      dayOverrides: policy.dayOverrides ? JSON.parse(policy.dayOverrides) : null,
    };

    res.json({ status: true, data: responseData, message: 'Working hours policy updated successfully' });
  } catch (error) {
    console.error('Error updating working hours policy:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ status: false, message: 'Working hours policy with this name already exists' });
    }
    res.status(500).json({ status: false, message: error.message || 'Failed to update working hours policy' });
  }
};

export const deleteWorkingHoursPolicy = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.workingHoursPolicy.delete({ where: { id } });
    res.json({ status: true, message: 'Working hours policy deleted successfully' });
  } catch (error) {
    console.error('Error deleting working hours policy:', error);
    res.status(500).json({ status: false, message: error.message || 'Failed to delete working hours policy' });
  }
};


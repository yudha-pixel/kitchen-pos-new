/**
 * HR & Payroll Service
 * Handles employee management, attendance with photo, and payroll calculations
 */

// Configuration constants
export const LATE_TOLERANCE_MINUTES = 15; // 15 minutes tolerance for late detection
export const OVERTIME_MULTIPLIER = 1.5; // 1.5x hourly rate for overtime

export interface Employee {
  id?: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  base_salary: number;
  employment_type: 'permanent' | 'freelance';
  hourly_rate?: number;
  join_date: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface Attendance {
  id?: string;
  employee_id: string;
  date: string;
  check_in_time?: string;
  check_out_time?: string;
  check_in_photo?: string;
  check_out_photo?: string;
  status: 'present' | 'late' | 'absent';
  shift_id?: string;
  overtime_hours?: number;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id?: string;
  name: string;
  start_time: string;
  end_time: string;
  description?: string;
  assigned_employees?: string[];
  created_at: string;
  updated_at: string;
}

export interface Payroll {
  id?: string;
  employee_id: string;
  month: string;
  year: number;
  base_salary: number;
  working_days: number;
  bonus: number;
  deduction: number;
  total_salary: number;
  created_at?: string;
}

/**
 * Get all employees
 */
export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const employees = await db.employees.toArray();
    return employees.sort((a: any, b: any) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
  } catch (error) {
    console.error('Failed to get employees:', error);
    return [];
  }
}

/**
 * Add a new employee
 */
export async function addEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const employeeData = {
      ...employee,
      id,
      created_at: now,
      updated_at: now,
      employment_type: employee.employment_type || 'permanent',
    };
    await db.employees.add(employeeData);
    return id;
  } catch (error) {
    console.error('Failed to add employee:', error);
    throw error;
  }
}

/**
 * Update an existing employee
 */
export async function updateEmployee(id: string, employee: Partial<Employee>): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    const employeeData = {
      ...employee,
      updated_at: new Date().toISOString(),
    };
    await db.employees.update(id, employeeData);
  } catch (error) {
    console.error('Failed to update employee:', error);
    throw error;
  }
}

/**
 * Delete an employee
 */
export async function deleteEmployee(id: string): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    await db.employees.delete(id);
  } catch (error) {
    console.error('Failed to delete employee:', error);
    throw error;
  }
}

/**
 * Get attendance for a specific date
 */
export async function getAttendanceByDate(date: string): Promise<Attendance[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const attendance = await db.attendance
      .where('date')
      .equals(date)
      .toArray();
    return attendance;
  } catch (error) {
    console.error('Failed to get attendance:', error);
    return [];
  }
}

/**
 * Get attendance for an employee
 */
export async function getAttendanceByEmployee(employeeId: string): Promise<Attendance[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const attendance = await db.attendance
      .where('employee_id')
      .equals(employeeId)
      .toArray();
    return attendance.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Failed to get attendance:', error);
    return [];
  }
}

/**
 * Check-in employee with photo
 */
export async function checkIn(employeeId: string, photo: string, shiftId?: string): Promise<{ status: 'present' | 'late'; isLate: boolean }> {
  try {
    const { db } = await import('@/src/lib/db');
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const checkInTime = now.toTimeString().split(' ')[0];
    
    // Check if already checked in today
    const existing = await db.attendance
      .where('employee_id')
      .equals(employeeId)
      .and(att => att.date === today)
      .first();
    
    if (existing) {
      throw new Error('Sudah check-in hari ini');
    }
    
    // Determine status based on shift with tolerance
    let status: 'present' | 'late' | 'absent' = 'present';
    let isLate = false;
    
    if (shiftId) {
      const shift = await getShiftById(shiftId);
      if (shift) {
        const shiftStartTime = new Date(`${today}T${shift.start_time}:00`);
        const toleranceTime = new Date(shiftStartTime.getTime() + LATE_TOLERANCE_MINUTES * 60000);
        const currentTime = new Date(`${today}T${checkInTime}`);
        
        if (currentTime > toleranceTime) {
          status = 'late';
          isLate = true;
        } else {
          status = 'present';
          isLate = false;
        }
      }
    } else {
      // Default to 9 AM if no shift
      const defaultStartTime = new Date(`${today}T09:00:00`);
      const toleranceTime = new Date(defaultStartTime.getTime() + LATE_TOLERANCE_MINUTES * 60000);
      if (now > toleranceTime) {
        status = 'late';
        isLate = true;
      }
    }
    
    const attendance: Attendance = {
      employee_id: employeeId,
      date: today,
      check_in_time: checkInTime,
      check_in_photo: photo,
      status,
      shift_id: shiftId,
      overtime_hours: 0,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };
    
    await db.attendance.add(attendance);
    return { status, isLate };
  } catch (error) {
    console.error('Failed to check-in:', error);
    throw error;
  }
}

/**
 * Check-out employee with photo
 */
export async function checkOut(employeeId: string, photo: string): Promise<{ overtimeHours: number }> {
  try {
    const { db } = await import('@/src/lib/db');
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const checkOutTime = now.toTimeString().split(' ')[0];
    
    const attendance = await db.attendance
      .where('employee_id')
      .equals(employeeId)
      .and(att => att.date === today)
      .first();
    
    if (!attendance) {
      throw new Error('Belum check-in hari ini');
    }
    
    if (attendance.check_out_time) {
      throw new Error('Sudah check-out hari ini');
    }
    
    // Calculate overtime hours
    let overtimeHours = 0;
    if (attendance.shift_id) {
      const shift = await getShiftById(attendance.shift_id);
      if (shift) {
        const shiftEndTime = new Date(`${today}T${shift.end_time}:00`);
        const currentTime = new Date(`${today}T${checkOutTime}`);
        
        // Handle overnight shifts (e.g., 00:00 - 08:00)
        if (shiftEndTime < new Date(`${today}T${shift.start_time}:00`)) {
          // Shift ends next day
          if (currentTime < shiftEndTime) {
            // Still within shift time
            overtimeHours = 0;
          } else {
            // Calculate overtime from shift end time
            const diffMs = currentTime.getTime() - shiftEndTime.getTime();
            overtimeHours = diffMs / (1000 * 60 * 60); // Convert to hours
          }
        } else {
          // Normal shift
          if (currentTime > shiftEndTime) {
            const diffMs = currentTime.getTime() - shiftEndTime.getTime();
            overtimeHours = diffMs / (1000 * 60 * 60); // Convert to hours
          }
        }
      }
    }
    
    // Round to 2 decimal places
    overtimeHours = Math.round(overtimeHours * 100) / 100;
    
    await db.attendance.update(attendance.id!, {
      check_out_time: checkOutTime,
      check_out_photo: photo,
      overtime_hours: overtimeHours,
      updated_at: now.toISOString(),
    });
    
    return { overtimeHours };
  } catch (error) {
    console.error('Failed to check-out:', error);
    throw error;
  }
}

/**
 * Calculate payroll for a specific month
 */
export async function calculatePayroll(month: string, year: number): Promise<Payroll[]> {
  try {
    const employees = await getAllEmployees();
    const payrollData: Payroll[] = [];
    
    for (const employee of employees) {
      if (employee.status !== 'active') continue;
      
      // Get attendance for the month
      const { db } = await import('@/src/lib/db');
      const monthStart = `${year}-${month}-01`;
      const monthEnd = `${year}-${month}-31`;
      
      const attendance = await db.attendance
        .where('employee_id')
        .equals(employee.id!)
        .and(att => att.date >= monthStart && att.date <= monthEnd)
        .toArray();
      
      if (employee.employment_type === 'freelance') {
        // Freelance calculation: hourly_rate × total_hours_worked
        const totalOvertimeHours = attendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
        
        // Calculate total work hours (regular + overtime)
        // For simplicity, assume 8 hours per day for regular hours
        const workingDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const regularHours = workingDays * 8;
        const totalHours = regularHours + totalOvertimeHours;
        
        const hourlyRate = employee.hourly_rate || 0;
        const totalWage = totalHours * hourlyRate;
        
        const payroll: Payroll = {
          employee_id: employee.id!,
          month,
          year,
          base_salary: 0, // Freelance doesn't have base salary
          working_days: workingDays,
          bonus: totalWage, // Use bonus field for total wage
          deduction: 0,
          total_salary: totalWage,
          created_at: new Date().toISOString(),
        };
        
        payrollData.push(payroll);
      } else {
        // Permanent calculation: base_salary / 22 × working_days + overtime
        const workingDays = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
        const dailyRate = employee.base_salary / 22; // Assuming 22 working days per month
        const calculatedSalary = dailyRate * workingDays;
        
        // Calculate overtime wage
        const totalOvertimeHours = attendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
        const hourlyRate = employee.base_salary / (22 * 8); // 22 days * 8 hours per day
        const overtimeWage = totalOvertimeHours * hourlyRate * OVERTIME_MULTIPLIER;
        
        const payroll: Payroll = {
          employee_id: employee.id!,
          month,
          year,
          base_salary: employee.base_salary,
          working_days: workingDays,
          bonus: overtimeWage, // Use bonus field for overtime wage
          deduction: 0,
          total_salary: calculatedSalary + overtimeWage,
          created_at: new Date().toISOString(),
        };
        
        payrollData.push(payroll);
      }
    }
    
    return payrollData;
  } catch (error) {
    console.error('Failed to calculate payroll:', error);
    return [];
  }
}

/**
 * Get HR statistics
 */
export async function getHRStatistics() {
  try {
    const employees = await getAllEmployees();
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = await getAttendanceByDate(today);
    
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
    const totalSalary = employees.reduce((sum, e) => sum + (e.status === 'active' ? e.base_salary : 0), 0);
    
    return {
      totalEmployees,
      activeEmployees,
      presentToday,
      totalSalary,
    };
  } catch (error) {
    console.error('Failed to get HR statistics:', error);
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      presentToday: 0,
      totalSalary: 0,
    };
  }
}

/**
 * Convert file to base64
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

/**
 * Get all shifts
 */
export async function getAllShifts(): Promise<Shift[]> {
  try {
    const { db } = await import('@/src/lib/db');
    const shifts = await db.shifts.toArray();
    return shifts.sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
  } catch (error) {
    console.error('Failed to get shifts:', error);
    return [];
  }
}

/**
 * Add a new shift
 */
export async function addShift(shift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    const { db } = await import('@/src/lib/db');
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const shiftData = {
      ...shift,
      id,
      created_at: now,
      updated_at: now,
    };
    await db.shifts.add(shiftData);
    return id;
  } catch (error) {
    console.error('Failed to add shift:', error);
    throw error;
  }
}

/**
 * Update an existing shift
 */
export async function updateShift(id: string, shift: Partial<Shift>): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    const shiftData = {
      ...shift,
      updated_at: new Date().toISOString(),
    };
    await db.shifts.update(id, shiftData);
  } catch (error) {
    console.error('Failed to update shift:', error);
    throw error;
  }
}

/**
 * Delete a shift
 */
export async function deleteShift(id: string): Promise<void> {
  try {
    const { db } = await import('@/src/lib/db');
    await db.shifts.delete(id);
  } catch (error) {
    console.error('Failed to delete shift:', error);
    throw error;
  }
}

/**
 * Get shift by ID
 */
export async function getShiftById(id: string): Promise<Shift | null> {
  try {
    const { db } = await import('@/src/lib/db');
    const shift = await db.shifts.get(id);
    return shift || null;
  } catch (error) {
    console.error('Failed to get shift:', error);
    return null;
  }
}

/**
 * Get employee names by IDs
 */
export async function getEmployeeNamesByIds(employeeIds: string[]): Promise<Map<string, string>> {
  try {
    const { db } = await import('@/src/lib/db');
    const employees = await db.employees
      .where('id')
      .anyOf(employeeIds)
      .toArray();
    
    const nameMap = new Map<string, string>();
    employees.forEach((emp: any) => {
      nameMap.set(emp.id, emp.name);
    });
    
    return nameMap;
  } catch (error) {
    console.error('Failed to get employee names:', error);
    return new Map();
  }
}

/**
 * Initialize default shifts
 */
export async function initializeDefaultShifts(): Promise<void> {
  try {
    const existingShifts = await getAllShifts();
    if (existingShifts.length > 0) return;

    const defaultShifts: Omit<Shift, 'id' | 'created_at' | 'updated_at'>[] = [
      {
        name: 'Pagi',
        start_time: '08:00',
        end_time: '16:00',
        description: 'Shift pagi 08:00 - 16:00',
        assigned_employees: [],
      },
      {
        name: 'Siang',
        start_time: '16:00',
        end_time: '00:00',
        description: 'Shift siang 16:00 - 00:00',
        assigned_employees: [],
      },
      {
        name: 'Malam',
        start_time: '00:00',
        end_time: '08:00',
        description: 'Shift malam 00:00 - 08:00',
        assigned_employees: [],
      },
    ];

    for (const shift of defaultShifts) {
      await addShift(shift);
    }
  } catch (error) {
    console.error('Failed to initialize default shifts:', error);
  }
}

/**
 * Payroll Summary Interface
 */
export interface PayrollSummary {
  totalPermanentSalary: number;
  totalFreelanceWages: number;
  totalOvertime: number;
  totalHRExpenses: number;
}

/**
 * Get payroll summary for a specific period (days)
 */
export async function getPayrollSummaryByPeriod(days: number): Promise<PayrollSummary> {
  try {
    const { db } = await import('@/src/lib/db');
    const employees = await db.employees.toArray();
    const attendance = await db.attendance.toArray();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const filteredAttendance = attendance.filter(a => 
      new Date(a.date) >= startDate
    );
    
    let totalPermanentSalary = 0;
    let totalFreelanceWages = 0;
    let totalOvertime = 0;
    
    // Group attendance by employee
    const attendanceByEmployee = new Map<string, typeof filteredAttendance>();
    filteredAttendance.forEach(att => {
      if (!attendanceByEmployee.has(att.employee_id)) {
        attendanceByEmployee.set(att.employee_id, []);
      }
      attendanceByEmployee.get(att.employee_id)!.push(att);
    });
    
    // Calculate for each employee
    for (const employee of employees) {
      if (employee.status !== 'active') continue;
      
      const empAttendance = attendanceByEmployee.get(employee.id!) || [];
      const workingDays = empAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
      const totalOvertimeHours = empAttendance.reduce((sum, a) => sum + (a.overtime_hours || 0), 0);
      
      if (employee.employment_type === 'freelance') {
        // Freelance: hourly_rate × total_hours
        const regularHours = workingDays * 8;
        const totalHours = regularHours + totalOvertimeHours;
        const hourlyRate = employee.hourly_rate || 0;
        const totalWage = totalHours * hourlyRate;
        totalFreelanceWages += totalWage;
        totalOvertime += totalOvertimeHours * hourlyRate; // Overtime portion
      } else {
        // Permanent: base_salary / 22 × working_days + overtime
        const dailyRate = employee.base_salary / 22;
        const calculatedSalary = dailyRate * workingDays;
        const hourlyRate = employee.base_salary / (22 * 8);
        const overtimeWage = totalOvertimeHours * hourlyRate * OVERTIME_MULTIPLIER;
        
        totalPermanentSalary += calculatedSalary;
        totalOvertime += overtimeWage;
      }
    }
    
    const totalHRExpenses = totalPermanentSalary + totalFreelanceWages + totalOvertime;
    
    return {
      totalPermanentSalary,
      totalFreelanceWages,
      totalOvertime,
      totalHRExpenses
    };
  } catch (error) {
    console.error('Failed to get payroll summary:', error);
    return {
      totalPermanentSalary: 0,
      totalFreelanceWages: 0,
      totalOvertime: 0,
      totalHRExpenses: 0
    };
  }
}

/**
 * HR & Payroll Service
 * Handles employee management, attendance with photo, and payroll calculations
 */

import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';
import { generateUUID } from '@/src/lib/utils';

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
  is_active: boolean;
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/hr/employees`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to fetch employees: ${response.status}`);
    }

    const employees = await response.json();
    return employees;
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/hr/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(employee),
    });

    if (!response.ok) {
      throw new Error('Failed to add employee');
    }

    const result = await response.json();
    return result.id;
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(employee),
    });

    if (!response.ok) {
      throw new Error('Failed to update employee');
    }
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/hr/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/attendance?date_from=${date}&date_to=${date}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Try to get more error details
      let errorMessage = 'Failed to fetch attendance';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = `Failed to fetch attendance (${response.status}: ${response.statusText})`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/attendance?employee_id=${employeeId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attendance');
    }

    const data = await response.json();
    return data;
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/attendance/check-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        employee_id: employeeId,
        photo_url: photo,
        shift_type: shiftId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check-in');
    }

    const data = await response.json();
    // Determine status based on check-in time (simplified for API)
    const isLate = false; // Backend will handle this logic
    return { status: 'present', isLate };
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/attendance/check-out`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        attendance_id: employeeId, // This should be attendance_id, not employee_id
        photo_url: photo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to check-out');
    }

    const data = await response.json();
    return { overtimeHours: 0 }; // Backend will calculate this
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
      if (!employee.is_active) continue;
      
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/hr/statistics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch HR statistics');
    }

    return await response.json();
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
    const id = generateUUID();
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
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/api/hr/payroll-summary?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Payroll summary API returned ${response.status}, using default values`);
      return {
        totalPermanentSalary: 0,
        totalFreelanceWages: 0,
        totalOvertime: 0,
        totalHRExpenses: 0
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Failed to get payroll summary, using default values:', error);
    return {
      totalPermanentSalary: 0,
      totalFreelanceWages: 0,
      totalOvertime: 0,
      totalHRExpenses: 0
    };
  }
}

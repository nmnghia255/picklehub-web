import { RecurringSocialFormData, SchedulePreview, DayOfWeek } from './recurring-socials.types';

export function generateSchedulePreview(formData: RecurringSocialFormData): SchedulePreview[] {
  const schedules: SchedulePreview[] = [];
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNamesVi = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  
  if (formData.recurrenceType === 'weekly' && formData.daysOfWeek) {
    const dayIndexMap: { [key in DayOfWeek]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    
    const dayIndices = formData.daysOfWeek.map(d => dayIndexMap[d]).sort((a, b) => a - b);
    
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dayIndex = currentDate.getDay();
      if (dayIndices.includes(dayIndex)) {
        schedules.push({
          date: formatDateISO(currentDate),
          dayName: dayNamesVi[dayIndex],
          startTime: formData.startTime,
          endTime: formData.endTime,
          courts: formData.selectedCourts.length,
          totalCapacity: formData.selectedCourts.length * formData.maxPerCourt,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  } else if (formData.recurrenceType === 'monthly' && formData.dayOfMonth) {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (currentDate.getDate() === formData.dayOfMonth) {
        schedules.push({
          date: formatDateISO(currentDate),
          dayName: dayNamesVi[currentDate.getDay()],
          startTime: formData.startTime,
          endTime: formData.endTime,
          courts: formData.selectedCourts.length,
          totalCapacity: formData.selectedCourts.length * formData.maxPerCourt,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  } else if (formData.recurrenceType === 'quarterly' && formData.quarterDay) {
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const month = currentDate.getMonth() + 1;
      if ((month === 1 || month === 4 || month === 7 || month === 10) && currentDate.getDate() === formData.quarterDay) {
        schedules.push({
          date: formatDateISO(currentDate),
          dayName: dayNamesVi[currentDate.getDay()],
          startTime: formData.startTime,
          endTime: formData.endTime,
          courts: formData.selectedCourts.length,
          totalCapacity: formData.selectedCourts.length * formData.maxPerCourt,
        });
      }
      currentDate.setMonth(currentDate.getMonth() + 3);
    }
  }
  
  return schedules.slice(0, 10); // Limit to first 10 for preview
}

export function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateRangeDisplay(startDate: string, endDate: string): string {
  return `${formatDateDisplay(startDate)} - ${formatDateDisplay(endDate)}`;
}

export function getRecurrenceTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    weekly: 'Hàng tuần',
    monthly: 'Hàng tháng',
    quarterly: 'Hàng quý',
  };
  return labels[type] || type;
}

export function getStatusBadgeColor(status: string): string {
  const colors: { [key: string]: string } = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    expired: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  };
  return colors[status] || colors.expired;
}

export function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    active: 'Đang hoạt động',
    paused: 'Tạm dừng',
    expired: 'Hết hạn',
  };
  return labels[status] || status;
}

export function calculateTotalSchedules(schedules: SchedulePreview[]): number {
  return schedules.length;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getRecurrenceDescription(
  type: string,
  daysOfWeek?: string[],
  dayOfMonth?: number,
  monthPosition?: string,
): string {
  if (type === 'weekly' && daysOfWeek) {
    const dayLabels = daysOfWeek.map(d => getDayLabel(d)).join(', ');
    return `Mỗi ${dayLabels}`;
  }
  if (type === 'monthly' && dayOfMonth) {
    return `Ngày ${dayOfMonth} hàng tháng`;
  }
  if (type === 'quarterly') {
    return 'Hàng quý';
  }
  return '';
}

function getDayLabel(day: string): string {
  const labels: { [key: string]: string } = {
    monday: 'thứ 2',
    tuesday: 'thứ 3',
    wednesday: 'thứ 4',
    thursday: 'thứ 5',
    friday: 'thứ 6',
    saturday: 'thứ 7',
    sunday: 'chủ nhật',
  };
  return labels[day] || day;
}

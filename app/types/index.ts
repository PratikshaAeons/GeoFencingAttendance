export interface User {
    id: string;
    name: string;
    email: string;
  }
  
  export interface AttendanceRecord {
    id: string;
    date: string;
    checkIn: string | null;
    checkOut: string | null;
    status: 'present' | 'absent' | 'half-day';
  }
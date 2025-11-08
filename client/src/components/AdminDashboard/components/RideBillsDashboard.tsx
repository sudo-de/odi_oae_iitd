import React, { useMemo } from 'react';
import type { User } from '../types';
import RideBills from './RideBills';
import type { RideBill } from './RideBills';

interface RideBillsDashboardProps {
  users: User[];
}

const RideBillsDashboard: React.FC<RideBillsDashboardProps> = ({ users }) => {
  // Mock ride bills data (replace with actual API call later)
  const mockRideBills: RideBill[] = useMemo(() => {
    const drivers = users.filter(user => user.role === 'driver');
    const students = users.filter(user => user.role === 'student');
    const locations = [
      'IIT Main Gate → IIT Hospital',
      'Adhchini Gate → Himadri Hostel',
      'Jia Sarai Gate → LHC',
      'IIT Hospital → IIT Market',
      'Dogra Hall → Kailash Hostel',
    ];
    
    let rideCounter = 0;
    
    return drivers.flatMap((driver) => {
      return Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => {
        const student = students[Math.floor(Math.random() * students.length)];
        const location = locations[Math.floor(Math.random() * locations.length)];
        const fare = Math.floor(Math.random() * 200) + 50;
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const hours = Math.floor(Math.random() * 12) + 8;
        const minutes = Math.floor(Math.random() * 60);
        const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Format ID as YEARMMDD + sequential number
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const sequential = (++rideCounter).toString().padStart(4, '0');
        const id = `${year}${month}${day}${sequential}`;
        
        return {
          id,
          studentName: student?.name || 'Unknown Student',
          studentEntryNumber: student?.entryNumber || '',
          driverName: driver.name,
          location,
          fare,
          date: date.toISOString(),
          time,
          createdAt: date.toISOString(),
        };
      });
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [users]);

  return (
    <div className="ride-bills-dashboard">
      <RideBills rides={mockRideBills} />
    </div>
  );
};

export default RideBillsDashboard;


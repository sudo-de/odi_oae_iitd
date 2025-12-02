import React, { useState, useEffect, memo } from 'react';
import axios from 'axios';
import RideBills from './RideBills';
import type { RideBill } from './RideBills';

interface RideBillsDashboardProps {
  token: string;
  onToggleSidebar?: () => void;
}

const RideBillsDashboard: React.FC<RideBillsDashboardProps> = ({ token, onToggleSidebar }) => {
  const [rides, setRides] = useState<RideBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  // Auto-sync with API
  useEffect(() => {
    const fetchRideBills = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get<RideBill[]>(
          `${import.meta.env.VITE_API_BASE_URL}/ride-bills`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        // Transform API data to match component interface
        const transformedRides: RideBill[] = response.data.map(ride => ({
          id: ride.id,
          studentName: ride.studentName,
          studentEntryNumber: ride.studentEntryNumber,
          driverName: ride.driverName,
          location: ride.location,
          fare: ride.fare,
          date: ride.date,
          time: ride.time,
          createdAt: ride.createdAt,
        }));

        setRides(transformedRides);
      } catch (err: any) {
        console.error('Failed to fetch ride bills:', err);
        setError(err.response?.data?.message || 'Failed to load ride bills');
        setRides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRideBills();
  }, [token]);

  return (
    <div className="ride-bills-dashboard">
      <RideBills
        rides={rides}
        loading={loading}
        onToggleSidebar={onToggleSidebar}
      />
    </div>
  );
};

export default memo(RideBillsDashboard);

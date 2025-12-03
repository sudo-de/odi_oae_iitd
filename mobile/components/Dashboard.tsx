import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { apiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import Settings from './Settings';

interface DashboardProps {
  user: any;
  token: string;
  onLogout: () => void;
}

type TabType = 'profile' | 'qr' | 'ride' | 'bills' | 'settings';

export default function Dashboard({ user, token, onLogout }: DashboardProps) {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [profile, setProfile] = useState<any>(user);
  const [rideBills, setRideBills] = useState<any[]>([]);
  const [rideLocations, setRideLocations] = useState<any[]>([]);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  
  // Ride booking state
  const [fromLocation, setFromLocation] = useState<string>('');
  const [toLocation, setToLocation] = useState<string>('');
  const [selectedFare, setSelectedFare] = useState<number | null>(null);
  const [isSubmittingRide, setIsSubmittingRide] = useState(false);

  const isDriver = user?.role === 'driver';
  const isStudent = user?.role === 'student';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadProfile(),
        loadRideBills(),
        loadRideLocations(),
        isDriver && loadQRCode(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const profileData = await apiService.getProfile();
      setProfile(profileData);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      if (error.response?.status === 401) {
        // Token expired, logout
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        onLogout();
      }
    }
  };

  const loadRideBills = async () => {
    try {
      const bills = await apiService.getRideBills();
      setRideBills(bills || []);
    } catch (error: any) {
      console.error('Error loading ride bills:', error);
    }
  };

  const loadRideLocations = async () => {
    try {
      const locations = await apiService.getRideLocations();
      setRideLocations(locations || []);
    } catch (error: any) {
      console.error('Error loading ride locations:', error);
    }
  };

  const loadQRCode = async () => {
    if (!isDriver || !user?._id) return;
    try {
      setQrLoading(true);
      // Check if QR code exists in user data
      if (user.qrCode) {
        setQrCode(user.qrCode);
      } else {
        // Generate QR code
        const qr = await apiService.generateQRCode(user._id);
        setQrCode(qr);
      }
    } catch (error: any) {
      console.error('Error loading QR code:', error);
      Alert.alert('Error', 'Failed to load QR code');
    } finally {
      setQrLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };


  const renderProfile = () => {
    if (!profile) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.profileHeader}>
          {profile.profilePhoto?.data && (
            <Image
              source={{ uri: `data:${profile.profilePhoto.mimetype};base64,${profile.profilePhoto.data}` }}
              style={styles.profileImage}
            />
          )}
          <View style={styles.nameContainer}>
            <Text style={[styles.profileName, { color: colors.text }]}>{profile.name}</Text>
            <View style={[styles.verifiedBadge, { backgroundColor: colors.success }]}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.roleText}>{profile.role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionIcon}>ℹ️</Text>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>
          </View>
          
          {profile.phone && (
            <View style={[styles.infoRow, { backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }]}>
              <Text style={styles.infoIcon}>📞</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {profile.phone.countryCode} {profile.phone.number}
                </Text>
              </View>
            </View>
          )}

          {isStudent && profile.entryNumber && (
            <View style={[styles.infoRow, { backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }]}>
              <Text style={styles.infoIcon}>🎓</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Entry Number</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.entryNumber}</Text>
              </View>
            </View>
          )}

          {isStudent && profile.programme && (
            <View style={[styles.infoRow, { backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }]}>
              <Text style={styles.infoIcon}>📚</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Programme</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.programme}</Text>
              </View>
            </View>
          )}

          {isStudent && profile.department && (
            <View style={[styles.infoRow, { backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }]}>
              <Text style={styles.infoIcon}>🏛️</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Department</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{profile.department}</Text>
              </View>
            </View>
          )}

          {isStudent && profile.hostel && (
            <View style={[styles.infoRow, { backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }]}>
              <Text style={styles.infoIcon}>🏠</Text>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Hostel</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {profile.hostel.name} - Room {profile.hostel.roomNo}
                </Text>
              </View>
            </View>
          )}

          {profile.expiryDate && (
            <View style={[styles.infoRow, { backgroundColor: colors.background, padding: 12, borderRadius: 8, marginBottom: 8 }]}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={[styles.infoContent, { flex: 1 }]}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Expiry Date</Text>
                <View style={styles.expiryContainer}>
                  <Text style={[styles.infoValue, { color: colors.text, marginRight: 8 }]}>
                    {new Date(profile.expiryDate).toLocaleDateString()}
                  </Text>
                  {(() => {
                    const expiryDate = new Date(profile.expiryDate);
                    const today = new Date();
                    const isExpired = expiryDate < today;
                    const daysRemaining = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    
                    if (isExpired) {
                      return (
                        <View style={[styles.expiryBadge, { backgroundColor: colors.error }]}>
                          <Text style={styles.expiryBadgeText}>⚠️ Expired</Text>
                        </View>
                      );
                    } else if (daysRemaining <= 30) {
                      return (
                        <View style={[styles.expiryBadge, { backgroundColor: '#ff9500' }]}>
                          <Text style={styles.expiryBadgeText}>
                            ⏰ {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
                          </Text>
                        </View>
                      );
                    } else {
                      return (
                        <View style={[styles.expiryBadge, { backgroundColor: colors.success }]}>
                          <Text style={styles.expiryBadgeText}>✓ Valid</Text>
                        </View>
                      );
                    }
                  })()}
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderQRCode = () => {
    if (!isDriver) return null;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionIcon}>📱</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Driver QR Code</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Show this QR code to students for verification
        </Text>
        
        {qrLoading ? (
          <View style={styles.qrContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Generating QR Code...</Text>
          </View>
        ) : qrCode ? (
          <View style={styles.qrContainer}>
            <View style={[styles.qrWrapper, { backgroundColor: '#fff', padding: 16, borderRadius: 12, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }]}>
              <Image
                source={{ uri: qrCode }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.primary + '15', borderWidth: 1, borderColor: colors.primary }]}
              onPress={loadQRCode}
            >
              <Text style={styles.refreshIcon}>🔄</Text>
              <Text style={[styles.refreshButtonText, { color: colors.primary }]}>Refresh QR Code</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.generateButton, { backgroundColor: colors.primary }]}
            onPress={loadQRCode}
          >
            <Text style={styles.buttonIcon}>✨</Text>
            <Text style={styles.generateButtonText}>Generate QR Code</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderRideBills = () => {
    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionIcon}>📄</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ride Bills</Text>
        </View>
        
        {rideBills.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No ride bills found</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Your ride history will appear here
            </Text>
          </View>
        ) : (
          rideBills.map((bill: any) => {
            const statusColor = bill.status === 'completed' ? colors.success : 
                              bill.status === 'pending' ? '#ff9500' : 
                              bill.status === 'cancelled' ? colors.error : colors.textSecondary;
            
            return (
              <View key={bill._id} style={[styles.billCard, { backgroundColor: colors.background, borderLeftWidth: 4, borderLeftColor: statusColor }]}>
                <View style={styles.billHeader}>
                  <View style={styles.billDateContainer}>
                    <Text style={styles.billDateIcon}>📅</Text>
                    <Text style={[styles.billDate, { color: colors.textSecondary }]}>
                      {new Date(bill.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {bill.status === 'completed' ? '✓' : bill.status === 'pending' ? '⏳' : '✕'} {bill.status || 'completed'}
                    </Text>
                  </View>
                </View>
                <View style={styles.billAmountContainer}>
                  <Text style={[styles.billAmount, { color: colors.primary }]}>₹{bill.fare || bill.amount}</Text>
                </View>
                <View style={styles.billRouteContainer}>
                  <Text style={styles.billRouteIcon}>📍</Text>
                  <Text style={[styles.billFrom, { color: colors.text }]}>
                    {bill.location || 'Route information'}
                  </Text>
                </View>
                {bill.time && (
                  <View style={styles.billTimeContainer}>
                    <Text style={styles.billTimeIcon}>🕐</Text>
                    <Text style={[styles.billTo, { color: colors.textSecondary }]}>{bill.time}</Text>
                  </View>
                )}
                {bill.notes && (
                  <View style={[styles.billNotesContainer, { backgroundColor: colors.background }]}>
                    <Text style={styles.billNotesIcon}>📝</Text>
                    <Text style={[styles.billNotes, { color: colors.textSecondary }]}>{bill.notes}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </View>
    );
  };

  const handleLocationSelect = (from: string, to: string) => {
    setFromLocation(from);
    setToLocation(to);
    
    // Find matching ride location to get fare
    const matchingLocation = rideLocations.find(
      (loc: any) => loc.fromLocation === from && loc.toLocation === to
    );
    
    if (matchingLocation) {
      setSelectedFare(matchingLocation.fare);
    } else {
      setSelectedFare(null);
    }
  };

  const handleConfirmRide = async () => {
    if (!fromLocation || !toLocation || !selectedFare) {
      Alert.alert('Error', 'Please select both from and to locations');
      return;
    }

    setIsSubmittingRide(true);
    try {
      const today = new Date();
      const date = today.toISOString().split('T')[0];
      const time = today.toTimeString().split(' ')[0].substring(0, 5);
      
      // Generate ride ID
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      const sequential = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const rideId = `${year}${month}${day}${sequential}`;

      const location = `${fromLocation} - ${toLocation}`;

      // Create ride bill (driver info will be added later or can be optional)
      const rideBillData = {
        rideId,
        studentId: profile._id || profile.id,
        studentName: profile.name,
        studentEntryNumber: profile.entryNumber || '',
        driverId: '', // Will be assigned later
        driverName: 'TBD', // To be determined
        location,
        fare: selectedFare,
        date,
        time,
        status: 'pending',
      };

      await apiService.createRideBill(rideBillData);
      
      Alert.alert('Success', 'Ride request confirmed!', [
        {
          text: 'OK',
          onPress: () => {
            setFromLocation('');
            setToLocation('');
            setSelectedFare(null);
            loadRideBills(); // Refresh bills
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error creating ride:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to confirm ride');
    } finally {
      setIsSubmittingRide(false);
    }
  };

  const renderRide = () => {
    if (!isStudent) {
      return (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Ride Booking</Text>
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Ride booking is only available for students.
          </Text>
        </View>
      );
    }

    // Get unique locations for dropdowns
    const uniqueFromLocations = Array.from(
      new Set(rideLocations.map((loc: any) => loc.fromLocation))
    ).sort();
    const uniqueToLocations = Array.from(
      new Set(rideLocations.map((loc: any) => loc.toLocation))
    ).sort();

    // Filter to locations based on selected from location
    const availableToLocations = fromLocation
      ? rideLocations
          .filter((loc: any) => loc.fromLocation === fromLocation)
          .map((loc: any) => loc.toLocation)
          .filter((value, index, self) => self.indexOf(value) === index)
          .sort()
      : uniqueToLocations;

    return (
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionIcon}>🚗</Text>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Book a Ride</Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
          Select your route and confirm your ride
        </Text>

        <View style={styles.rideForm}>
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>📍</Text>
              <Text style={[styles.label, { color: colors.text }]}>From Location</Text>
            </View>
            <ScrollView 
              style={[styles.locationSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
              showsVerticalScrollIndicator={false}
            >
              {uniqueFromLocations.map((location: string) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationOption,
                    { borderColor: colors.border },
                    fromLocation === location && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    handleLocationSelect(location, '');
                    setToLocation('');
                  }}
                >
                  <Text style={styles.locationOptionIcon}>🚩</Text>
                  <Text style={[styles.locationOptionText, { color: colors.text, flex: 1 }]}>{location}</Text>
                  {fromLocation === location && (
                    <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>🎯</Text>
              <Text style={[styles.label, { color: colors.text }]}>To Location</Text>
            </View>
            <ScrollView 
              style={[styles.locationSelector, { backgroundColor: colors.background, borderColor: colors.border }]}
              showsVerticalScrollIndicator={false}
            >
              {availableToLocations.length === 0 ? (
                <View style={[styles.locationOption, { borderColor: colors.border }]}>
                  <Text style={styles.locationOptionIcon}>ℹ️</Text>
                  <Text style={[styles.locationOptionText, { color: colors.textSecondary }]}>
                    Select "From" location first
                  </Text>
                </View>
              ) : (
                availableToLocations.map((location: string) => (
                  <TouchableOpacity
                    key={location}
                    style={[
                      styles.locationOption,
                      { borderColor: colors.border },
                      toLocation === location && { backgroundColor: colors.primary + '20', borderColor: colors.primary },
                    ]}
                    onPress={() => handleLocationSelect(fromLocation, location)}
                  >
                    <Text style={styles.locationOptionIcon}>🏁</Text>
                    <Text style={[styles.locationOptionText, { color: colors.text, flex: 1 }]}>{location}</Text>
                    {toLocation === location && (
                      <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.checkIcon}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>

          {selectedFare !== null && (
            <View style={[styles.fareDisplay, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}>
              <View style={styles.fareIconContainer}>
                <Text style={styles.fareIcon}>💰</Text>
              </View>
              <View style={styles.fareTextContainer}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare</Text>
                <Text style={[styles.fareAmount, { color: colors.primary }]}>₹{selectedFare}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              { backgroundColor: colors.primary },
              (!fromLocation || !toLocation || !selectedFare) && styles.confirmButtonDisabled,
            ]}
            onPress={handleConfirmRide}
            disabled={!fromLocation || !toLocation || !selectedFare || isSubmittingRide}
          >
            {isSubmittingRide ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={[styles.confirmButtonText, { marginLeft: 8 }]}>Confirming...</Text>
              </>
            ) : (
              <>
                <Text style={styles.buttonIcon}>✓</Text>
                <Text style={styles.confirmButtonText}>Confirm Ride</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={[styles.tabText, { color: activeTab === 'profile' ? colors.primary : colors.textSecondary }, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
        {isDriver && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'qr' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('qr')}
          >
            <Text style={styles.tabIcon}>📱</Text>
            <Text style={[styles.tabText, { color: activeTab === 'qr' ? colors.primary : colors.textSecondary }, activeTab === 'qr' && styles.activeTabText]}>
              QR
            </Text>
          </TouchableOpacity>
        )}
        {isStudent && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'ride' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('ride')}
          >
            <Text style={styles.tabIcon}>🚗</Text>
            <Text style={[styles.tabText, { color: activeTab === 'ride' ? colors.primary : colors.textSecondary }, activeTab === 'ride' && styles.activeTabText]}>
              Ride
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bills' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('bills')}
        >
          <Text style={styles.tabIcon}>📄</Text>
          <Text style={[styles.tabText, { color: activeTab === 'bills' ? colors.primary : colors.textSecondary }, activeTab === 'bills' && styles.activeTabText]}>
            Bills
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'settings' && { borderBottomColor: colors.primary }]}
          onPress={() => setActiveTab('settings')}
        >
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={[styles.tabText, { color: activeTab === 'settings' ? colors.primary : colors.textSecondary }, activeTab === 'settings' && styles.activeTabText]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'settings' ? (
        <Settings
          user={user}
          onLogout={onLogout}
          onNavigateToProfile={() => setActiveTab('profile')}
        />
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >
          {activeTab === 'profile' && renderProfile()}
          {activeTab === 'qr' && renderQRCode()}
          {activeTab === 'ride' && renderRide()}
          {activeTab === 'bills' && renderRideBills()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    minHeight: 60,
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  verifiedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedIcon: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    marginTop: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    width: 32,
  },
  infoContent: {
    flex: 1,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  expiryContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  expiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiryBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
  },
  qrWrapper: {
    marginBottom: 20,
  },
  qrImage: {
    width: 250,
    height: 250,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonIcon: {
    fontSize: 18,
    marginRight: 8,
    color: '#fff',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  refreshIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  refreshButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  billCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billDateIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  billDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  billAmountContainer: {
    marginBottom: 12,
  },
  billAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  billRouteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  billRouteIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  billFrom: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  billTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  billTimeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  billTo: {
    fontSize: 13,
  },
  billNotesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
  },
  billNotesIcon: {
    fontSize: 14,
    marginRight: 6,
    marginTop: 2,
  },
  billNotes: {
    fontSize: 12,
    flex: 1,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  emptyState: {
    padding: 50,
    alignItems: 'center',
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    textAlign: 'center',
  },
  rideForm: {
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  locationSelector: {
    maxHeight: 180,
    borderWidth: 2,
    borderRadius: 12,
    padding: 6,
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1.5,
  },
  locationOptionIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  locationOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fareDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 2,
  },
  fareIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  fareIcon: {
    fontSize: 24,
  },
  fareTextContainer: {
    flex: 1,
  },
  fareLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fareAmount: {
    fontSize: 28,
    fontWeight: '700',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});


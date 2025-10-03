import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Office coordinates
const OFFICE_LOCATION = {
  latitude: 21.1458,
  longitude: 79.0882,
};

const GEOFENCE_RADIUS = 200; // meters

// Office location details
const OFFICE_INFO = {
  name: "Tech Park Office",
  address: "123 Business District, Nagpur, Maharashtra",
  radius: "200 meters"
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // Distance in meters
  return distance;
};

export default function HomeScreen() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isInOfficeArea, setIsInOfficeArea] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // Request location permission and get user's location
  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for geofencing');
        setLocationLoading(false);
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location.coords);
      checkIfInOfficeArea(location.coords);
      setLocationLoading(false);
    })();
  }, []);

  // Check if user is within office area
  const checkIfInOfficeArea = (coords: { latitude: any; longitude: any; altitude?: number | null; accuracy?: number | null; altitudeAccuracy?: number | null; heading?: number | null; speed?: number | null; }) => {
    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude
    );
    
    const withinArea = distance <= GEOFENCE_RADIUS;
    setIsInOfficeArea(withinArea);
    return withinArea;
  };

  // Refresh location and check area
  const refreshLocation = async () => {
    setLocationLoading(true);
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location.coords);
      const isInArea = checkIfInOfficeArea(location.coords);
      
      if (!isInArea) {
        Alert.alert(
          'Not in Office Area',
          `You are ${Math.round(calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            OFFICE_LOCATION.latitude,
            OFFICE_LOCATION.longitude
          ))}m away from office. Please come within ${GEOFENCE_RADIUS}m radius to check in.`,
          [{ text: 'OK', style: 'default' }]
        );
      }

      return isInArea;
    } catch (error) {
      Alert.alert('Error', 'Failed to get location');
      return false;
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCheckIn = async () => {
    // Refresh location and check if user is in office area
    const isInArea = await refreshLocation();
    
    // if (!isInArea) {
    //   return; // Don't proceed with check-in
    // }

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckInTime(now);
    setIsCheckedIn(true);
    Alert.alert('Success', `Checked in at ${now}`, [
      { text: 'OK', style: 'default' }
    ]);
  };

  const handleCheckOut = () => {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCheckOutTime(now);
    setIsCheckedIn(false);
    Alert.alert('Success', `Checked out at ${now}`, [
      { text: 'OK', style: 'default' }
    ]);
  };

  const calculateTotalHours = () => {
    if (checkInTime && checkOutTime) {
      return '8h 15m'; // Dummy calculation
    }
    return '--:--';
  };

  const getDistanceText = () => {
    if (!userLocation) return 'Getting location...';
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude
    );
    
    if (distance <= GEOFENCE_RADIUS) {
      return `You're in office area (${Math.round(distance)}m away)`;
    } else {
      return `You're ${Math.round(distance)}m away from office`;
    }
  };

  return (
    <View style={styles.container}>
      {/* Map Background */}
      <MapView
        style={styles.map}
        initialRegion={{
          ...OFFICE_LOCATION,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {/* Office geofence circle in green */}
        <Circle
          center={OFFICE_LOCATION}
          radius={GEOFENCE_RADIUS}
          strokeColor="rgba(76, 175, 80, 0.8)" // Green color
          fillColor="rgba(76, 175, 80, 0.2)"   // Light green fill
          strokeWidth={3}
        />
        
        {/* Office marker */}
        <Marker
          coordinate={OFFICE_LOCATION}
          title="Office Location"
          description="Your workplace - 200m radius"
        >
          <View style={styles.marker}>
            <Text style={styles.markerText}>🏢</Text>
          </View>
        </Marker>
      </MapView>

      {/* Overlay Content */}
      <View style={styles.overlay}>
        {/* Today's Summary with Location Info */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Hey, John!</Text>
          
          {/* Location Information */}
          <View style={styles.locationSection}>
            <View style={styles.locationDetails}>
              <Text style={styles.officeName}>📍{OFFICE_INFO.name}</Text>
              <Text style={styles.officeAddress}>{OFFICE_INFO.address}</Text>
              <View style={styles.radiusInfo}>
                <Text style={styles.radiusLabel}>Geofence Radius: </Text>
                <Text style={styles.radiusValue}>{OFFICE_INFO.radius}</Text>
              </View>
              
              {/* User location status */}
              <View style={[
                styles.locationStatus,
                isInOfficeArea ? styles.inOfficeStatus : styles.outOfOfficeStatus
              ]}>
                <Text style={styles.locationStatusText}>
                  {locationLoading ? 'Checking location...' : getDistanceText()}
                </Text>
                <Text style={styles.locationStatusEmoji}>
                  {isInOfficeArea ? '✅' : '📍'}
                </Text>
              </View>
            </View>
          </View>

          {/* Attendance Summary */}
          <View style={styles.attendanceSection}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Check In</Text>
                <Text style={styles.summaryValue}>{checkInTime || '--:--'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Check Out</Text>
                <Text style={styles.summaryValue}>{checkOutTime || '--:--'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Total Hours</Text>
                <Text style={styles.summaryValue}>{calculateTotalHours()}</Text>
              </View>
            </View>
          </View>

          {/* Current Status */}
          <View style={styles.statusSection}>
            <View style={[
              styles.statusBadge,
              isCheckedIn ? styles.checkedInBadge : styles.checkedOutBadge
            ]}>
              <Text style={styles.statusEmoji}>
                {isCheckedIn ? '✅' : '⏸️'}
              </Text>
              <Text style={styles.statusText}>
                {isCheckedIn ? 'Currently Checked In' : 'Currently Checked Out'}
              </Text>
            </View>
          </View>
        </View>

        {/* Check In/Out Button */}
        <TouchableOpacity
          style={[
            styles.floatingActionButton,
            isCheckedIn ? styles.checkOutFAB : styles.checkInFAB,
            locationLoading && styles.disabledFAB
          ]}
          onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
          disabled={locationLoading}
        >
          <LinearGradient
            colors={
              locationLoading 
                ? ['#cccccc', '#999999']
                : isCheckedIn 
                  ? ['#FF6B6B', '#FF5252'] 
                  : ['#667eea', '#764ba2']
            }
            style={styles.fabGradient}
          >
            <Text style={styles.fabText}>
              {locationLoading ? 'Checking...' : (isCheckedIn ? 'Check Out' : 'Check In')}
            </Text>
            <Text style={styles.fabEmoji}>
              {locationLoading ? '⏳' : (isCheckedIn ? '📤' : '📥')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    paddingTop: 50,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  // Location Section Styles
  locationSection: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  locationDetails: {
    marginLeft: 6,
  },
  officeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 4,
  },
  officeAddress: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  radiusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  radiusLabel: {
    fontSize: 12,
    color: '#666',
  },
  radiusValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#667eea',
  },
  // Location Status
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  inOfficeStatus: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  outOfOfficeStatus: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  locationStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  locationStatusEmoji: {
    fontSize: 14,
    marginLeft: 8,
  },
  // Attendance Section
  attendanceSection: {
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  // Status Section
  statusSection: {
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  checkedInBadge: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  checkedOutBadge: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  statusEmoji: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  marker: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4CAF50', // Green border for office
  },
  markerText: {
    fontSize: 16,
  },
  // Floating Action Button Styles
  floatingActionButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    minWidth: 140,
  },
  disabledFAB: {
    opacity: 0.7,
  },
  checkOutFAB: {
    backgroundColor: '#FF6B6B', // Example color for check-out button
  },
  checkInFAB: {
    backgroundColor: '#667eea', // Example color for check-in button
  },
  fabGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabEmoji: {
    fontSize: 20,
  },
  fabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
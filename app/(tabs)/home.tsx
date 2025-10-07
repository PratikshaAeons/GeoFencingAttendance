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
  Animated,
} from 'react-native';
import MapView, { Circle, Marker } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

// Office coordinates - Real coordinates
// const OFFICE_LOCATION = {
//   latitude: 21.12880603727172,
//   longitude: 79.05808101933607,
// };

// Office coordinates - For testing
const OFFICE_LOCATION = {
  latitude: 37.785834,
  longitude: -122.406417,
};

const GEOFENCE_RADIUS = 200;

const OFFICE_INFO = {
  name: "Tech Park Office",
  address: "123 Business District, Nagpur, Maharashtra",
  radius: "200 meters"
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  const distance = R * c;
  return distance;
};

// Function to calculate time difference between check-in and check-out
const calculateTimeDifference = (checkInTime: string | null, checkOutTime: string | null) => {
  if (!checkInTime || !checkOutTime) return null;

  const [inHours, inMinutes] = checkInTime.split(':').map(Number);
  const [outHours, outMinutes] = checkOutTime.split(':').map(Number);

  const today = new Date();
  const checkInDate = new Date(today);
  checkInDate.setHours(inHours, inMinutes, 0, 0);
  
  const checkOutDate = new Date(today);
  checkOutDate.setHours(outHours, outMinutes, 0, 0);

  if (checkOutDate < checkInDate) {
    checkOutDate.setDate(checkOutDate.getDate() + 1);
  }

  const diffMs = checkOutDate.getTime() - checkInDate.getTime();
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  return { hours: diffHours, minutes: diffMinutes };
};

// const formatTimeDifference = (checkInTime: string | null, checkOutTime: string | null) => {
//   const diff = calculateTimeDifference(checkInTime, checkOutTime);
  
//   if (!diff) return '--:--';
  
//   return `${diff.hours}h ${diff.minutes}m`;
// };

export default function HomeScreen() {
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [checkOutTime, setCheckOutTime] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [isInOfficeArea, setIsInOfficeArea] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [exactDistance, setExactDistance] = useState<number | null>(null);
  const [isLocationSectionVisible, setIsLocationSectionVisible] = useState(true);
  const [animation] = useState(new Animated.Value(1));

  useEffect(() => {
    let locationSub: Location.LocationSubscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Permission is required.');
        return;
      }

      locationSub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          setUserLocation(loc.coords);
          checkIfInOfficeArea(loc.coords);
        }
      );
    })();

    return () => {
      locationSub?.remove();
    };
  }, []);

  const toggleLocationSection = () => {
    if (isLocationSectionVisible) {
      // Collapse animation
      Animated.timing(animation, {
        toValue: 0,
        duration: 10,
        useNativeDriver: false,
      }).start(() => {
        setIsLocationSectionVisible(false);
      });
    } else {
      // Expand animation
      setIsLocationSectionVisible(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 10,
        useNativeDriver: false,
      }).start();
    }
  };

  const checkIfInOfficeArea = (coords: { latitude: number; longitude: number }) => {
    const distance = calculateDistance(
      coords.latitude,
      coords.longitude,
      OFFICE_LOCATION.latitude,
      OFFICE_LOCATION.longitude
    );
    
    setExactDistance(distance);
    const withinArea = distance <= GEOFENCE_RADIUS;
    setIsInOfficeArea(withinArea);
    return withinArea;
  };

  const refreshLocation = async () => {
    setLocationLoading(true);
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      setUserLocation(location.coords);
      const isInArea = checkIfInOfficeArea(location.coords);
      
      if (!isInArea && exactDistance !== null) {
        Alert.alert(
          'Not in Office Area',
          `You are ${Math.round(exactDistance)}m away from office. Please come within ${GEOFENCE_RADIUS}m radius to check in.`,
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
    const isInArea = await refreshLocation();
    
    if (!isInArea) {
      return;
    }

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
    // return formatTimeDifference(checkInTime, checkOutTime);
    return "2h 20m"; // Placeholder
  };

  const getDistanceText = () => {
    if (!userLocation || exactDistance === null) return 'Getting location...';
    
    if (exactDistance <= GEOFENCE_RADIUS) {
      return `You're in office area `;
    } else {
      return `You're ${Math.round(exactDistance)}m away from office`;
    }
  };

  const animatedHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animatedOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.container}>
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
        <Circle
          center={OFFICE_LOCATION}
          radius={GEOFENCE_RADIUS}
          strokeColor="rgba(76, 175, 80, 0.8)"
          fillColor="rgba(76, 175, 80, 0.2)"
          strokeWidth={3}
        />
        
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

      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.summaryCard}
          activeOpacity={0.9}
          onPress={toggleLocationSection}
        >
          <View style={styles.headerSection}>
            <Text style={styles.summaryTitle}>Hey, Pratiksha!</Text>
            <View style={styles.chevronContainer}>
              <Text style={styles.chevron}>
                {isLocationSectionVisible ? '▼' : '▲'}
              </Text>
            </View>
          </View>
          
          {/* Collapsible Location Section */}
          {isLocationSectionVisible && (
            <Animated.View 
              style={[
                styles.locationSection,
                // {
                //   opacity: animatedOpacity,
                //   // transform: [{ scale: animatedOpacity }]
                // }
              ]}
            >
              <View style={styles.locationDetails}>
                <Text style={styles.officeName}>📍{OFFICE_INFO.name}</Text>
                <Text style={styles.officeAddress}>{OFFICE_INFO.address}</Text>
                <View style={styles.radiusInfo}>
                  <Text style={styles.radiusLabel}>Geofence Radius: </Text>
                  <Text style={styles.radiusValue}>{OFFICE_INFO.radius}</Text>
                </View>
                
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

                {/* {userLocation && (
                  <View style={styles.coordinatesContainer}>
                    <Text style={styles.coordinatesTitle}>Your Current Location:</Text>
                    <View style={styles.coordinatesRow}>
                      <Text style={styles.coordinateLabel}>Latitude: </Text>
                      <Text style={styles.coordinateValue}>
                        {userLocation.latitude.toFixed(6)}
                      </Text>
                    </View>
                    <View style={styles.coordinatesRow}>
                      <Text style={styles.coordinateLabel}>Longitude: </Text>
                      <Text style={styles.coordinateValue}>
                        {userLocation.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>
                )} */}
              </View>
            </Animated.View>
          )}

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
        </TouchableOpacity>

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
                  : ['#1E7A85', '#1E3E63']
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
    top: 10,
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
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chevronContainer: {
    padding: 8,
  },
  chevron: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: 'bold',
  },
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
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 12,
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
  coordinatesContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  coordinatesTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  coordinateLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    width: 70,
  },
  coordinateValue: {
    fontSize: 11,
    color: '#333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
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
    borderColor: '#4CAF50',
  },
  markerText: {
    fontSize: 16,
  },
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
    backgroundColor: '#FF6B6B',
  },
  checkInFAB: {
    backgroundColor: '#667eea',
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
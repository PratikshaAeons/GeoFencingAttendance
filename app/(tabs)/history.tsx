import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Dummy history data
const dummyHistory = [
  { id: '1', date: '2024-01-15', checkIn: '09:05', checkOut: '18:15', status: 'present', hours: '9h 10m' },
  { id: '2', date: '2024-01-14', checkIn: '08:55', checkOut: '17:45', status: 'present', hours: '8h 50m' },
  { id: '3', date: '2024-01-13', checkIn: '09:15', checkOut: '17:30', status: 'present', hours: '8h 15m' },
  { id: '4', date: '2024-01-12', checkIn: '09:00', checkOut: '13:00', status: 'half-day', hours: '4h 0m' },
  { id: '5', date: '2024-01-11', checkIn: '--:--', checkOut: '--:--', status: 'absent', hours: '0h 0m' },
  { id: '6', date: '2024-01-10', checkIn: '08:45', checkOut: '18:30', status: 'present', hours: '9h 45m' },
  { id: '7', date: '2024-01-09', checkIn: '09:10', checkOut: '17:55', status: 'present', hours: '8h 45m' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'present': return '#4CAF50';
    case 'absent': return '#FF6B6B';
    case 'half-day': return '#FFA500';
    default: return '#666';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'present': return 'check-circle';
    case 'absent': return 'cancel';
    case 'half-day': return 'schedule';
    default: return 'help';
  }
};

export default function HistoryScreen() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Attendance History</Text>
        <Text style={styles.subtitle}>Your recent attendance records</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {dummyHistory.map((item) => (
          <TouchableOpacity key={item.id} style={styles.historyCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <MaterialIcons 
                  name={getStatusIcon(item.status)} 
                  size={16} 
                  color="white" 
                />
                <Text style={styles.statusText}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.timeContainer}>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Check In</Text>
                <Text style={styles.timeValue}>{item.checkIn}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Check Out</Text>
                <Text style={styles.timeValue}>{item.checkOut}</Text>
              </View>
              <View style={styles.timeItem}>
                <Text style={styles.timeLabel}>Total</Text>
                <Text style={styles.timeValue}>{item.hours}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#565656',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
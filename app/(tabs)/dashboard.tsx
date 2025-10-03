// import { FontAwesome } from '@expo/vector-icons';
// import { router } from 'expo-router';
// import React, { useState } from 'react';
// import {
//     Alert,
//     ScrollView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from 'react-native';

// export default function DashboardScreen() {
//   const [isCheckedIn, setIsCheckedIn] = useState(false);
//   const [checkInTime, setCheckInTime] = useState<string | null>(null);
//   const [checkOutTime, setCheckOutTime] = useState<string | null>(null);

//   const handleCheckIn = () => {
//     const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     setCheckInTime(now);
//     setIsCheckedIn(true);
//     Alert.alert('Success', `Checked in at ${now}`);
//   };

//   const handleCheckOut = () => {
//     const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     setCheckOutTime(now);
//     setIsCheckedIn(false);
//     Alert.alert('Success', `Checked out at ${now}`);
//   };

//   const navigateToProfile = () => {
//     router.push('/profile');
//   };

//   return (
//     <ScrollView style={styles.container}>
//       {/* Header with Profile */}
//       <View style={styles.header}>
//         <Text style={styles.greeting}>Hello, John Doe!</Text>
//         <TouchableOpacity onPress={navigateToProfile}>
//           <FontAwesome name="user-circle" size={32} color="#007AFF" />
//         </TouchableOpacity>
//       </View>

//       {/* Status Card */}
//       <View style={[styles.statusCard, isCheckedIn ? styles.checkedInCard : styles.checkedOutCard]}>
//         <FontAwesome 
//           name={isCheckedIn ? "check-circle" : "clock-o"} 
//           size={48} 
//           color={isCheckedIn ? "#4CAF50" : "#FF6B6B"} 
//         />
//         <Text style={styles.statusText}>
//           {isCheckedIn ? "You're CHECKED IN" : "You're CHECKED OUT"}
//         </Text>
//         <Text style={styles.statusSubText}>
//           {isCheckedIn ? "Have a productive day!" : "Ready to check in?"}
//         </Text>
//       </View>

//       {/* Check In/Out Button */}
//       <TouchableOpacity
//         style={[styles.actionButton, isCheckedIn ? styles.checkOutButton : styles.checkInButton]}
//         onPress={isCheckedIn ? handleCheckOut : handleCheckIn}
//       >
//         <Text style={styles.actionButtonText}>
//           {isCheckedIn ? "CHECK OUT" : "CHECK IN"}
//         </Text>
//       </TouchableOpacity>

//       {/* Today's Summary */}
//       <View style={styles.summaryCard}>
//         <Text style={styles.summaryTitle}>Today's Summary</Text>
//         <View style={styles.summaryRow}>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>Check In</Text>
//             <Text style={styles.summaryValue}>{checkInTime || '--:--'}</Text>
//           </View>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>Check Out</Text>
//             <Text style={styles.summaryValue}>{checkOutTime || '--:--'}</Text>
//           </View>
//           <View style={styles.summaryItem}>
//             <Text style={styles.summaryLabel}>Total Hours</Text>
//             <Text style={styles.summaryValue}>
//               {checkInTime && checkOutTime ? '8h 0m' : '--:--'}
//             </Text>
//           </View>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f5f5f5',
//     padding: 16,
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   greeting: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#333',
//   },
//   statusCard: {
//     alignItems: 'center',
//     padding: 32,
//     borderRadius: 16,
//     marginBottom: 24,
//   },
//   checkedInCard: {
//     backgroundColor: '#E8F5E8',
//   },
//   checkedOutCard: {
//     backgroundColor: '#FFEBEE',
//   },
//   statusText: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   statusSubText: {
//     fontSize: 14,
//     color: '#666',
//   },
//   actionButton: {
//     padding: 20,
//     borderRadius: 12,
//     alignItems: 'center',
//     marginBottom: 24,
//   },
//   checkInButton: {
//     backgroundColor: '#007AFF',
//   },
//   checkOutButton: {
//     backgroundColor: '#FF6B6B',
//   },
//   actionButtonText: {
//     color: 'white',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   summaryCard: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   summaryTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     color: '#333',
//   },
//   summaryRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   summaryItem: {
//     alignItems: 'center',
//   },
//   summaryLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 4,
//   },
//   summaryValue: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
// });
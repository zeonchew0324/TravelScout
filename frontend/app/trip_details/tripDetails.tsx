import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

const trips = [
  {
    id: 1,
    title: 'Malaysia Trip',
    date: 'Thu 12 January - Sun 15 January',
    image: 'https://via.placeholder.com/100',
    description: 'A fun-filled adventure exploring Malaysia’s vibrant culture and food.',
    schedule: [
      { time: '08:00 ', activity: 'Breakfast at a local café' },
      { time: '10:00 ', activity: 'Visit Petronas Towers' },
      { time: '13:00 ', activity: 'Lunch at Jalan Alor' },
      { time: '16:00 ', activity: 'Batu Caves exploration' },
      { time: '19:00 ', activity: 'Dinner and night market stroll' },
    ],
  },
  {
    id: 2,
    title: 'Mars Trip',
    date: 'Thu 12 January - Sun 15 January',
    image: 'https://via.placeholder.com/100',
    description: 'An intergalactic journey to Mars, experiencing zero gravity and more.',
    schedule: [
      { time: '08:00 ', activity: 'Breakfast at a local café' },
      { time: '10:00 ', activity: 'Visit Petronas Towers' },
      { time: '13:00 ', activity: 'Lunch at Jalan Alor' },
      { time: '16:00 ', activity: 'Batu Caves exploration' },
      { time: '19:00 ', activity: 'Dinner and night market stroll' },
    ],
  },
];

const TripDetails = () => {
  const { id } = useLocalSearchParams(); 
  const navigation = useNavigation();
  const trip = trips.find((t) => t.id === Number(id)); // Find trip by ID

  useEffect(() => {
    if (trip) {
      navigation.setOptions({
        title: trip.title, // Use the trip's title as the header name
      });
    }
  }, [navigation, trip]);

  if (!trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Trip not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={{ uri: trip.image }} style={styles.image} />
        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.date}>{trip.date}</Text>
        <Text style={styles.scheduleTitle}>Itinerary - Thu 12 January</Text>
        {trip.schedule.map((event, index) => (
          <View key={index} style={styles.scheduleItem}>
            <Text style={styles.scheduleTime}>{event.time}</Text>
            <Text style={styles.scheduleActivity}>{event.activity}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    width: '90%',
    borderRadius: 10,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'left',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
    alignSelf: 'left',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    flexDirection: 'row',
    width: '100%',
    borderRadius  : 10,
    paddingTop: 5,
    paddingLeft: 10,
    paddingBottom: 5,
    paddingRight: 10,
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 5,
    marginTop: 15,
    marginBottom: 15,
  },
  scheduleTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  scheduleActivity: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    textAlign: 'right',
  },
});

export default TripDetails;
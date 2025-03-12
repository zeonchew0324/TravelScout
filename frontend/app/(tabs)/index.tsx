import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { useTrips } from '../tripsContext'; // Import useTrips

const HomePage = () => {
  const { trips } = useTrips(); // Fetch trips from the context

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>My Trips</Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={styles.tabActive}>
          <Text style={styles.tabText}>Upcoming</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Trip Cards */}
      {trips.map((trip) => (
        <View key={trip.id} style={styles.card}>
          <Image source={{ uri: trip.image }} style={styles.image} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{trip.title}</Text>
            <Text style={styles.cardDate}>{trip.date}</Text>
          </View>
        </View>
      ))}

      <View style={styles.fabContainer}>
        <Pressable
          style={styles.fab}
          onPress={() => router.push('./add-trip')}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Bottom Chat Icon */}
      <View style={styles.chatIcon}>
        <Text>🤖</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  tabActive: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#D3D3D3',
    borderRadius: 20,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  tabText: {
    fontSize: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  cardContent: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDate: {
    fontSize: 14,
    color: '#666',
  },
  chatIcon: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#D3D3D3',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 105,
    right: 20,
  },
  fab: {
    backgroundColor: '#007AFF',
    width: 70,
    height: 70,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export default HomePage;

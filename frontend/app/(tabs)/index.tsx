import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

const HomePage = () => {
  // Sample trip data
  const trips = [
    {
      id: 1,
      title: 'Malaysia Trip',
      date: 'Thu 12 January - Sun 15 January',
      image: 'https://via.placeholder.com/100', // Replace with your Eiffel Tower image URL
    },
    {
      id: 2,
      title: 'Mars Trip',
      date: 'Thu 12 January - Sun 15 January',
      image: 'https://via.placeholder.com/100', // Replace with your Mars image URL
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header with Time */}
      <View style={styles.header}>
        <Text style={styles.time}>9:41</Text>
        <Text style={styles.status}>📱🔋</Text> {/* Placeholder for signal and battery */}
      </View>

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

      {/* Bottom Chat Icon (Placeholder) */}
      <View style={styles.chatIcon}>
        {/* You can add an icon library like react-native-vector-icons */}
        <Text>🤖</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA', // Light blue background
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 18,
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
});

export default HomePage;
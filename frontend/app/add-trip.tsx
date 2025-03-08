import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import AntDesign from '@expo/vector-icons/AntDesign';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import CalendarPicker from "react-native-calendar-picker";
import dayjs from 'dayjs';

// Define the shape of the form data
interface FormData {
  destination: string;
  date: string;
  groupType: string;
  budgetPreference: string;
  travelStyle: string;
  dietaryRestriction: string;
}

// Dropdown data options
const groupTypeData = [
  { label: 'Solo', value: 'solo' },
  { label: 'Partner', value: 'partner' },
  { label: 'Friends', value: 'friends' },
  { label: 'Family', value: 'family' },
];

const budgetPreferenceData = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const travelStyleData = [
  { label: 'Relaxation', value: 'relaxation' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Culture', value: 'culture' },
  { label: 'Foodie', value: 'foodie' },
];

export default function AddTripScreen() {
  const navigation = useNavigation();

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    date: '',
    groupType: 'solo',
    budgetPreference: 'low',
    travelStyle: 'relaxation',
    dietaryRestriction: '',
  });

  // Focus states for dropdowns
  const [isGroupTypeFocused, setIsGroupTypeFocused] = useState(false);
  const [isBudgetFocused, setIsBudgetFocused] = useState(false);
  const [isTravelStyleFocused, setIsTravelStyleFocused] = useState(false);

  // Map-related states
  const [mapRegion, setMapRegion] = useState({
    latitude: 37.78825, // Default to San Francisco
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);


  // Calendar-related states
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  // Add type for the handleChange function
  const handleChange = (name: keyof FormData, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  // Add type for the handleSubmit function
  const handleSubmit = () => {
    const jsonData = JSON.stringify(formData, null, 2);
    console.log('Form Data Submitted:', jsonData);
    alert('Trip added! Check console for JSON data.');
    navigation.goBack();
  };

  // Initialize map with user's location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  // Handle map press to set marker and destination
  const handleMapPress = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    // In a real app, use reverse geocoding (e.g., Google Maps API) to get the location name
    handleChange('destination', `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
  };

  // Handle date change with 7-day max range validation
  const onDateChange = (date: Date, type: 'START_DATE' | 'END_DATE') => {
    if (type === 'END_DATE') {
      if (selectedStartDate) {
        const start = dayjs(selectedStartDate);
        const end = dayjs(date);
        const diffDays = end.diff(start, 'day');

        if (diffDays > 7) {
          alert('The date range cannot exceed 7 days.');
          return;
        }
        setSelectedEndDate(date);
        const formattedDate = `${start.format('ddd DD MMM')} - ${end.format('ddd DD MMM')}`;
        handleChange('date', formattedDate);
      }
    } else {
      setSelectedStartDate(date);
      setSelectedEndDate(null); // Reset end date when selecting a new start date
      handleChange('date', dayjs(date).format('ddd DD MMM'));
    }
  };

  // Render label for dropdowns
  const renderLabel = (label: string, isFocused: boolean, value: string) => {
    if (value || isFocused) {
      return (
        <Text style={[styles.dropdownLabel, isFocused && { color: '#007AFF' }]}>
          {label}
        </Text>
      );
    }
    return null;
  };

  //List of popular cities
  const popularDestinations = [
    'New York, USA', 'London, UK', 'Paris, France', 'Tokyo, Japan', 
    'Singapore', 'Dubai, UAE', 'Rome, Italy'
  ];

  //Destination Dropdown
  const [isDestinationFocused, setIsDestinationFocused] = useState(false);


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Add New Trip</Text>
        </View>
        <View style={styles.card}>
          {/* Destination with Map Selection */}
          <Text style={styles.label}>Destination</Text>
        
          <Dropdown
            style={[styles.dropdown, isDestinationFocused && { borderColor: '#007AFF' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={popularDestinations.map((city) => ({ label: city, value: city }))}
            maxHeight={400}
            labelField="label"
            valueField="value"
            placeholder={!isDestinationFocused ? 'Select Destination' : '...'}
            value={formData.destination}
            onFocus={() => setIsDestinationFocused(true)}
            onBlur={() => setIsDestinationFocused(false)}
            onChange={(item) => {
                handleChange('destination', item.value);
                setIsDestinationFocused(false);
            }}
            renderLeftIcon={() => (
                <AntDesign
                style={styles.icon}
                color={isDestinationFocused ? '#007AFF' : 'black'}
                name="enviromento" 
                size={20}
                />
            )}
            />

    
          {/* Date with Calendar Picker */}
          <Text style={styles.label}>Date (e.g., Thu 12 Jan - Sun 15 Jan)</Text>
          <TouchableOpacity onPress={() => setCalendarModalVisible(true)}>
            <View pointerEvents='none'>
                <TextInput
                style={styles.input}
                placeholder="Tap to select date range"
                value={formData.date}
                editable={false}
                />
            </View>
          </TouchableOpacity>

          {/* Calendar Modal */}
          <Modal visible={calendarModalVisible} animationType="slide" transparent={true}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                <CalendarPicker
                    allowRangeSelection={true}
                    minDate={new Date()}
                    maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
                    onDateChange={onDateChange}
                    selectedDayColor="#007AFF"
                    selectedDayTextColor="#FFFFFF"
                    todayBackgroundColor="#E6F0FA"
                />
                <Button title="Confirm Date Range" onPress={() => setCalendarModalVisible(false)} />
                <Button title="Cancel" onPress={() => setCalendarModalVisible(false)} />
                </View>
            </View>
        </Modal>


          {/* Group Type */}
          <Text style={styles.label}>Group Type</Text>
          <Dropdown
            style={[styles.dropdown, isGroupTypeFocused && { borderColor: '#007AFF' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={groupTypeData}
            search
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={!isGroupTypeFocused ? 'Select Group Type' : '...'}
            searchPlaceholder="Search..."
            value={formData.groupType}
            onFocus={() => setIsGroupTypeFocused(true)}
            onBlur={() => setIsGroupTypeFocused(false)}
            onChange={(item) => {
              handleChange('groupType', item.value);
              setIsGroupTypeFocused(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isGroupTypeFocused ? '#007AFF' : 'black'}
                name="Safety"
                size={20}
              />
            )}
          />

          {/* Budget Preference */}
          <Text style={styles.label}>Budget Preference</Text>
          <Dropdown
            style={[styles.dropdown, isBudgetFocused && { borderColor: '#007AFF' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={budgetPreferenceData}
            search
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={!isBudgetFocused ? 'Select Budget Preference' : '...'}
            searchPlaceholder="Search..."
            value={formData.budgetPreference}
            onFocus={() => setIsBudgetFocused(true)}
            onBlur={() => setIsBudgetFocused(false)}
            onChange={(item) => {
              handleChange('budgetPreference', item.value);
              setIsBudgetFocused(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isBudgetFocused ? '#007AFF' : 'black'}
                name="Safety"
                size={20}
              />
            )}
          />

          {/* Travel Style */}
          <Text style={styles.label}>Travel Style</Text>
          <Dropdown
            style={[styles.dropdown, isTravelStyleFocused && { borderColor: '#007AFF' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={travelStyleData}
            search
            maxHeight={200}
            labelField="label"
            valueField="value"
            placeholder={!isTravelStyleFocused ? 'Select Travel Style' : '...'}
            searchPlaceholder="Search..."
            value={formData.travelStyle}
            onFocus={() => setIsTravelStyleFocused(true)}
            onBlur={() => setIsTravelStyleFocused(false)}
            onChange={(item) => {
              handleChange('travelStyle', item.value);
              setIsTravelStyleFocused(false);
            }}
            renderLeftIcon={() => (
              <AntDesign
                style={styles.icon}
                color={isTravelStyleFocused ? '#007AFF' : 'black'}
                name="Safety"
                size={20}
              />
            )}
          />

          {/* Dietary Restriction */}
          <Text style={styles.label}>Dietary Restriction</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Vegetarian, Gluten-Free"
            value={formData.dietaryRestriction}
            onChangeText={(value: string) => handleChange('dietaryRestriction', value)}
          />

          <Button title="Save Trip" onPress={handleSubmit} color="#007AFF" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  card: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#F9F9F9',
  },
  dropdown: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 8,
    backgroundColor: '#F9F9F9',
    marginBottom: 15,
  },
  dropdownLabel: {
    position: 'absolute',
    backgroundColor: '#FFF',
    left: 22,
    top: -8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#333',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  map: {
    flex: 1,
    height: '80%',
  },
  modalContainer: {
    backgroundColor: 'white',
    flex: 1,
    padding: 20,
    marginTop: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    alignItems: 'center',
  },
});
import { StyleSheet, Image, Platform, View, Text, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTrips } from '../tripsContext';

export default function TabTwoScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const { trips, addTrip } = useTrips();

  useEffect(() => {
    setMessages(['Bot: Hi there! How can I help you today?']);
  }, []);

  const handleSend = () => {
      if (message.trim()) {
        setMessages([...messages, `You: ${message}`, `Bot: Got it!`]);
  
        // Add a new trip when Send is clicked
        const newTrip = {
          id: 3,
          title: `New Trip`,
          date: 'Fri 20 January - Mon 23 January',
          image: 'https://via.placeholder.com/100', // Replace with an actual image URL
        };
  
        addTrip(newTrip);
  
        setMessage('');
      }
    };

  return (
    <View style={styles.container}>
      <ThemedView style={styles.chatbotContainer}>
        <ThemedText type="title" style={styles.title}>Live Chatbot</ThemedText>

        {/* Chat messages */}
        <ScrollView style={styles.chatMessages}>
          {messages.map((msg, index) => (
            <View key={index} style={msg.startsWith('You:') ? styles.userMessage : styles.botMessage}>
              <Text style={msg.startsWith('You:') ? styles.userText : styles.botText}>
                {msg}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Input and send button */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="Type your message"
            placeholderTextColor="#A3A3A3"
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    height: '92%',
    backgroundColor: '#E6F0FA', 
    paddingTop: 50,
  },
  chatbotContainer: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  chatMessages: {
    flex: 1,
    marginBottom: 10,
    paddingBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6', 
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E4E6EB', // Light gray for bot messages
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  userText: {
    fontSize: 16,
    color: '#333',
  },
  botText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    padding: 10,
    width: '80%',
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4CAF50', 
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
});
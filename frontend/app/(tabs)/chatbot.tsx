import { StyleSheet, Platform, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const sessionId = "e5e96868-69ba-49a4-a34e-1c969f0b0407"; // Hardcoded for now; ideally passed as a prop or from context

  // Fetch chat history from backend when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/chat/history/${sessionId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }

        const data = await response.json();
        if (data.status === 'success') {
          // Map backend data to frontend format
          const formattedMessages = data.history.map(msg => 
            `${msg.role === 'user' ? 'You' : 'Bot'}: ${msg.message}`
          );
          setMessages(formattedMessages);
        } else {
          console.error('Error from backend:', data.error);
        }
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };

    fetchChatHistory();
  }, [sessionId]); // Dependency array includes sessionId; re-fetch if it changes

  const handleSend = () => {
    if (message.trim()) {
      const userMessage = `You: ${message}`;
      const botMessage = `Bot: ${message}`; // Placeholder; replace with actual bot response later
      setMessages([...messages, userMessage, botMessage]);
      setMessage('');
      // Optionally, send the message to the backend here (POST request)
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
    backgroundColor: '#E4E6EB',
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
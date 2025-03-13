import { StyleSheet, Platform, View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const sessionId = "b81de319-6f9e-48e8-a212-2429f720d85a"; // Hardcoded for now; ideally passed as a prop or from context

  // Fetch chat history from backend when component mounts
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await fetch(`https://travelscout-87zx.onrender.com/chat/history/${sessionId}`, {
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

  const handleSend = async () => {
    if (message.trim()) {
      // Add user's message to the chat immediately
      const userMessage = `You: ${message}`;
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setMessage(''); // Clear input field
  
      try {
        // Send message to backend
        const response = await fetch(`https://travelscout-87zx.onrender.com/chat/message/${sessionId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: sessionId,  // Include sessionId if required by your Flask route
            content: message,     // Match backend's expected 'content' key
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        if (data.status === 'success') {
          // Add bot's response to the chat
          const botMessage = `Bot: ${data.response}`;
          setMessages((prevMessages) => [...prevMessages, botMessage]);
        } else {
          console.error('Backend error:', data.error);
          const errorMessage = `Bot: Sorry, something went wrong: ${data.error}`;
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        }
      } catch (error) {
        console.error('Fetch error:', error);
        const errorMessage = `Bot: Oops, I couldn’t connect to the server.`;
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      }
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
import { StyleSheet, Image, Platform, View, Text, TouchableOpacity, TextInput, ScrollView} from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import axios from 'axios';

const API_URL = "http://127.0.0.1:5000";
const sessionId = "b81de319-6f9e-48e8-a212-2429f720d85a";

export default function TabTwoScreen() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/chat/history/${sessionId}`)
      .then(response => {
        console.log("Chat history response:", response.data); 
  
        if (response.data.messages) {
          setMessages(response.data.messages.map(msg => `${msg.sender}: ${msg.content}`));
        } else {
          console.error("No messages found in response:", response.data);
        }
      })
      .catch(error => console.error("Error fetching chat history:", error.response ? error.response.data : error));
  }, []);
  

  const handleSend = async () => {
    if (!message.trim()) return;
  
    try {
      const response = await axios.post(
        `${API_URL}/chat/message/${sessionId}`,
        { content: message },
        { headers: { "Content-Type": "application/json" } }
      );
  
      setMessages([...messages, `You: ${message}`, `Bot: ${response.data.reply || "..."}`]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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
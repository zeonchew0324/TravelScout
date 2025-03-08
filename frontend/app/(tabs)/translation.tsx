import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import axios from 'axios';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';

const API_KEY = 'AIzaSyCmCvyAaN_ZJvly2JKA2y2b0-q-UZoYMdk'; // Replace with your Google Cloud API key

const supportedLanguages = [
  { code: 'en-US', name: 'English' },
  { code: 'zh-CN', name: 'Chinese' },
  { code: 'es-ES', name: 'Spanish' },
];

const voiceNames = {
  'en-US': 'en-US-Wavenet-D',
  'zh-CN': 'zh-CN-Wavenet-A',
  'es-ES': 'es-ES-Wavenet-A',
};

export default function App() {
  const [recording, setRecording] = useState(null);
  const [transcribedText, setTranscribedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en-US');
  const [targetLang, setTargetLang] = useState('zh-CN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSourceLangModal, setShowSourceLangModal] = useState(false);
  const [showTargetLangModal, setShowTargetLangModal] = useState(false);

  const volumeGainDb = 15; // Fixed volume gain in dB (adjust as needed, 0 to 15 recommended)

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access microphone is required!');
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recordingOptions = {
      android: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM,
        audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
      ios: {
        extension: '.wav',
        outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
        audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
        sampleRate: 44100,
        numberOfChannels: 1,
        bitRate: 128000,
      },
    };

    const newRecording = new Audio.Recording();
    try {
      await newRecording.prepareToRecordAsync(recordingOptions);
      await newRecording.startAsync();
      setRecording(newRecording);
      setTranscribedText('');
      setTranslatedText('');
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) {
        processAudio(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const readFileAsBase64 = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const transcribeAudio = async (audioUri) => {
    setIsProcessing(true);
    const base64Audio = await readFileAsBase64(audioUri);
    const data = {
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 44100,
        languageCode: sourceLang,
      },
      audio: {
        content: base64Audio,
      },
    };

    try {
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${API_KEY}`,
        data
      );
      const transcript =
        response.data.results?.[0]?.alternatives?.[0]?.transcript || 'Transcription failed';
      setTranscribedText(transcript);
      setIsProcessing(false);
      console.log('Transcription successful:', transcript);
      return transcript;
    } catch (error) {
      console.error('Transcription error:', error.response?.data || error.message);
      setTranscribedText('Error transcribing audio');
      setIsProcessing(false);
      return null;
    }
  };

  const translateText = async (text) => {
    if (!text) return null;
    try {
      const response = await axios.get(
        `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
        {
          params: {
            q: text,
            source: sourceLang.split('-')[0],
            target: targetLang.split('-')[0],
          },
        }
      );
      const translated = response.data.data.translations[0].translatedText;
      setTranslatedText(translated);
      console.log('Translation successful:', translated);
      return translated;
    } catch (error) {
      console.error('Translation error:', error.response?.data || error.message);
      setTranslatedText('Error translating text');
      setIsProcessing(false);
      return null;
    }
  };

  const synthesizeSpeech = async (text) => {
    if (!text) {
      console.log('No text to synthesize');
      return null;
    }
    const voiceName = voiceNames[targetLang];
    if (!voiceName) {
      console.error('No voice name found for language:', targetLang);
      return null;
    }
    const data = {
      input: { text },
      voice: {
        languageCode: targetLang,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        pitch: 1,
        effectsProfileId: 'small-bluetooth-speaker-class-device',
        volumeGainDb: volumeGainDb, // Fixed volume gain applied here
      },
    };

    try {
      console.log('Sending TTS request with data:', JSON.stringify(data, null, 2));
      const response = await axios.post(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
        data
      );
      const audioContent = response.data.audioContent;
      if (!audioContent) {
        console.error('No audio content returned from TTS API. Response:', response.data);
        return null;
      }
      console.log('Speech synthesized successfully, audio length:', audioContent.length);
      return audioContent;
    } catch (error) {
      console.error('Speech synthesis error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      Alert.alert('Error', `Failed to synthesize speech: ${error.message}. Check console.`);
      return null;
    }
  };

  const playSpeech = async (base64Audio) => {
    if (!base64Audio) {
      console.log('No audio to play');
      return;
    }
    try {
        // Save the audio to a temporary file
        const audioPath = `${RNFS.TemporaryDirectoryPath}tts.mp3`;
        await RNFS.writeFile(audioPath, base64Audio, 'base64');
    
        // Play the audio using react-native-sound
        const sound = new Sound(audioPath, '', (error) => {
          if (error) {
            console.error('Failed to load sound:', error);
            return;
          }
    
          // Set volume to maximum (1.0 is the max for react-native-sound)
          sound.setVolume(1.0);
          sound.play((success) => {
            if (success) {
              console.log('Audio played successfully');
            } else {
              console.error('Playback failed');
            }
            // Clean up the temporary file
            RNFS.unlink(audioPath).catch((err) =>
              console.log('Failed to delete temp file:', err)
            );
            sound.release(); // Free memory
          });
        });
    
        return sound; // Return the sound object for further control if needed
      } catch (error) {
        console.error('Error playing speech:', error);
        return null;
      }
  };

  const processAudio = async (audioUri) => {
    setIsProcessing(true);
    const transcript = await transcribeAudio(audioUri);
    if (transcript) {
      const translated = await translateText(transcript);
      if (translated) {
        const speechData = await synthesizeSpeech(translated);
        if (speechData) {
          await playSpeech(speechData);
        } else {
          console.log('No speech data to play');
        }
      }
    }
    setIsProcessing(false);
  };

  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setTranscribedText('');
    setTranslatedText('');
  };

  const getLanguageName = (code) => {
    const lang = supportedLanguages.find((l) => l.code === code);
    return lang ? lang.name : code;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerText}>Voice Translator</Text>
      <Text style={styles.infoText}>
        Speak and translate between multiple languages in real time.
      </Text>
      <View style={styles.card}>
        <Text style={styles.labelText}>Detected Speech ({getLanguageName(sourceLang)}):</Text>
        <Text style={styles.textArea}>
          {transcribedText || 'Press and hold the mic button to record'}
        </Text>
      </View>
      <View style={styles.langContainer}>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setShowSourceLangModal(true)}
        >
          <Text style={styles.langButtonText}>{getLanguageName(sourceLang)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.swapButton} onPress={swapLanguages}>
          <Text style={styles.swapButtonText}>⇆</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() => setShowTargetLangModal(true)}
        >
          <Text style={styles.langButtonText}>{getLanguageName(targetLang)}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.card}>
        <Text style={styles.labelText}>Translation ({getLanguageName(targetLang)}):</Text>
        <Text style={styles.textArea}>
          {translatedText || 'Your translation will appear here'}
        </Text>
      </View>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[styles.recordButton, recording ? styles.recordingActive : null]}
          onPressIn={startRecording}
          onPressOut={stopRecording}
          disabled={isProcessing}
        >
          <Text style={styles.recordButtonText}>
            {recording ? 'Recording...' : 'Hold to Record'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.playButton}
          onPress={async () => {
            if (translatedText) {
              const speechData = await synthesizeSpeech(translatedText);
              if (speechData) await playSpeech(speechData);
            } else {
              Alert.alert('No Translation', 'Please record and translate some text first.');
            }
          }}
          disabled={isProcessing || !translatedText}
        >
          <Text style={styles.playButtonText}>▶</Text>
        </TouchableOpacity>
      </View>
      {isProcessing && <Text style={styles.processingText}>Processing...</Text>}

      {/* Source Language Modal */}
      <Modal
        visible={showSourceLangModal}
        animationType="slide"
        onRequestClose={() => setShowSourceLangModal(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Select Source Language</Text>
          <FlatList
            data={supportedLanguages}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalListItem}
                onPress={() => {
                  setSourceLang(item.code);
                  setShowSourceLangModal(false);
                  setTranscribedText('');
                  setTranslatedText('');
                }}
              >
                <Text style={styles.modalListItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.code}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowSourceLangModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Target Language Modal */}
      <Modal
        visible={showTargetLangModal}
        animationType="slide"
        onRequestClose={() => setShowTargetLangModal(false)}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Select Target Language</Text>
          <FlatList
            data={supportedLanguages}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalListItem}
                onPress={() => {
                  setTargetLang(item.code);
                  setShowTargetLangModal(false);
                  setTranscribedText('');
                  setTranslatedText('');
                }}
              >
                <Text style={styles.modalListItemText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.code}
          />
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowTargetLangModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f7fa',
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    paddingHorizontal: 10,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  labelText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  textArea: {
    fontSize: 16,
    color: '#333',
    minHeight: 50,
  },
  langContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    width: '100%',
  },
  langButton: {
    flex: 1,
    backgroundColor: '#eaeaea',
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  langButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  swapButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 5,
    elevation: 2,
  },
  swapButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginVertical: 20,
    justifyContent: 'center',
    width: '100%',
  },
  recordButton: {
    backgroundColor: '#e63946',
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginRight: 10,
  },
  recordingActive: {
    backgroundColor: '#ff5252',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playButton: {
    width: 60,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  processingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalListItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalListItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

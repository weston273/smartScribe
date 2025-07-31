import React, { useState, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Square, Download, Trash2, Volume2, Bot, FileText } from 'lucide-react';
import { convertAudioToNotes } from '../utils/ai';
import NavBar1 from '../components/NavBar1';
import SideBar from '../components/sidebar/SideBar.jsx';
import Footer from '../components/Footer';
import AccountDropDown from '../components/account/AccountDropDown.jsx';
import './Record.css'

export default function Record({ theme, toggleTheme }) {
  const [showSideBar, setShowSideBar] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [processingAI, setProcessingAI] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const toggleSideBar = () => setShowSideBar(prev => !prev);
  const toggleAccountDropdown = () => setShowAccountDropdown(prev => !prev);
  const handleCloseDropdown = () => setShowAccountDropdown(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const newRecording = {
          id: Date.now(),
          url: audioUrl,
          blob: audioBlob,
          duration: recordingTime,
          timestamp: new Date().toLocaleString(),
          name: `Recording ${recordings.length + 1}`
        };
        setRecordings(prev => [newRecording, ...prev]);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const playRecording = (recording) => {
    if (currentlyPlaying === recording.id) {
      setCurrentlyPlaying(null);
      return;
    }
    
    const audio = new Audio(recording.url);
    audio.play();
    setCurrentlyPlaying(recording.id);
    
    audio.onended = () => {
      setCurrentlyPlaying(null);
    };
  };

  const downloadRecording = (recording) => {
    const link = document.createElement('a');
    link.href = recording.url;
    link.download = `${recording.name}.webm`;
    link.click();
  };

  const deleteRecording = (recordingId) => {
    setRecordings(prev => prev.filter(r => r.id !== recordingId));
  };

  const convertToNote = async (recording) => {
    setProcessingAI(recording.id);
    
    try {
      // Use AI backend to convert audio to structured notes
      const structuredNotes = await convertAudioToNotes(recording.blob, recording.name);
      
      // Save the AI-generated notes
      saveToNotes(recording.name, structuredNotes);
      
      // Show success message
      alert('Recording successfully converted to structured notes using AI! You can find it in your Notes section.');

    } catch (error) {
      console.error('Error converting to note:', error);
      alert(error.message || 'Failed to convert recording to note. Please try again.');
    } finally {
      setProcessingAI(null);
    }
  };

  const saveToNotes = (recordingName, aiGeneratedContent) => {
    try {
      // Get existing notes
      const existingNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
      
      // Create enhanced content with metadata
      const enhancedContent = `# ${recordingName} - AI Voice Note

*Generated on: ${new Date().toLocaleString()}*
*Source: Voice Recording converted by AI*

---

${aiGeneratedContent}

---

## Recording Information
- **Original Recording:** ${recordingName}
- **Conversion Method:** AI-powered transcription and structuring
- **Generated:** ${new Date().toLocaleString()}
- **Type:** Voice-to-Notes Conversion`;

      // Create new note
      const newNote = {
        id: Date.now(),
        title: `${recordingName} - AI Voice Note`,
        content: enhancedContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tags: ['voice-note', 'ai-generated', 'transcription', 'audio-conversion']
      };
      
      // Add to beginning of notes array
      const updatedNotes = [newNote, ...existingNotes];
      
      // Save to localStorage
      localStorage.setItem('smartscribe-notes', JSON.stringify(updatedNotes));
      
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-wrapper">
      <NavBar1 theme={theme} onSideBarToggle={toggleSideBar} onProfileClick={toggleAccountDropdown} />

      <div className="record-body">
        {showSideBar && <SideBar theme={theme} onClose={toggleSideBar} />}
        
        <main className="record-main">
          <div className="record-header">
            <h1 className="record-title">Voice Recorder</h1>
            <p className="record-subtitle">Capture your thoughts and ideas with AI-powered recording</p>
          </div>

          {/* Recording Interface */}
          <div className="recording-interface">
            <div className="recording-visualizer">
              <div className={`pulse-ring ${isRecording && !isPaused ? 'active' : ''}`}>
                <div className="recording-button-container">
                  <button 
                    className={`record-btn ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? <Square size={32} /> : <Mic size={32} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="recording-controls">
              <div className="recording-time">
                {formatTime(recordingTime)}
              </div>
              
              {isRecording && (
                <div className="recording-actions">
                  <button 
                    className="control-btn pause-btn"
                    onClick={pauseRecording}
                  >
                    {isPaused ? <Play size={20} /> : <Pause size={20} />}
                  </button>
                  <button 
                    className="control-btn stop-btn"
                    onClick={stopRecording}
                  >
                    <Square size={20} />
                  </button>
                </div>
              )}
            </div>

            <div className="recording-status">
              {isRecording ? (
                <span className={`status ${isPaused ? 'paused' : 'recording'}`}>
                  {isPaused ? 'Recording Paused' : 'Recording...'}
                </span>
              ) : (
                <span className="status ready">Ready to Record</span>
              )}
            </div>
          </div>

          {/* Recordings List */}
          <div className="recordings-section">
            <h2 className="recordings-title">Your Recordings</h2>
            
            {recordings.length === 0 ? (
              <div className="empty-state">
                <Mic size={48} className="empty-icon" />
                <p>No recordings yet</p>
                <p className="empty-subtitle">Start recording to see your audio files here</p>
              </div>
            ) : (
              <div className="recordings-list">
                {recordings.map(recording => (
                  <div key={recording.id} className="recording-item">
                    <div className="recording-info">
                      <h3 className="recording-name">{recording.name}</h3>
                      <div className="recording-meta">
                        <span className="recording-duration">{formatTime(recording.duration)}</span>
                        <span className="recording-timestamp">{recording.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="recording-actions">
                      <button 
                        className="action-btn play-btn"
                        onClick={() => playRecording(recording)}
                        title="Play recording"
                      >
                        {currentlyPlaying === recording.id ? <Volume2 size={18} /> : <Play size={18} />}
                      </button>
                      <button 
                        className="action-btn ai-btn"
                        onClick={() => convertToNote(recording)}
                        disabled={processingAI === recording.id}
                        title="Convert to AI note"
                      >
                        {processingAI === recording.id ? (
                          <div className="spinner">🧠</div>
                        ) : (
                          <Bot size={18} />
                        )}
                      </button>
                      <button 
                        className="action-btn download-btn"
                        onClick={() => downloadRecording(recording)}
                        title="Download recording"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => deleteRecording(recording.id)}
                        title="Delete recording"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Features */}
          <div className="ai-features">
            <h3 className="features-title">AI-Powered Features</h3>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🎯</div>
                <h4>Smart Transcription</h4>
                <p>Convert speech to text with high accuracy using our AI backend</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📝</div>
                <h4>AI Note Generation</h4>
                <p>Transform recordings into structured, educational notes with key insights</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏷️</div>
                <h4>Smart Tagging</h4>
                <p>Automatically categorize and tag your AI-generated voice notes</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤖</div>
                <h4>Advanced AI Processing</h4>
                <p>Extract key points, create summaries, and structure information intelligently</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAccountDropdown && (
        <AccountDropDown theme={theme} onClose={handleCloseDropdown} />
      )}

      <Footer theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import { Mic, Play, Pause, Square, Download, Trash2, Volume2, Bot, FileText, Brain, Tags, Target, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { convertAudioToNotes } from '../utils/ai';
import { useAuth } from '../components/contexts/AuthContext';
import { supabase } from '../database/supabaseClient.js';
import Footer from '../components/Footer';
import './Record.css';

export default function Record({ theme, toggleTheme }) {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [recordingPhase, setRecordingPhase] = useState('ready');
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordings, setRecordings] = useState([]);
  const recordingsRef = useRef([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [processingAI, setProcessingAI] = useState(null);
  const [recordingError, setRecordingError] = useState('');
  const [conversionMessage, setConversionMessage] = useState('');
  const [savedNotePath, setSavedNotePath] = useState('');
  const [conversionIsError, setConversionIsError] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioRef = useRef(null);
  const elapsedMsRef = useRef(0);
  const segmentStartedRef = useRef(null);
  const discardedRef = useRef(false);
  const recordingNumberRef = useRef(0);
  const mountedRef = useRef(true);
  recordingsRef.current = recordings;

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  };

  const updateTimer = () => {
    const liveSegment = segmentStartedRef.current ? Date.now() - segmentStartedRef.current : 0;
    setRecordingTime(Math.floor((elapsedMsRef.current + liveSegment) / 1000));
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stopTimer();
      discardedRef.current = true;
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') {
        recorder.ondataavailable = null;
        recorder.onerror = null;
        recorder.onstop = null;
        recorder.stop();
      }
      stopTracks();
      audioRef.current?.pause();
      recordingsRef.current.forEach(recording => URL.revokeObjectURL(recording.url));
    };
  // Audio URLs belong to this page instance and are released when it unmounts.
  }, []);

  const startRecording = async () => {
    if (isStarting || isRecording || isFinalizing) return;
    setRecordingError('');
    setConversionMessage('');
    setConversionIsError(false);
    setSavedNotePath('');
    setIsStarting(true);
    setRecordingPhase('requesting');
    try {
      if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        throw new Error('Audio recording is not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mountedRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }
      streamRef.current = stream;
      const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported?.(type));
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      discardedRef.current = false;
      elapsedMsRef.current = 0;
      segmentStartedRef.current = Date.now();

      recorder.ondataavailable = event => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        stopTimer();
        stopTracks();
        setIsRecording(false);
        setIsPaused(false);
        setIsFinalizing(false);
        setRecordingPhase('ready');
        setRecordingError('Recording failed. Check that your microphone is connected, then try again.');
      };
      recorder.onstop = () => {
        stopTimer();
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        audioChunksRef.current = [];
        stopTracks();
        setIsRecording(false);
        setIsPaused(false);
        setIsFinalizing(false);
        setRecordingPhase('ready');
        if (discardedRef.current) return;
        if (!blob.size) {
          setRecordingError('The recording was empty. Check your microphone and try again.');
          return;
        }
        recordingNumberRef.current += 1;
        setRecordings(previous => [{
          id: crypto.randomUUID(),
          url: URL.createObjectURL(blob),
          blob,
          duration: Math.max(1, Math.floor(elapsedMsRef.current / 1000)),
          timestamp: new Date().toLocaleString(),
          name: `Recording ${recordingNumberRef.current}`
        }, ...previous]);
      };

      recorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingPhase('recording');
      setRecordingTime(0);
      timerRef.current = setInterval(updateTimer, 250);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      stopTracks();
      if (!mountedRef.current) return;
      const errors = {
        NotAllowedError: 'Microphone permission was denied. Allow microphone access in your browser settings and try again.',
        SecurityError: 'Microphone access is blocked. Open SmartScribe in a secure browser context and allow microphone access.',
        NotFoundError: 'No microphone was found. Connect a microphone and try again.',
        NotReadableError: 'The microphone is unavailable or already in use by another app.'
      };
      setRecordingError(errors[error?.name] || (error instanceof Error ? error.message : 'Unable to access your microphone. Check browser permissions and try again.'));
      setRecordingPhase('ready');
    } finally {
      if (mountedRef.current) setIsStarting(false);
    }
  };

  const stopRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || (recorder.state !== 'recording' && recorder.state !== 'paused')) return;
    if (segmentStartedRef.current) elapsedMsRef.current += Date.now() - segmentStartedRef.current;
    segmentStartedRef.current = null;
    updateTimer();
    stopTimer();
    setRecordingPhase('stopping');
    setIsFinalizing(true);
    recorder.stop();
  };

  const discardRecording = () => {
    discardedRef.current = true;
    setRecordingError('');
    stopRecording();
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      stopTracks();
      setIsRecording(false);
      setIsPaused(false);
      setIsFinalizing(false);
      setRecordingPhase('ready');
    }
  };

  const pauseRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;
    if (isPaused) {
      recorder.resume();
      segmentStartedRef.current = Date.now();
      timerRef.current = setInterval(updateTimer, 250);
      setRecordingPhase('recording');
    } else {
      recorder.pause();
      if (segmentStartedRef.current) elapsedMsRef.current += Date.now() - segmentStartedRef.current;
      segmentStartedRef.current = null;
      updateTimer();
      stopTimer();
      setRecordingPhase('paused');
    }
    setIsPaused(!isPaused);
  };

  const playRecording = async recording => {
    if (currentlyPlaying === recording.id) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
      return;
    }
    audioRef.current?.pause();
    const audio = new Audio(recording.url);
    audioRef.current = audio;
    setCurrentlyPlaying(recording.id);
    audio.onended = audio.onerror = () => {
      audioRef.current = null;
      setCurrentlyPlaying(null);
    };
    try {
      await audio.play();
    } catch {
      audioRef.current = null;
      setCurrentlyPlaying(null);
      setRecordingError('This recording could not be played in your browser.');
    }
  };

  const downloadRecording = recording => {
    const link = document.createElement('a');
    const extension = recording.blob.type.includes('mp4') ? 'm4a' : recording.blob.type.includes('ogg') ? 'ogg' : 'webm';
    link.href = recording.url;
    link.download = `${recording.name}.${extension}`;
    link.click();
  };

  const deleteRecording = recordingId => {
    const recording = recordings.find(item => item.id === recordingId);
    if (recording) URL.revokeObjectURL(recording.url);
    if (currentlyPlaying === recordingId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setCurrentlyPlaying(null);
    }
    setRecordings(previous => previous.filter(item => item.id !== recordingId));
  };

  const saveToNotes = async (recording, result) => {
    const now = new Date().toISOString();
    const title = result.title || recording.name;
    const content = `# ${title}\n\n## Summary\n\n${result.summary || 'No summary was generated.'}\n\n## Transcript\n\n${result.transcription}\n\n## Notes\n\n${result.notes}\n\n---\n\n*Source recording: ${recording.name} · ${formatTime(recording.duration)}*`;
    const tags = ['voice-note', 'transcription', 'audio-conversion'];
    let savedNote;
    if (user) {
      const { data, error } = await supabase.from('notes').insert({
        title, content, tags, user_id: user.id, created_at: now, updated_at: now
      }).select().single();
      if (error) throw new Error('Could not save the recording to your account. The audio is still available to retry.');
      savedNote = data;
    } else {
      savedNote = { id: crypto.randomUUID(), title, content, tags, createdAt: now, updatedAt: now };
    }
    const existingNotes = JSON.parse(localStorage.getItem('smartscribe-notes') || '[]');
    localStorage.setItem('smartscribe-notes', JSON.stringify([
      savedNote,
      ...existingNotes.filter(note => String(note.id) !== String(savedNote.id))
    ]));
    return savedNote;
  };

  const convertToNote = async recording => {
    setProcessingAI(recording.id);
    setConversionMessage('');
    setConversionIsError(false);
    setSavedNotePath('');
    try {
      const result = await convertAudioToNotes(recording.blob, recording.name, phase => {
        if (!mountedRef.current) return;
        const messages = {
          uploading: 'Uploading recording and transcribing audio…',
          processing: 'Transcription complete. Creating a title, summary, and notes with AI…'
        };
        setConversionMessage(messages[phase] || 'Processing recording…');
      });
      if (!mountedRef.current) {
        await saveToNotes(recording, result);
        return;
      }
      setConversionMessage('Saving your transcript and notes…');
      const savedNote = await saveToNotes(recording, result);
      if (!mountedRef.current) return;
      setSavedNotePath(`/notes/${savedNote.id}`);
      setConversionMessage('Recording processed and saved to Notes.');
    } catch (error) {
      console.error('Error converting to note:', error);
      if (!mountedRef.current) return;
      setConversionIsError(true);
      setConversionMessage(error instanceof Error ? error.message : 'SmartScribe could not process this recording. Your audio is still available to retry.');
    } finally {
      if (mountedRef.current) setProcessingAI(null);
    }
  };

  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const statusText = {
    ready: 'Ready to Record', requesting: 'Requesting microphone access…', recording: 'Recording…',
    paused: 'Recording Paused', stopping: 'Finalizing recording…'
  }[recordingPhase] || 'Ready to Record';

  return (
    <div className="page-wrapper">
      <div className="record-body">
        <main className="record-main">
          <div className="record-header">
            <h1 className="record-title">Voice Recorder</h1>
            <p className="record-subtitle">Capture your thoughts and ideas with AI-powered recording</p>
          </div>
          {recordingError && <div className="record-feedback record-feedback-error" role="alert"><span>{recordingError}</span><button type="button" onClick={() => setRecordingError('')} aria-label="Dismiss microphone message"><X size={16}/></button></div>}
          {conversionMessage && <div className={`record-feedback ${conversionIsError ? 'record-feedback-error' : ''}`} role={conversionIsError ? 'alert' : 'status'}><span>{conversionMessage}{savedNotePath && <> <Link to={savedNotePath}>Open saved note</Link></>}</span><button type="button" onClick={() => { setConversionMessage(''); setSavedNotePath(''); setConversionIsError(false); }} aria-label="Dismiss conversion message"><X size={16}/></button></div>}

          <div className="recording-interface">
            <div className="recording-visualizer">
              <div className={`pulse-ring ${isRecording && !isPaused ? 'active' : ''}`}>
                <div className="recording-button-container">
                  <button className={`record-btn ${isRecording ? 'recording' : ''}`} onClick={isRecording ? stopRecording : startRecording} disabled={isStarting || isFinalizing} aria-label={isRecording ? 'Stop recording' : 'Start recording'}>
                    {isRecording ? <Square size={32} /> : <Mic size={32} />}
                  </button>
                </div>
              </div>
            </div>
            <div className="recording-controls">
              <div className="recording-time" aria-live="off">{formatTime(recordingTime)}</div>
              {isRecording && <div className="recording-actions">
                <button className="control-btn pause-btn" onClick={pauseRecording} aria-label={isPaused ? 'Resume recording' : 'Pause recording'} title={isPaused ? 'Resume' : 'Pause'}>{isPaused ? <Play size={20} /> : <Pause size={20} />}</button>
                <button className="control-btn stop-btn" onClick={stopRecording} aria-label="Stop and keep recording"><Square size={20} /></button>
                <button className="control-btn" onClick={discardRecording} aria-label="Discard recording" title="Discard recording"><Trash2 size={20} /></button>
              </div>}
            </div>
            <div className="recording-status"><span className={`status ${isPaused ? 'paused' : isRecording ? 'recording' : 'ready'}`} role="status">{isStarting ? 'Requesting microphone access…' : isFinalizing ? 'Finalizing recording…' : statusText}</span></div>
          </div>

          <div className="recordings-section">
            <h2 className="recordings-title">Your Recordings</h2>
            {recordings.length === 0 ? <div className="empty-state"><Mic size={48} className="empty-icon"/><p>No recordings yet</p><p className="empty-subtitle">Start recording to see your audio files here</p></div> :
              <div className="recordings-list">{recordings.map(recording => <div key={recording.id} className="recording-item">
                <div className="recording-info"><h3 className="recording-name">{recording.name}</h3><div className="recording-meta"><span className="recording-duration">{formatTime(recording.duration)}</span><span className="recording-timestamp">{recording.timestamp}</span></div></div>
                <div className="recording-actions">
                  <button className="action-btn play-btn" onClick={() => playRecording(recording)} title={currentlyPlaying === recording.id ? 'Stop playback' : 'Play recording'} aria-label={currentlyPlaying === recording.id ? 'Stop playback' : 'Play recording'}>{currentlyPlaying === recording.id ? <Volume2 size={18}/> : <Play size={18}/>}</button>
                  <button className="action-btn ai-btn" onClick={() => convertToNote(recording)} disabled={processingAI === recording.id} title="Transcribe and create a note" aria-label="Transcribe and create a note">{processingAI === recording.id ? <span className="spinner" aria-hidden="true">…</span> : <Bot size={18}/>}</button>
                  <button className="action-btn download-btn" onClick={() => downloadRecording(recording)} title="Download recording" aria-label="Download recording"><Download size={18}/></button>
                  <button className="action-btn delete-btn" onClick={() => deleteRecording(recording.id)} title="Delete recording" aria-label="Delete recording"><Trash2 size={18}/></button>
                </div>
              </div>)}</div>}
            {processingAI && <p className="record-subtitle" role="status">{conversionMessage}</p>}
          </div>

          <div className="ai-features">
            <h3 className="features-title">AI-Powered Features</h3>
            <div className="features-grid">
              <div className="feature-card"><div className="feature-icon"><Target size={18}/></div><h4>Smart Transcription</h4><p>Convert speech to text with high accuracy using our AI backend</p></div>
              <div className="feature-card"><div className="feature-icon"><FileText size={18}/></div><h4>AI Note Generation</h4><p>Transform recordings into structured notes with key insights</p></div>
              <div className="feature-card"><div className="feature-icon"><Tags size={18}/></div><h4>Transcript and Summary</h4><p>Keep the transcript and a concise summary with your saved note</p></div>
              <div className="feature-card"><div className="feature-icon"><Brain size={18}/></div><h4>AI Processing</h4><p>Turn spoken ideas into readable, organized Markdown notes</p></div>
            </div>
          </div>
        </main>
      </div>
      <Footer theme={theme} toggleTheme={toggleTheme}/>
    </div>
  );
}

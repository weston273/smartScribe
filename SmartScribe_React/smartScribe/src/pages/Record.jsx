import React, { useState, useRef } from "react";
import "./Record.css";

// import NavBar1 from './../'

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Store recordings as { id, url (audio), notes, summary, loading }
  const [recordings, setRecordings] = useState([]);

  const handleRecordClick = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Create new recording entry
          const id = Date.now();

          // Add a loading placeholder while "AI" generates notes
          const newRecording = {
            id,
            url: audioUrl,
            notes: "",
            summary: "",
            loading: true,
          };
          setRecordings((prev) => [newRecording, ...prev]);

          // Clear chunks
          audioChunksRef.current = [];

          // Simulate AI call for notes + summary
          mockGenerateNotes(audioBlob).then(({ notes, summary }) => {
            setRecordings((prev) =>
              prev.map((rec) =>
                rec.id === id ? { ...rec, notes, summary, loading: false } : rec
              )
            );
          });
        };

        audioChunksRef.current = [];
        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        alert("Microphone access denied or error: " + err.message);
      }
    } else {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Mock "AI" function simulating async note & summary generation
  const mockGenerateNotes = (audioBlob) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Here you could integrate a real AI API to analyze the audio
        const notes = "These are AI-generated notes based on your recording.";
        const summary = "Summary: Recording is clear and focuses on React audio recording.";
        resolve({ notes, summary });
      }, 2000); // simulate 2 sec processing delay
    });
  };

  return (

    <div className="record-container">
      <h2 className="record-title">Audio Recorder & AI Notes</h2>

      <button
        className={`record-btn ${isRecording ? "record-btn-stop" : "record-btn-start"}`}
        onClick={handleRecordClick}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      <section className="notes">
        <p className="notes-header">record</p>

        {recordings.length === 0 && (
          <p className="notes-empty">No recordings yet. Start recording to see notes.</p>
        )}

        {recordings.map(({ id, url, notes, summary, loading }) => (
          <div className="recording-entry" key={id}>
            <audio controls src={url} className="audio-player" />

            {loading ? (
              <p className="loading-text">AI generating notes & summary...</p>
            ) : (
              <>
                <div className="notes-section">
                  <strong>Notes:</strong>
                  <p>{notes}</p>
                </div>
                <div className="notes-section">
                  <strong>Summary:</strong>
                  <p>{summary}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

// src/pages/ResponsePrompt.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Type, Send } from "lucide-react";

export default function ResponsePrompt() {
  const navigate = useNavigate();

  const [responseMethod, setResponseMethod] = useState("typing"); // "typing" or "voice"
  const [typedResponse, setTypedResponse] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [micPermissionStatus, setMicPermissionStatus] = useState('unknown');
  const [realtimeTranscript, setRealtimeTranscript] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const transcriberRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptionIntervalRef = useRef(null);
  const transformersModuleRef = useRef(null);

  const prompt =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua…";

  // Check microphone permissions on component mount
  useEffect(() => {
    checkMicrophonePermission().then(setMicPermissionStatus);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transcriptionIntervalRef.current) {
        clearInterval(transcriptionIntervalRef.current);
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Check microphone permissions
  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' });

        setMicPermissionStatus(permission.state);
        return permission.state;
      }
      setMicPermissionStatus('unknown');
      return 'unknown';
    } catch (error) {

      setMicPermissionStatus('unknown');
      return 'unknown';
    }
  };

  // Test microphone access
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicPermissionStatus('granted');
      setMessage('Microphone access successful! You can now use voice recording.');
    } catch (error) {

      setMicPermissionStatus('denied');
      if (error.name === 'NotAllowedError') {
        setError('Microphone access denied. Please allow microphone access and try again.');
      } else {
        setError(`Microphone test failed: ${error.message}`);
      }
    }
  };

  // Setup real-time speech recognition
  const setupRealtimeRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update realtime display
        setRealtimeTranscript(interimTranscript);

        // Add final results to typed response
        if (finalTranscript.trim()) {
          setTypedResponse(prev => {
            const newText = prev ? prev + ' ' + finalTranscript.trim() : finalTranscript.trim();
            return newText;
          });
        }
      };

      recognition.onerror = (event) => {

        if (event.error === 'not-allowed') {
          setError('Speech recognition permission denied.');
        }
      };

      recognition.onend = () => {

        setRealtimeTranscript("");
      };

      recognitionRef.current = recognition;
      return recognition;
    }
    return null;
  };

  // Load Whisper model when needed
  const loadModel = async () => {
    if (transcriberRef.current || modelLoading) return;

    setModelLoading(true);
    try {
      if (!transformersModuleRef.current) {
        transformersModuleRef.current = await import("@xenova/transformers");
        transformersModuleRef.current.env.allowLocalModels = false;
        transformersModuleRef.current.env.useBrowserCache = false;
      }

      const { pipeline } = transformersModuleRef.current;


      transcriberRef.current = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-tiny.en",
        { device: "webgpu" }
      );

    } catch (error) {

      try {
        transcriberRef.current = await pipeline(
          "automatic-speech-recognition",
          "Xenova/whisper-tiny.en"
        );

      } catch (cpuError) {

        setError("Failed to load speech recognition model. Please refresh and try again.");
      }
    } finally {
      setModelLoading(false);
    }
  };

  // Convert audio blob to format suitable for Whisper
  const convertAudioToFloat32Array = async (audioBlob) => {
    const arrayBuffer = await audioBlob.arrayBuffer();

    // Create audio context if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000 // Whisper expects 16kHz
      });
    }

    const audioContext = audioContextRef.current;

    try {
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      // Get the first channel (mono)
      let audioData = audioBuffer.getChannelData(0);

      // Resample to 16kHz if necessary
      if (audioBuffer.sampleRate !== 16000) {
        const resampleRatio = 16000 / audioBuffer.sampleRate;
        const resampledLength = Math.floor(audioData.length * resampleRatio);
        const resampledData = new Float32Array(resampledLength);

        for (let i = 0; i < resampledLength; i++) {
          const srcIndex = i / resampleRatio;
          const srcIndexFloor = Math.floor(srcIndex);
          const srcIndexCeil = Math.min(srcIndexFloor + 1, audioData.length - 1);
          const fraction = srcIndex - srcIndexFloor;

          resampledData[i] = audioData[srcIndexFloor] * (1 - fraction) +
                            audioData[srcIndexCeil] * fraction;
        }

        audioData = resampledData;
      }

      return audioData;
    } catch (error) {

      throw new Error("Failed to process audio data");
    }
  };

  // startRecording / stopRecording
  const startRecording = async () => {
    try {
      const permissionStatus = await checkMicrophonePermission();

      if (permissionStatus === 'denied') {
        setError('Microphone access is blocked. Please enable microphone permissions in your browser settings and refresh the page.');
        return;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
      } catch (constraintError) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true
        });
      }

      const recognition = setupRealtimeRecognition();
      if (recognition) {
        recognition.start();
      }

      const supportedTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];

      let mimeType = '';
      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }

      const options = mimeType ? { mimeType } : {};
      const mr = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mr.onstop = async () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setRealtimeTranscript("");

        const blob = new Blob(audioChunksRef.current, { type: mr.mimeType || 'audio/webm' });

        if (blob.size === 0) {
          setError("No audio was recorded. Please try again and speak clearly.");
          return;
        }

        if (transcriberRef.current && !recognitionRef.current) {
          await transcribeAudio(blob);
        }

        stream.getTracks().forEach((track) => {
          track.stop();
        });
      };

      mr.onerror = (e) => {
        setError("Recording error occurred. Please try again.");
        setIsRecording(false);
      };

      mr.start(1000);
      setIsRecording(true);

    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError("Microphone access denied. Please:\n1. Click the microphone icon in your browser's address bar\n2. Allow microphone access\n3. Refresh the page and try again");
      } else if (err.name === 'NotFoundError') {
        setError("No microphone found. Please connect a microphone and try again.");
      } else if (err.name === 'NotReadableError') {
        setError("Microphone is already in use by another application. Please close other apps using the microphone and try again.");
      } else {
        setError(`Microphone error: ${err.message}. Please check your microphone settings and try again.`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setRealtimeTranscript("");
  };

  const transcribeAudio = async (blob) => {
    if (!transcriberRef.current) {
      setError("Speech model not loaded. Please wait for it to load and try again.");
      return;
    }


    try {
      // Convert audio to the format expected by Whisper

      if (audioData.length === 0) {
        throw new Error("No audio data to transcribe");
      }

      // Transcribe using Whisper
      const result = await transcriberRef.current(audioData, {
        language: 'english',
        task: 'transcribe'
      });


      // Handle different possible result formats
      let transcribedText = '';

      if (typeof result === 'string') {
        transcribedText = result.trim();
      } else if (result && typeof result === 'object') {
        // Try different possible properties
        if (result.text) {
          transcribedText = result.text.trim();
        } else if (result.transcription) {
          transcribedText = result.transcription.trim();
        } else if (result.result) {
          transcribedText = result.result.trim();
        } else if (Array.isArray(result) && result.length > 0) {
          // Handle array results
          if (typeof result[0] === 'string') {
            transcribedText = result[0].trim();
          } else if (result[0] && result[0].text) {
            transcribedText = result[0].text.trim();
          }
        } else {

        }
      }

      if (transcribedText) {

      } else {

        setError("No speech detected or transcription failed. Please try speaking more clearly.");
      }

      setError(`Transcription failed: ${err.message}. Please try again.`);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Handlers for toggles
  const handleVoiceClick = async () => {
    // if already recording, stop; else start
    if (isRecording) {
      stopRecording();
      return;
    }

    // Set to voice mode first
    setResponseMethod("voice");

    // Load model if not loaded (as fallback)
    if (!transcriberRef.current && !modelLoading) {
      loadModel(); // Don't await - let it load in background
    }

    // Start recording (will use real-time recognition if available)
    await startRecording();
  };

  const handleTypeClick = () => {
    if (isRecording) stopRecording();
    setResponseMethod("typing");
  };

  const handleSubmit = () => {

  };

  const canSubmit = typedResponse.trim().length > 0 && !isTranscribing;

  // Get the display text (typed response + realtime transcript)
  const displayText = typedResponse + (realtimeTranscript ? (typedResponse ? ' ' : '') + realtimeTranscript : '');

  return (
    <div className="flex h-screen font-sans bg-offwhite">
      <div className="flex-1 flex flex-col overflow-auto p-8">
        <form className="w-full max-w-3xl mx-auto bg-white dark:bg-neutral-800 rounded-3xl shadow-lg p-10">
          <h2 className="text-3xl font-bold mb-6 text-neutral-800 dark:text-neutral-200 text-center">
            Share Your Thoughts
          </h2>

          <div className="bg-neutral-50 dark:bg-neutral-800 p-6 rounded-2xl mb-6">
            <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-3">Prompt:</h3>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{prompt}</p>
          </div>

          {/* Message/Error Display */}
          {message && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-xl">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Microphone Permission Status */}
          {micPermissionStatus === 'denied' && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center text-red-700 dark:text-red-400">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                Microphone access denied.
                <button
                  onClick={testMicrophone}
                  className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900/70 rounded text-sm"
                >
                  Test Microphone
                </button>
              </div>
            </div>
          )}

          {micPermissionStatus === 'prompt' && (
            <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center text-yellow-700 dark:text-yellow-400">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2" />
                Microphone permission needed.
                <button
                  onClick={testMicrophone}
                  className="ml-2 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:hover:bg-yellow-900/70 rounded text-sm"
                >
                  Grant Access
                </button>
              </div>
            </div>
          )}

          {/* Toggle Buttons */}
          <div className="mb-6 flex gap-4">
            <button
              type="button"
              onClick={handleTypeClick}
              className={`flex items-center px-5 py-2.5 rounded-lg border text-sm transition-colors ${
                responseMethod === "typing"
                  ? "bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-500"
              }`}
            >
              <Type className="mr-2" size={20} />
              Type Response
            </button>

            <button
              type="button"
              onClick={handleVoiceClick}
              disabled={isTranscribing}
              className={`flex items-center px-5 py-2.5 rounded-lg border text-sm transition-colors ${
                responseMethod === "voice"
                  ? "bg-neutral-800 text-white border-neutral-800 dark:bg-neutral-200 dark:text-neutral-900 dark:border-neutral-200"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-600 dark:text-neutral-300 dark:hover:border-neutral-500"
              } ${isTranscribing ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isRecording ? (
                <MicOff className="mr-2" size={20} />
              ) : (
                <Mic className="mr-2" size={20} />
              )}
              {isTranscribing
                ? "Transcribing..."
                : isRecording
                ? "Stop Recording"
                : "Voice Response"}
            </button>
          </div>

          {/* Model Loading Indicator */}
          {modelLoading && (
            <div className="flex items-center text-blue-500 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" />
              Loading fallback speech model...
            </div>
          )}

          {/* Unified Response Box */}
          <div className="mb-2">
            <label className="block text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Your Response
            </label>
            <textarea
              value={displayText}
              onChange={(e) => {
                // Only allow manual editing when not recording
                if (!isRecording) {
                  setTypedResponse(e.target.value);
                }
              }}
              className={`w-full border border-neutral-300 dark:border-neutral-600 rounded-2xl p-4 shadow-sm focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-neutral-100 ${
                isRecording ? 'bg-neutral-50 dark:bg-neutral-800' : ''
              }`}
              rows={6}
              placeholder="Type or dictate your response here..."
              disabled={isTranscribing}
              readOnly={isRecording}
            />
            {realtimeTranscript && (
              <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <span className="font-medium">Speaking:</span> {realtimeTranscript}
              </div>
            )}
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center text-red-500 mb-6">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse mr-2" />
              Recording... (Click "Stop Recording" when done)
            </div>
          )}

          {/* Transcribing Indicator */}
          {isTranscribing && (
            <div className="flex items-center text-blue-500 mb-6">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse mr-2" />
              Processing your speech...
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => {
                if (isRecording) stopRecording();
                navigate(-1);
              }}
              className="flex items-center space-x-2 px-3 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 hover:border-neutral-400 dark:hover:border-neutral-500 hover:shadow-sm transition-all text-sm"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex items-center px-5 py-2 rounded-lg text-sm transition-colors ${
                canSubmit
                  ? "bg-neutral-800 text-white hover:bg-neutral-900 dark:bg-neutral-200 dark:text-neutral-900 dark:hover:bg-neutral-300"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-700 dark:text-neutral-500"
              }`}
            >
              <Send className="mr-2" size={16} />
              Submit Response
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Users, MessageSquare } from "lucide-react";

interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface TwinVoiceChatProps {
  onTwinMentioned?: (twinEmail: string) => void;
}

export default function TwinVoiceChat({ onTwinMentioned }: TwinVoiceChatProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null); // For microphone input
  const playbackAudioContextRef = useRef<AudioContext | null>(null); // For audio playback
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const isConversationActiveRef = useRef<boolean>(false); // Track conversation state for audio processing
  const audioQueueRef = useRef<Int16Array[]>([]); // Queue for audio chunks
  const isPlayingRef = useRef<boolean>(false); // Track if audio is currently playing

  // WebSocket URL for voice chat - Connect to our AutoGen voice agent
  const wsUrl = `ws://localhost:8000/voice`;

  useEffect(() => {
    // Add page visibility listener to prevent multiple connections
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, disconnect if connected to prevent multiple connections
        if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
          console.log('Page hidden, disconnecting to prevent multiple connections');
          addMessage('system', '📱 Página oculta - desconectando para prevenir conexiones múltiples');
          disconnectFromVoiceSystem();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup on unmount
      console.log('TwinVoiceChat component unmounting, cleaning up...');
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (playbackAudioContextRef.current && playbackAudioContextRef.current.state !== 'closed') {
        playbackAudioContextRef.current.close();
      }
    };
  }, []);

  const connectToVoiceSystem = async () => {
    // Prevent multiple connections - check both connecting and open states
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      console.log('WebSocket already connected or connecting, skipping...');
      addMessage('system', '⚠️ Ya hay una conexión activa o conectándose');
      return;
    }
    
    try {
      setConnectionStatus('connecting');
      addMessage('system', '🔄 Conectando al sistema de voz...');
      
      // Close existing connection if any
      if (wsRef.current) {
        console.log('Closing existing WebSocket connection');
        wsRef.current.close();
        wsRef.current = null;
      }
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to RTMT voice system');
        setIsConnected(true);
        setConnectionStatus('connected');
        
        // Initialize session with Jorge's Digital Twin identity - DO NOT override server identity
        // Note: The AutoGen server already configures the session with Jorge's identity
        // This frontend component should NOT send session.update to avoid conflicts
        console.log('Connected to Jorge\'s Digital Twin (AutoGen + MCP) - using server identity');
        
        // Server already has Jorge's identity configured - no need to override
        // Just show Jorge's greeting to the user
        addMessage('assistant', '¡Hola! Soy Jorge Luna, tu gemelo digital. Haz clic en "Start Conversation" para comenzar una conversación continua.');
        addMessage('system', '✅ Conectado exitosamente al sistema de voz de Jorge');
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleVoiceMessage(message);
        } catch (err) {
          console.error('Error parsing voice message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('Disconnected from voice system, code:', event.code);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (event.code === 1008) {
          addMessage('system', '❌ Conexión rechazada: Solo se permite una conexión de voz a la vez');
          addMessage('system', '💡 Consejo: Cierra otras pestañas y espera un momento antes de intentar nuevamente');
        } else {
          addMessage('system', '🔌 Desconectado del sistema de voz');
        }
        
        // Clear the WebSocket reference
        wsRef.current = null;
      };

      ws.onerror = (error) => {
        console.error('Voice system error:', error);
        setConnectionStatus('error');
        setIsConnected(false);
        addMessage('system', '❌ Error al conectar con el sistema de voz');
        
        // Clear the WebSocket reference on error
        wsRef.current = null;
      };

    } catch (error) {
      console.error('Failed to connect to voice system:', error);
      setConnectionStatus('error');
    }
  };

  const handleVoiceMessage = (message: any) => {
    console.log('Voice message received:', message.type);
    
    // Log full message for debugging - ALWAYS log errors
    if (message.type === 'error' || message.type.includes('error')) {
      console.error('ERROR MESSAGE:', JSON.stringify(message, null, 2));
      // Show error in UI too
      addMessage('system', `❌ Error: ${message.error?.message || JSON.stringify(message.error || message)}`);
    } else if (!['response.audio.delta'].includes(message.type)) {
      console.log('Full message:', JSON.stringify(message, null, 2));
    }
    
    switch (message.type) {
      case 'session.created':
        console.log('Voice session created');
        break;
        
      case 'session.updated':
        console.log('Session configuration updated');
        break;
        
      case 'input_audio_buffer.committed':
        console.log('Audio buffer committed successfully');
        break;
        
      case 'response.created':
        console.log('Response creation started');
        break;
        
      case 'response.audio.delta':
        // Handle audio streaming from assistant
        if (message.delta) {
          console.log('🔊 Received audio delta, length:', message.delta.length);
          setIsAssistantSpeaking(true);
          playAudioDelta(message.delta);
        }
        break;
        
      case 'response.audio.done':
        console.log('Audio response complete');
        setIsAssistantSpeaking(false);
        // Don't clear the queue here - let it finish playing naturally
        console.log('🎵 Audio response marked as done, letting queue finish naturally');
        break;
        
      case 'response.audio_transcript.delta':
        // Show what the AI is saying in real-time
        if (message.delta) {
          console.log('AI speaking:', message.delta);
        }
        break;
        
      case 'response.audio_transcript.done':
        if (message.transcript) {
          addMessage('assistant', message.transcript);
        }
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        // Show what the user said
        if (message.transcript) {
          addMessage('user', message.transcript);
        }
        break;
        
      case 'input_audio_buffer.speech_started':
        setIsSpeaking(true);
        console.log('🎤 Speech detected - VAD activated');
        addMessage('system', '🎤 Detectando voz...');
        break;
        
      case 'input_audio_buffer.speech_stopped':
        setIsSpeaking(false);
        console.log('🔇 Speech ended - VAD will trigger response');
        addMessage('system', '🔇 Voz terminada, procesando...');
        
        // Explicitly trigger response generation after speech ends
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log('🚀 Triggering response generation...');
          wsRef.current.send(JSON.stringify({
            type: 'response.create'
          }));
        }
        break;
        
      case 'response.function_call_arguments.delta':
        console.log('AI is calling a function...');
        break;
        
      case 'response.function_call_arguments.done':
        console.log('Function call completed');
        break;
        
      case 'response.done':
        console.log('Response complete');
        break;
        
      case 'error':
        console.error('Voice system error:', message.error);
        console.error('Full error message:', JSON.stringify(message, null, 2));
        addMessage('system', `Error: ${JSON.stringify(message.error)}`);
        break;
        
      default:
        console.log('Unhandled message type:', message.type, message);
    }
  };

  const playAudioDelta = async (audioData: string) => {
    console.log('🎵 playAudioDelta called with data length:', audioData.length);
    try {
      // Create audio context if needed
      if (!playbackAudioContextRef.current) {
        playbackAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000 // Azure OpenAI uses 24kHz
        });
        console.log('🎵 Created new playback AudioContext with sample rate:', playbackAudioContextRef.current.sampleRate);
      }
      
      // Resume if suspended
      if (playbackAudioContextRef.current.state === 'suspended') {
        await playbackAudioContextRef.current.resume();
        console.log('🎵 Resumed suspended playback AudioContext');
      }
      
      // Decode base64 to binary
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('🎵 Decoded binary data length:', bytes.length);
      
      // Convert PCM16 to AudioBuffer (matching backend test page logic)
      const audioBuffer = playbackAudioContextRef.current.createBuffer(1, bytes.length / 2, 24000);
      const channelData = audioBuffer.getChannelData(0);
      
      // Convert PCM16 to float32 (exact same logic as backend test page)
      for (let i = 0; i < channelData.length; i++) {
        const sample = (bytes[i * 2] | (bytes[i * 2 + 1] << 8));
        channelData[i] = sample < 32768 ? sample / 32768 : (sample - 65536) / 32768;
      }
      
      console.log('🎵 Created AudioBuffer, duration:', audioBuffer.duration.toFixed(3), 'seconds');
      
      // Play audio immediately (no queue - just like backend test page)
      const source = playbackAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(playbackAudioContextRef.current.destination);
      source.start();
      
      console.log('🎵 Started audio playback directly');
      
    } catch (error) {
      console.error('❌ Error processing PCM16 audio:', error);
    }
  };

  const startConversation = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000, // Match Azure OpenAI requirement
          channelCount: 1,   // Mono audio
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      console.log('🎤 MediaStream obtained, tracks:', stream.getAudioTracks().length);
      stream.getAudioTracks().forEach((track, index) => {
        console.log(`🎤 Audio track ${index}:`, {
          label: track.label,
          enabled: track.enabled,
          readyState: track.readyState,
          settings: track.getSettings()
        });
      });
      
      // ALWAYS create a fresh AudioContext for microphone input
      // Close existing context if it exists
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
        console.log('🎤 Closed previous AudioContext');
      }
      
      // Create fresh AudioContext
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000 // Match Azure OpenAI requirement
      });
      console.log('🎤 Created fresh AudioContext, state:', audioContextRef.current.state);
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
        console.log('🎤 Resumed AudioContext, new state:', audioContextRef.current.state);
      }
      
      console.log('Using Web Audio API for real-time PCM16 capture');
      
      // Create audio processing pipeline
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
      
      console.log('🎤 Created audio nodes:', {
        source: !!source,
        processor: !!processor,
        bufferSize: processor.bufferSize
      });
      
      processor.onaudioprocess = (event) => {
        console.log('🎤 AUDIO PROCESSING EVENT FIRED! isConversationActive:', isConversationActiveRef.current);
        if (!isConversationActiveRef.current) {
          // Don't spam logs when conversation is not active
          return;
        }
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Calculate audio level for debugging
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += Math.abs(inputData[i]);
        }
        const avgLevel = sum / inputData.length;
        
        // Log audio processing occasionally to avoid spam
        if (Math.random() < 0.01) { // Log ~1% of events
          console.log('🎤 PROCESSING AUDIO - Level:', avgLevel.toFixed(6), 'Buffer size:', inputData.length);
        }
        
        // Convert float32 samples to PCM16
        const pcm16Buffer = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const sample = Math.max(-1, Math.min(1, inputData[i]));
          pcm16Buffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        }
        
        // Send PCM16 data directly
        sendPCM16Audio(pcm16Buffer);
      };
      
      console.log('🎤 Assigned onaudioprocess handler to processor');
      
      // Connect the audio processing pipeline
      source.connect(processor);
      // IMPORTANT: ScriptProcessorNode MUST be connected to destination to work!
      // We'll create a silent gain node to avoid feedback but keep processing active
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = 0; // Silent - no audio output
      processor.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      console.log('🎤 Audio processing pipeline connected: source -> processor -> silent_gain -> destination');
      
      // Store references for cleanup
      audioStreamRef.current = stream;
      audioProcessorRef.current = processor;
      audioSourceRef.current = source;
      
      // Set conversation active using both state and ref
      setIsConversationActive(true);
      isConversationActiveRef.current = true;
      console.log('🎤 Conversation activated! isConversationActiveRef.current:', isConversationActiveRef.current);
      
      addMessage('assistant', '🎤 Conversación iniciada. Captura directa PCM16 en tiempo real...');
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      addMessage('system', 'Error accessing microphone. Please check permissions.');
    }
  };

  const sendPCM16Audio = (pcm16Buffer: Int16Array) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      // Calculate audio level for this buffer
      let sum = 0;
      for (let i = 0; i < pcm16Buffer.length; i++) {
        sum += Math.abs(pcm16Buffer[i]);
      }
      const avgLevel = sum / pcm16Buffer.length;
      
      // Log audio transmission occasionally
      if (Math.random() < 0.005) { // Log ~0.5% of transmissions
        console.log('📡 Sending PCM16 audio to Azure, level:', (avgLevel/32768).toFixed(4), 'samples:', pcm16Buffer.length);
      }
      
      // Convert PCM16 to base64
      const uint8Array = new Uint8Array(pcm16Buffer.buffer);
      const base64Audio = btoa(String.fromCharCode(...uint8Array));
      
      // Send PCM16 audio data directly to Azure OpenAI
      wsRef.current.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64Audio
      }));
      
    } catch (error) {
      console.error('Error sending PCM16 audio:', error);
    }
  };

  const addMessage = (type: 'user' | 'assistant' | 'system', content: string) => {
    const message: VoiceMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const stopConversation = () => {
    if (isConversationActive) {
      setIsConversationActive(false);
      isConversationActiveRef.current = false;
      console.log('🎤 Conversation deactivated! isConversationActiveRef.current:', isConversationActiveRef.current);
      
      // Clear audio queue and stop playback only when manually stopping conversation
      audioQueueRef.current = [];
      isPlayingRef.current = false;
      console.log('🎵 Audio queue cleared on manual conversation stop');
      
      addMessage('system', '🎤 Conversación finalizada');
      
      // Clean up audio processing pipeline
      if (audioProcessorRef.current) {
        audioProcessorRef.current.disconnect();
        audioProcessorRef.current = null;
      }
      if (audioSourceRef.current) {
        audioSourceRef.current.disconnect();
        audioSourceRef.current = null;
      }
      
      // Stop all tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
        audioStreamRef.current = null;
      }
    }
  };

  const disconnectFromVoiceSystem = () => {
    console.log('Disconnecting from voice system...');
    
    // Stop conversation first
    if (isConversationActive) {
      stopConversation();
    }
    
    // Close WebSocket connection
    if (wsRef.current) {
      console.log('Closing WebSocket connection, current state:', wsRef.current.readyState);
      try {
        wsRef.current.close();
      } catch (error) {
        console.error('Error closing WebSocket:', error);
      }
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
    addMessage('system', '🔌 Desconectado del sistema de voz');
  };

  const sendTextMessage = (text: string) => {
    console.log('📤 Sending text message:', text);
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected, readyState:', wsRef.current?.readyState);
      return;
    }

    addMessage('user', text);
    
    const createMessage = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text: text
          }
        ]
      }
    };
    
    console.log('📤 Sending create message:', createMessage);
    wsRef.current.send(JSON.stringify(createMessage));

    // Trigger response
    const responseMessage = {
      type: 'response.create'
    };
    
    console.log('📤 Sending response trigger:', responseMessage);
    wsRef.current.send(JSON.stringify(responseMessage));
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 dark:bg-green-900/30 dark-blue:bg-green-900/30 text-green-800 dark:text-green-300 dark-blue:text-green-300';
      case 'connecting': return 'bg-yellow-100 dark:bg-yellow-900/30 dark-blue:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 dark-blue:text-yellow-300';
      case 'error': return 'bg-red-100 dark:bg-red-900/30 dark-blue:bg-red-900/30 text-red-800 dark:text-red-300 dark-blue:text-red-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400 dark-blue:text-blue-400" />
          <h2 className="text-xl font-semibold text-foreground heading-clear-dark">Chat por Voz</h2>
          <Badge className={getStatusColor()}>
            {connectionStatus}
          </Badge>
        </div>
        
        {!isConnected ? (
          <Button onClick={connectToVoiceSystem} disabled={connectionStatus === 'connecting'}>
            {connectionStatus === 'connecting' ? 'Conectando...' : 'Conectar Voz'}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={disconnectFromVoiceSystem}
              className="flex items-center gap-2"
            >
              Desconectar
            </Button>
            <Button
              variant={isConversationActive ? "destructive" : "default"}
              onClick={isConversationActive ? stopConversation : startConversation}
              className="flex items-center gap-2"
            >
              {isConversationActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isConversationActive ? 'Terminar Conversación' : 'Iniciar Conversación'}
            </Button>
          </div>
        )}
      </div>

      {/* Connection Warning */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 dark-blue:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 dark-blue:border-yellow-700 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 dark-blue:text-yellow-300 mb-2">⚠️ IMPORTANTE - Prevenir Múltiples Voces:</h4>
        <ul className="text-sm text-yellow-700 dark:text-yellow-200 dark-blue:text-yellow-200 space-y-1">
          <li>• <strong>Solo abra UNA pestaña</strong> de esta página de voz</li>
          <li>• <strong>Máximo 1 conexión</strong> de voz permitida a la vez</li>
          <li>• Si escucha múltiples voces, cierre todas las pestañas y abra solo una</li>
          <li>• Si hay problemas de conexión, espere 10 segundos e intente nuevamente</li>
        </ul>
      </div>

      {/* Quick Actions */}
      {isConnected && (
        <div className="bg-blue-50 dark:bg-blue-900/20 dark-blue:bg-blue-900/30 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 dark-blue:text-blue-300 mb-2">
            {isConversationActive ? "Try saying (speak naturally):" : "Try saying or clicking:"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <button 
              onClick={() => sendTextMessage("Create a new Twin profile")}
              className="text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 dark-blue:hover:bg-blue-800/40 rounded text-blue-700 dark:text-blue-300 dark-blue:text-blue-300"
              disabled={isConversationActive}
            >
              "Create a new Twin profile"
            </button>
            <button 
              onClick={() => sendTextMessage("Show me my Twin profiles")}
              className="text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 dark-blue:hover:bg-blue-800/40 rounded text-blue-700 dark:text-blue-300 dark-blue:text-blue-300"
              disabled={isConversationActive}
            >
              "Show me my Twin profiles"
            </button>
            <button 
              onClick={() => sendTextMessage("Find Jorge Luna's profile")}
              className="text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 dark-blue:hover:bg-blue-800/40 rounded text-blue-700 dark:text-blue-300 dark-blue:text-blue-300"
              disabled={isConversationActive}
            >
              "Find Jorge Luna's profile"
            </button>
            <button 
              onClick={() => sendTextMessage("What can you help me with?")}
              className="text-left p-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 dark-blue:hover:bg-blue-800/40 rounded text-blue-700 dark:text-blue-300 dark-blue:text-blue-300"
              disabled={isConversationActive}
            >
              "What can you help me with?"
            </button>
          </div>
          {isConversationActive && (
            <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/30 dark-blue:bg-green-900/30 rounded text-green-800 dark:text-green-300 dark-blue:text-green-300 text-sm">
              💬 <strong>Conversación activa:</strong> Habla naturalmente. El asistente responderá automáticamente cuando termines de hablar.
            </div>
          )}
        </div>
      )}

      {/* Messages */}
      <div className="bg-card rounded-lg border border-border max-h-96 overflow-y-auto">
        <div className="p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-clear-dark">No conversation yet. Connect and start talking about Twin profiles!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.type === 'system'
                    ? 'bg-muted text-muted-foreground text-sm'
                    : 'bg-muted text-foreground'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-200' : 'text-muted-foreground/70'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status Indicators */}
      {isConnected && (
        <div className="flex items-center justify-between text-sm text-muted-foreground text-clear-dark">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConversationActive ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'}`}></div>
              <span>{isConversationActive ? 'Conversation active...' : 'Ready to start conversation'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground/30'}`}></div>
              <span>{isSpeaking ? 'You are speaking...' : 'Listening for speech'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isAssistantSpeaking ? 'bg-purple-500 animate-pulse' : 'bg-muted-foreground/30'}`}></div>
              <span>{isAssistantSpeaking ? 'Assistant speaking...' : 'Assistant ready'}</span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground/70">
            Continuous Voice System • Real-time AI
          </div>
        </div>
      )}
    </div>
  );
}

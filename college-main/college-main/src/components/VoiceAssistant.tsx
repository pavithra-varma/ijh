import { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import { VoiceService } from '../lib/voiceService';
import { analyzeQuery, executeQuery } from '../lib/queryProcessor';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

const voiceService = new VoiceService();

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    if (!voiceService.isSpeechRecognitionSupported()) {
      setIsSupported(false);
      addMessage(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.',
        'assistant'
      );
    } else {
      addMessage(
        'Hello! I\'m your campus assistant. You can ask me about class schedules, upcoming events, department information, or general campus questions. Click the microphone to start.',
        'assistant'
      );
    }
  }, []);

  const addMessage = (text: string, type: 'user' | 'assistant') => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      type,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, message]);
  };

  const handleStartListening = () => {
    if (!isSupported) return;

    const success = voiceService.startListening(
      async (transcript) => {
        setTranscript(transcript);
        setIsListening(false);
        addMessage(transcript, 'user');
        await processQuery(transcript);
      },
      (error) => {
        setIsListening(false);
        console.error('Speech recognition error:', error);
        addMessage('Sorry, I had trouble hearing you. Please try again.', 'assistant');
      }
    );

    if (success) {
      setIsListening(true);
      setTranscript('');
    }
  };

  const handleStopListening = () => {
    voiceService.stopListening();
    setIsListening(false);
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);

    try {
      const processedQuery = analyzeQuery(query);
      const response = await executeQuery(processedQuery);

      addMessage(response, 'assistant');

      setIsSpeaking(true);
      voiceService.speak(response, () => {
        setIsSpeaking(false);
      });
    } catch (error) {
      console.error('Query processing error:', error);
      const errorMessage = 'I encountered an error processing your request. Please try again.';
      addMessage(errorMessage, 'assistant');
      voiceService.speak(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopSpeaking = () => {
    voiceService.stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Campus Voice Assistant</h1>
              <p className="text-sm text-slate-600 mt-1">Your intelligent campus companion</p>
            </div>
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-medium">Speaking...</span>
                </div>
              )}
              {isProcessing && (
                <div className="flex items-center gap-2 text-cyan-600 bg-cyan-50 px-4 py-2 rounded-full">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex-1 overflow-y-auto mb-8 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-6 py-4 rounded-2xl shadow-sm ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white ml-12'
                    : 'bg-white text-slate-800 mr-12 border border-slate-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isListening && (
            <div className="flex justify-start">
              <div className="max-w-3xl px-6 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm mr-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <p className="text-sm text-slate-600">Listening...</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-slate-200 p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-slate-800 mb-2">
                {isListening ? 'Listening to your voice...' : 'Ready to help'}
              </h2>
              <p className="text-sm text-slate-600 max-w-md">
                {isListening
                  ? 'Speak clearly and I\'ll help you find what you need'
                  : 'Press the button below and ask me anything about campus'}
              </p>
            </div>

            <div className="relative">
              <button
                onClick={isListening ? handleStopListening : handleStartListening}
                disabled={!isSupported || isProcessing || isSpeaking}
                className={`
                  relative w-24 h-24 rounded-full shadow-lg transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-blue-300
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 scale-110'
                      : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
                  }
                `}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-10 h-10 text-white mx-auto" />
                    <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20"></div>
                  </>
                ) : (
                  <Mic className="w-10 h-10 text-white mx-auto" />
                )}
              </button>
            </div>

            {isSpeaking && (
              <button
                onClick={handleStopSpeaking}
                className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-medium transition-colors"
              >
                Stop Speaking
              </button>
            )}

            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {[
                'What classes do I have today?',
                'Show me upcoming events',
                'Where is the Computer Science department?',
                'Tell me about library hours',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    addMessage(suggestion, 'user');
                    processQuery(suggestion);
                  }}
                  disabled={isListening || isProcessing || isSpeaking}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-full text-xs font-medium transition-colors border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

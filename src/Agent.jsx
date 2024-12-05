import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { MicrophoneIcon, StopIcon, ClipboardIcon } from '@heroicons/react/24/solid';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const VoiceCodeGenerator = () => {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedChat, setExpandedChat] = useState(null);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  useEffect(() => {
    if (expandedChat !== null) {
      const element = document.getElementById(`chat-${expandedChat}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [expandedChat]);

  if (!browserSupportsSpeechRecognition) {
    return <div className="text-red-500">Browser doesn't support speech recognition.</div>;
  }

    const handleGenerateCode = async () => {
      setIsLoading(true);
      try {
        // Collect user data (name, job role, programming language, etc.)
        const userDetails = {
          name,
          jobRole,
          jobDescription,
          programmingLanguage,
          experience,
          education,
          projects,
        };
    
        // Format the system message with user details and parsed resume data
        const systemMessage = `Your Name is ${userDetails.name} and you are an expert programmer in Programming Language ${userDetails.programmingLanguage}. you are interviewing for ${userDetails.company} for job role of ${userDetails.jobRole} which Job Description is ${userDetails.jobDescription} and you have Experiences about ${userDetails.experience} and this is ${userDetails.education} your Education you have made these ${userDetails.projects} Projects 
        Your task is to answer to te questions and if needed generate clean, efficient, and well-commented code based on the user's request.`;
    
        // Add the system message along with the user’s input to the conversation history
        const messages = [
          { role: "system", content: systemMessage },
          ...chatHistory,
          {
            role: "user",
            content: `${transcript}`
          }
        ];
    
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_MISTRAL_API_KEY}`
          },
          body: JSON.stringify({
            model: "mistral-large-latest",
            messages: messages,
            temperature: 0.4,
            max_tokens: 2048
          })
        });
    
        const data = await response.json();
    
        if (!data || !data.choices) {
          console.error('Unexpected API response:', data);
          setGeneratedCode('Error: Unexpected API response');
          return;
        }
    
        const assistantResponse = data.choices[0]?.message?.content || 'No code generated';
        setGeneratedCode(assistantResponse);
    
        setChatHistory([
          ...chatHistory,
          { role: "user", content: transcript },
          { role: "assistant", content: assistantResponse }
        ]);
    
        resetTranscript();
    
      } catch (error) {
        console.error('Error generating code:', error);
        setGeneratedCode('Error: Failed to generate code');
      }
      setIsLoading(false);
    };
   
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const formatOutput = (text) => {
    // Split the text into segments of code and normal text
    const segments = text.split(/(```[\s\S]*?```)/);
    
    return segments.map((segment, index) => {
      if (segment.startsWith('```')) {
        // Extract language and code
        const codeContent = segment.replace(/```(\w+)?\n?/, '').replace(/```$/, '');
        const language = segment.match(/```(\w+)?/)?.[1] || 'javascript';
        
        return (
          <div key={index} className="my-4">
            <SyntaxHighlighter
              language={language}
              style={atomOneDark}
              customStyle={{
                borderRadius: '0.5rem',
                padding: '1rem',
                margin: '0',
              }}
              wrapLines={true}
              wrapLongLines={true}
            >
              {codeContent.trim()}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        return (
          <p key={index} className="text-white my-2 whitespace-pre-wrap">
            {segment.trim()}
          </p>
        );
      }
    });
  };

  const clearHistory = () => {
    setChatHistory([]);
    setGeneratedCode('');
    resetTranscript();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
          Voice to Code Generator
        </h1>
        
        <div className="bg-gray-800 rounded-xl shadow-2xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <button
              onClick={() => SpeechRecognition.startListening({ continuous: true })}
              className={`p-4 rounded-full ${
                listening 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-blue-500 hover:bg-blue-600'
              } text-white transition-all duration-200 transform hover:scale-105 shadow-lg`}
            >
              <MicrophoneIcon className="h-6 w-6" />
            </button>
            <button
              onClick={SpeechRecognition.stopListening}
              className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 text-white transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <StopIcon className="h-6 w-6" />
            </button>
            <button
              onClick={resetTranscript}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Reset
            </button>
          </div>

          {chatHistory.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-white">Chat History:</h2>
                <button
                  onClick={clearHistory}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm"
                >
                  Clear History
                </button>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-900 rounded-lg border border-gray-700">
                {chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    id={`chat-${index}`}
                    onClick={() => setExpandedChat(expandedChat === index ? null : index)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      msg.role === 'user'
                        ? 'bg-blue-900 hover:bg-blue-800 ml-4'
                        : 'bg-gray-800 hover:bg-gray-700 mr-4'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-400">
                        {msg.role === 'user' ? 'You:' : 'Assistant:'}
                      </p>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                          expandedChat === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                    
                    <div className={`text-white overflow-hidden transition-all duration-200 ${
                      expandedChat === index 
                        ? 'max-h-[1000px] mt-2' 
                        : 'max-h-[1.5rem] text-ellipsis overflow-hidden whitespace-nowrap'
                    }`}>
                      {msg.role === 'assistant' 
                        ? formatOutput(msg.content)
                        : msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-white flex items-center">
              <MicrophoneIcon className="h-5 w-5 mr-2 text-blue-400" />
              Voice Input:
            </h2>
            <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <span className="text-white">{transcript}</span>
            </div>
          </div>

          <button
            onClick={handleGenerateCode}
            disabled={isLoading || !transcript}
            className="w-full py-2 bg-green-500 text-white rounded-md mb-6 disabled:bg-gray-300"
          >
            {isLoading ? 'Generating...' : 'Generate Code'}
          </button>

          {generatedCode && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">Generated Code:</h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-gray-700 rounded-md text-white"
                  title="Copy to clipboard"
                >
                  <ClipboardIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                {formatOutput(generatedCode)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceCodeGenerator;

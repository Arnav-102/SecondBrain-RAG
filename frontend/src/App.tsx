import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Upload, Send, BrainCircuit, FileText, Loader2, Bot, User, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('sb_messages');
    return saved ? JSON.parse(saved) : [{ id: 1, role: 'bot', text: 'Hello! I am your Second Brain. Upload documents and ask me anything about them.' }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('sb_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('sb_messages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('sb_files', JSON.stringify(files));
  }, [files]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: 'Error connecting to backend.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleDeleteFile = async (filename: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/documents/${filename}`, { method: 'DELETE' });
      if (res.ok) {
        setFiles(prev => prev.filter(f => f.name !== filename));
      }
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setFiles(prev => [...prev, { name: file.name, size: `${(file.size / 1024).toFixed(1)} KB` }]);
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-brain-900 font-sans">
      {/* Background blobs */}
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[120px] opacity-40 bg-[radial-gradient(circle,_#8a2be2_0%,_transparent_70%)] animate-[float_20s_ease-in-out_infinite_alternate] z-0"></div>
      <div className="absolute -bottom-[10%] -right-[10%] w-[40vw] h-[40vw] rounded-full mix-blend-screen filter blur-[120px] opacity-40 bg-[radial-gradient(circle,_#4169e1_0%,_transparent_70%)] animate-[float_20s_ease-in-out_infinite_alternate-reverse] z-0" style={{ animationDelay: '-10s' }}></div>

      {/* Header */}
      <header className="glass-panel m-5 px-8 py-4 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-3">
          <BrainCircuit size={32} className="text-[#8a2be2]" />
          <h1 className="text-gradient text-2xl font-semibold tracking-tight">Second Brain v2</h1>
        </div>
        <a href="https://github.com/madsLorentzen/ai-job-search" target="_blank" rel="noreferrer" className="no-underline">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-colors font-medium"
          >
            <Code size={20} />
            View on GitHub
          </motion.button>
        </a>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex gap-6 px-5 pb-5 h-[calc(100vh-120px)] z-10 relative">
        
        {/* Left Sidebar: Knowledge Base */}
        <aside className="glass-panel w-80 flex flex-col p-6">
          <h2 className="text-xl font-medium mb-5">Knowledge Base</h2>
          
          <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2 custom-scrollbar">
            <AnimatePresence>
              {files.map((f, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5"
                >
                  <FileText size={24} className="text-[#4169e1]" />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm text-white font-medium truncate">{f.name}</span>
                    <span className="text-xs text-gray-400">{f.size}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteFile(f.name)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors bg-white/5 rounded-lg hover:bg-red-400/20"
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-5">
            <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt" />
            <motion.label 
              htmlFor="file-upload"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#8a2be2] to-[#4169e1] text-white p-3 rounded-xl cursor-pointer font-medium w-full shadow-lg hover:shadow-xl transition-shadow"
            >
              {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </motion.label>
          </div>
        </aside>

        {/* Right Area: Chat Interface */}
        <section className="glass-panel flex-1 flex flex-col p-6 relative">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-5 pr-3 custom-scrollbar">
            {messages.map((msg) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-white/10' : 'bg-[#8a2be2]'}`}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={`p-4 max-w-[80%] border ${
                  msg.role === 'user' 
                    ? 'bg-white/5 border-white/5 rounded-2xl rounded-tr-none' 
                    : 'bg-[#8a2be2]/10 border-[#8a2be2]/20 rounded-2xl rounded-tl-none'
                }`}>
                  <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-black/40 prose-pre:border prose-pre:border-white/10 max-w-none text-[15px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#8a2be2]">
                  <Bot size={20} />
                </div>
                <div className="p-4 flex items-center gap-1.5">
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="mt-5 flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about the documents..."
              className="flex-1 px-5 py-4 rounded-xl bg-black/20 border border-white/10 text-white font-sans text-base outline-none focus:border-[#8a2be2]/50 transition-colors"
            />
            <motion.button 
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isTyping}
              className={`px-6 rounded-xl bg-gradient-to-r from-[#8a2be2] to-[#4169e1] text-white flex items-center justify-center ${isTyping ? 'opacity-70' : 'opacity-100'} shadow-lg hover:shadow-xl transition-shadow`}
            >
              <Send size={20} />
            </motion.button>
          </form>

        </section>
      </main>
    </div>
  );
}

export default App;

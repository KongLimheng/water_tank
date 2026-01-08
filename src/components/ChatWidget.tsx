import {
  Bot,
  Loader2,
  MessageCircle,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { createChatSession } from '../services/geminiService'
import { ChatMessage } from '../types'

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi there! 👋 I'm HydroBot. How can I keep you hydrated today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const chatSessionRef = useRef<any>(null) // Keep chat session persistent
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession()
      } catch (e) {
        console.error('Failed to init chat', e)
      }
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const resultStream = await chatSessionRef.current.sendMessageStream({
        message: userMsg.text,
      })

      let fullResponseText = ''
      const botMsgId = (Date.now() + 1).toString()

      // Add placeholder message
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          role: 'model',
          text: '',
          timestamp: new Date(),
        },
      ])

      for await (const chunk of resultStream) {
        const c = chunk as GenerateContentResponse
        const text = c.text || ''
        fullResponseText += text

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMsgId ? { ...msg, text: fullResponseText } : msg
          )
        )
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'model',
          text: "I'm having a little trouble connecting to the hydration network right now. Please try again later! 🚱",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] max-w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-primary-100 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right animate-in fade-in slide-in-from-bottom-10">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-500 p-4 flex justify-between items-center text-white">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-full">
                <Sparkles size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">H2O Assistant</h3>
                <p className="text-xs text-primary-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-primary-600" />
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm flex items-center gap-2">
                  <Loader2
                    size={16}
                    className="animate-spin text-primary-500"
                  />
                  <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask about pH, delivery, or products..."
                className="flex-1 bg-transparent px-3 py-1 outline-none text-sm text-slate-700 placeholder:text-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-2">
              Powered by Gemini 2.5 Flash
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-primary-200"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
        )}
      </button>
    </div>
  )
}

export default ChatWidget

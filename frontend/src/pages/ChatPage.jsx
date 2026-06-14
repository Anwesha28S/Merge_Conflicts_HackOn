import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Zap, Trash2, ArrowRight, Settings, Sliders, ShieldCheck, Heart, Sparkles, Scale, Mic, Volume2, VolumeX } from 'lucide-react'
import Header from '../components/Layout/Header'
import CartSidebar from '../components/Cart/CartSidebar'
import MessageBubble from '../components/Chat/MessageBubble'
import { chatAPI, profileAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import useSpeech from '../hooks/useSpeech'

export default function ChatPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.username || 'there'}! 👋 I'm Aria, your quick commerce shopping buddy. What are we shopping for today?`,
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)

  // Agent / checkout state
  const [checkout, setCheckout] = useState(null)            // { stage, selected_ids } | null
  const [lastRecommendedIds, setLastRecommendedIds] = useState([])
  const [quickReplies, setQuickReplies] = useState([])

  // Voice (Alexa-style) state
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const handleVoiceResult = (text) => {
    if (text) handleSend(null, text)
  }
  const {
    sttSupported,
    ttsSupported,
    listening,
    speaking,
    interim,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  } = useSpeech({ onResult: handleVoiceResult })

  // Preferences state
  const [preferences, setPreferences] = useState({
    is_vegetarian: false,
    is_vegan: false,
    is_high_protein: false,
    weight_loss_mode: false,
    budget_preference: 500,
    favorite_categories: []
  })
  const [prefLoading, setPrefLoading] = useState(false)
  const [prefSuccess, setPrefSuccess] = useState(false)

  // Fetch user profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await profileAPI.get()
        if (res.data) {
          setPreferences(res.data)
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    }
    loadProfile()
  }, [])

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom()
    } else {
      // Scroll to the absolute top of the page when chat is fresh
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [messages])

  // Send message
  const handleSend = async (e, overrideText, overrideRecommendedIds) => {
    if (e) e.preventDefault()
    const textToSend = (overrideText ?? input).trim()
    if (!textToSend || sending) return

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date().toISOString()
    }

    setMessages((prev) => [...prev, userMessage])
    if (!overrideText) setInput('')
    setSending(true)
    setQuickReplies([])

    const chatHistory = messages.map((m) => ({
      role: m.role,
      content: m.content
    }))

    try {
      const res = await chatAPI.send(
        userMessage.content,
        chatHistory,
        overrideRecommendedIds ?? lastRecommendedIds,
        checkout,
      )

      const data = res.data
      const botMessage = {
        role: 'assistant',
        content: data.message,
        recommendations: data.recommendations || [],
        total: data.total,
        reasoning: data.reasoning,
        current_state: data.current_state || 'BROWSING',
        action: data.action || 'NONE',
        missing_details: data.missing_details || [],
        checkout_items: data.checkout_items || [],
        recipe_mode: data.recipe_mode || false,
        skipped_ingredients: data.skipped_ingredients || [],
        cart_optimization: data.cart_optimization || null,
        amazon_departments: data.amazon_departments || [],
        order_id: data.order_id || '',
        kit_title: data.kit_title || '',
        timestamp: new Date().toISOString()
      }

      setMessages((prev) => [...prev, botMessage])

      setCheckout(data.checkout || null)
      setQuickReplies(data.quick_replies || [])
      if (data.recommendations && data.recommendations.length > 0) {
        setLastRecommendedIds(data.recommendations.map((r) => r.id))
      }

      if (voiceEnabled && ttsSupported && data.speak !== false) {
        speak(data.message)
      }

      if (data.action === 'REDIRECT_TO_PAYMENT' && data.order_id) {
        setTimeout(() => navigate(`/payment/${data.order_id}`), 1600)
      }
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: err.response?.data?.detail
          ? `Sorry, something went wrong: ${err.response.data.detail}`
          : 'Sorry, I could not reach the recommendation service. Please check that the backend is running and try again.',
        timestamp: new Date().toISOString()
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setSending(false)
    }
  }

  const suggestions = [
    { text: 'Movie night snacks under ₹300', emoji: '🍿' },
    { text: 'Healthy high-protein gym breakfast', emoji: '💪' },
    { text: 'I want to cook paneer butter masala for 3 people', emoji: '🍳' },
    { text: 'Fresh fruits and salads on budget', emoji: '🍓' },
    { text: 'Need a tea break for 3 people', emoji: '☕' },
    { text: 'Party snacks for IPL match night', emoji: '🏏' },
  ]

  const handleSuggestionClick = (text) => {
    setInput(text)
  }

  const handleBuyNow = (product) => {
    if (!product?.id || sending) return
    handleSend(null, `I want to buy ${product.name}`, [product.id])
  }

  const handleQuickReply = (text) => {
    handleSend(null, text)
  }

  const toggleMic = () => {
    if (listening) {
      stopListening()
    } else {
      stopSpeaking()
      startListening()
    }
  }

  const handleSavePreferences = async () => {
    setPrefLoading(true)
    setPrefSuccess(false)
    try {
      const res = await profileAPI.update(preferences)
      setPreferences(res.data)
      setPrefSuccess(true)
      setTimeout(() => setPrefSuccess(false), 2000)

      const favs = preferences.favorite_categories || []
      const dietBits = []
      if (preferences.is_vegan) dietBits.push('vegan')
      else if (preferences.is_vegetarian) dietBits.push('vegetarian')
      if (preferences.is_high_protein) dietBits.push('high-protein')
      if (preferences.weight_loss_mode) dietBits.push('low-calorie')

      let regenQuery
      if (favs.length > 0) {
        regenQuery = `Show me ${dietBits.join(' ')} ${favs.join(', ')} options within my ₹${preferences.budget_preference} budget`.replace(/\s+/g, ' ').trim()
      } else if (dietBits.length > 0) {
        regenQuery = `Recommend ${dietBits.join(' ')} items within my ₹${preferences.budget_preference} budget`
      } else {
        regenQuery = `Suggest some good items within my ₹${preferences.budget_preference} budget`
      }
      setCheckout(null)
      handleSend(null, regenQuery)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setPrefLoading(false)
    }
  }

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared! How else can I assist you with shopping today?",
        timestamp: new Date().toISOString()
      }
    ])
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <CartSidebar />

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 flex gap-6 overflow-hidden h-[calc(100vh-64px)]">

        {/* Left/Chat Column */}
        <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl flex flex-col overflow-hidden shadow-xl border border-white/50 relative">

          {/* Top Info Bar */}
          <div className="px-6 py-4 flex justify-between items-center bg-white z-10 shadow-sm border-b border-gray-50">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              <span className="text-sm font-extrabold text-gray-700 uppercase tracking-widest">Ask Aria</span>
              {speaking && (
                <span className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 ml-2 bg-green-50 px-2 py-0.5 rounded-full">
                  <Volume2 size={12} className="animate-pulse" /> Speaking
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {ttsSupported && (
                <button
                  onClick={() => { setVoiceEnabled((v) => !v); stopSpeaking() }}
                  title={voiceEnabled ? 'Voice replies on' : 'Voice replies off'}
                  className={`text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 px-2.5 py-1.5 rounded-lg ${voiceEnabled ? 'text-green-700 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-50'
                    }`}
                >
                  {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span className="hidden sm:inline">Voice</span>
                </button>
              )}
              <button
                onClick={clearChat}
                className="text-xs text-gray-400 hover:text-red-500 font-semibold flex items-center gap-1.5 transition-all duration-300 px-2.5 py-1.5 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={14} /> Clear
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 chat-scroll bg-gray-50/30">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} onBuyNow={handleBuyNow} />
            ))}

            {/* Thinking Indicator */}
            {sending && (
              <div className="flex gap-3 animate-fade-in justify-start">
                <div className="bg-white rounded-2xl rounded-tl-none px-5 py-4 shadow-sm border border-gray-100 flex flex-col gap-2 max-w-[80%]">
                  <div className="flex items-center gap-2 text-xs font-bold text-green-700">
                    <Sparkles size={14} className="animate-spin text-green-600" />
                    Analyzing catalog & compiling recommendations...
                  </div>
                  <div className="loading-dots mt-1">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {/* Quick suggestions on empty context */}
            {messages.length === 1 && (
              <div className="mt-8 animate-fade-in space-y-8 pb-4">

                {/* Scroll Down Button */}
                <div className="flex justify-start">
                  <button 
                    onClick={scrollToBottom}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-600 hover:text-green-700 hover:bg-green-50 rounded-xl font-bold text-sm transition-all duration-300 btn-press border border-gray-200 hover:border-green-200 shadow-sm"
                  >
                    Go down to give prompt <ArrowRight size={16} className="rotate-90" />
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-500" /> Browse Categories
                  </h4>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { name: 'Laptops', img: '/images/categories/laptops.png' },
                      { name: 'Furniture', img: '/images/categories/furniture.png' },
                      { name: 'Skin Care', img: '/images/categories/skincare.png' },
                      { name: 'Groceries', img: '/images/categories/groceries.png' },
                    ].map((cat, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(null, `Show me some ${cat.name}`)}
                        className="relative h-32 rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition-all duration-300 btn-press"
                      >
                        <img src={cat.img} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors duration-300" />
                        <span className="absolute bottom-3 left-3 text-white font-bold text-sm tracking-wide shadow-black drop-shadow-md">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" /> Quick Prompts
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(sug.text)}
                        className="px-4 py-2.5 rounded-xl border border-gray-100 bg-white hover:bg-green-50/50 hover:border-green-200 hover:shadow-sm text-left text-sm font-medium text-gray-700 transition-all duration-300 flex items-center gap-2 group btn-press"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform duration-300">{sug.emoji}</span>
                        <span>{sug.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form */}
          <form onSubmit={handleSend} className="p-5 bg-white border-t border-gray-50 z-10">
            {quickReplies.length > 0 && !sending && (
              <div className="flex flex-wrap gap-2 mb-4">
                {quickReplies.map((qr, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleQuickReply(qr)}
                    className="px-4 py-2 rounded-full border border-green-200 bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 hover:shadow-sm transition-all duration-300 btn-press"
                  >
                    {qr}
                  </button>
                ))}
              </div>
            )}

            {/* Refined Input Area */}
            <div className="flex gap-3 bg-white border border-gray-200 rounded-2xl p-1.5 shadow-sm hover:shadow-md transition-shadow duration-300">
              <input
                id="chat-input"
                type="text"
                value={listening ? (interim || 'Listening…') : input}
                onChange={(e) => setInput(e.target.value)}
                disabled={sending || listening}
                placeholder="Ask Aria, or say 'I want to buy this'…"
                className="flex-1 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
              />
              {sttSupported && (
                <button
                  type="button"
                  onClick={toggleMic}
                  disabled={sending}
                  title={listening ? 'Stop listening' : 'Speak to Aria'}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 btn-press flex-shrink-0 ${listening
                    ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  <Mic size={18} />
                </button>
              )}
              <button
                id="chat-submit"
                type="submit"
                disabled={!input.trim() || sending}
                className="w-11 h-11 bg-green-gradient text-white rounded-xl flex items-center justify-center shadow-green hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 transition-all duration-300 btn-press flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-3 font-medium">
              {sttSupported
                ? '🎙️ Tap the mic to shop hands-free — say "buy this" and Aria completes the order.'
                : '🤖 Aria personalizes recommendations. Say "buy this" to start an order.'}
            </p>
          </form>

        </div>

        {/* Right Preferences Sidebar */}
        <div className="hidden lg:flex w-[340px] bg-gray-50 rounded-3xl flex-col overflow-hidden shadow-inner border border-gray-200/60">

          <div className="px-6 py-5 bg-white border-b border-gray-100 flex items-center gap-3">
            <Sliders size={20} className="text-green-600" />
            <h3 className="font-extrabold text-gray-900 text-base">Shopping Filters</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">

            {/* Diet Prefs Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-4">Dietary Mode</label>
              <div className="space-y-2.5">
                {[
                  { key: 'is_vegetarian', label: '🌿 Vegetarian', desc: 'Exclude meat & fish' },
                  { key: 'is_vegan', label: '🌱 Vegan', desc: '100% plant-based items' },
                  { key: 'is_high_protein', label: '💪 High Protein', desc: 'Focus on fitness & gym food' },
                  { key: 'weight_loss_mode', label: '⚖️ Weight Loss', desc: 'Prefer light, low-calorie options' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setPreferences({ ...preferences, [item.key]: !preferences[item.key] })}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all duration-300 ${preferences[item.key]
                      ? item.key === 'weight_loss_mode'
                        ? 'bg-purple-50 border-purple-500 text-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.1)]'
                        : 'bg-green-50 border-green-500 text-green-800 shadow-[0_0_10px_rgba(34,197,94,0.1)]'
                      : 'bg-white border-gray-100 hover:border-gray-200 text-gray-700 hover:bg-gray-50/50'
                      }`}
                  >
                    <p className="font-bold text-xs">{item.label}</p>
                    <p className={`text-[10px] mt-1 ${preferences[item.key]
                      ? item.key === 'weight_loss_mode' ? 'text-purple-600' : 'text-green-600'
                      : 'text-gray-400'
                      }`}>{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Pref Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Default Budget</label>
                <span className="text-sm font-extrabold text-green-700 bg-green-50 px-2 py-1 rounded-md">₹{preferences.budget_preference}</span>
              </div>

              <div className="flex gap-2 mb-4">
                {[500, 1000, 5000, 10000, 50000].map(val => (
                  <button
                    key={val}
                    onClick={(e) => { e.preventDefault(); setPreferences({ ...preferences, budget_preference: val }) }}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg border transition-all duration-300 ${preferences.budget_preference === val
                        ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    ₹{val >= 1000 ? `${val / 1000}k` : val}
                  </button>
                ))}
              </div>

              <input
                id="pref-budget"
                type="range"
                min="500"
                max="200000"
                step="500"
                value={preferences.budget_preference}
                onChange={(e) => setPreferences({ ...preferences, budget_preference: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-semibold">
                <span>₹500</span>
                <span>₹2,00,000</span>
              </div>
            </div>

            {/* Favorite Categories Card */}
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block mb-4">Favorite Categories</label>
              <div className="flex flex-wrap gap-2">
                {['Snacks', 'Beverages', 'Dairy', 'Breakfast', 'Fruits', 'Vegetables', 'Healthy', 'Instant', 'Bakery'].map((cat) => {
                  const isFav = preferences.favorite_categories?.includes(cat)
                  return (
                    <button
                      key={cat}
                      onClick={() => {
                        const next = isFav
                          ? preferences.favorite_categories.filter((c) => c !== cat)
                          : [...(preferences.favorite_categories || []), cat]
                        setPreferences({ ...preferences, favorite_categories: next })
                      }}
                      className={`py-1.5 px-3 text-[11px] font-bold rounded-full border transition-all duration-300 ${isFav
                        ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-500/20'
                        : 'bg-white border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Update Profile Button */}
            <div className="pt-2">
              <button
                onClick={handleSavePreferences}
                disabled={prefLoading}
                className="w-full py-3.5 bg-green-gradient text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 hover:shadow-lg transition-all duration-300 btn-press shadow-green"
              >
                {prefLoading ? 'Saving...' : prefSuccess ? 'Preferences Saved! ✓' : 'Save Preference Filters'}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-green-100 shadow-sm flex gap-3 items-start">
              <ShieldCheck size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Aria uses weather, time of day, and your dietary preferences to personalize every recommendation. Try asking to cook a recipe!
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
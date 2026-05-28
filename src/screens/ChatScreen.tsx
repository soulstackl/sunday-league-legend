import { useState, useEffect, useRef } from 'react'
import { Badge } from '../components/shared/Badge'
import { ChatBubble } from '../components/chat/ChatBubble'
import { NPCS } from '../data/npcs'
import type { SaveState, ChatChoice } from '../types/game'

interface ChatScreenProps {
  store: SaveState
  onSendMessage: (message: string) => void
  onBack: () => void
  onChoice: (choice: ChatChoice) => void
}

export function ChatScreen({ store, onSendMessage, onBack, onChoice }: ChatScreenProps) {
  const [input, setInput] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [store.groupChatLog])

  const handleSend = () => {
    if (!input.trim()) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--charcoal)', color: 'var(--cream)', borderBottom: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Badge size={30} />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>Dog &amp; Duck Group Chat</div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>{Object.keys(NPCS).length} Active Members</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--cream)', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' }}>Close</button>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
        {store.groupChatLog.map((msg, i) => (
          <ChatBubble key={i} message={msg} onChoice={onChoice} />
        ))}
      </div>
      <div style={{ display: 'flex', padding: '8px', background: 'var(--card-bg)', borderTop: '2px solid var(--border)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type message..."
          style={{ flex: 1, padding: '10px', fontSize: '14px', border: '1px solid var(--border)', borderRadius: '18px', marginRight: '8px' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button onClick={handleSend} style={{ width: '44px', height: '36px', background: 'var(--kit-amber)', border: 'none', borderRadius: '18px', cursor: 'pointer', fontWeight: 'bold' }}>
          Send
        </button>
      </div>
    </div>
  )
}

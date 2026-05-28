import { useState, useEffect, useRef } from 'react'
import { SendHorizontal } from 'lucide-react'
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
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Badge size={28} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text)', fontFamily: 'var(--font-display)' }}>Dog &amp; Duck</div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>{Object.keys(NPCS).length} members</div>
          </div>
        </div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: '6px', fontFamily: 'var(--font-ui)' }}>Done</button>
      </div>

      <div ref={containerRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {store.groupChatLog.map((msg, i) => (
          <ChatBubble key={i} message={msg} onChoice={onChoice} />
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', padding: '10px 12px', background: 'var(--card-bg)', borderTop: '1px solid var(--border)', alignItems: 'center' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the lads..."
          style={{ flex: 1, padding: '10px 14px', fontSize: '14px', border: '1px solid var(--border)', borderRadius: '20px', background: 'var(--surface)', color: 'var(--text)' }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button
          onClick={handleSend}
          aria-label="Send message"
          style={{ width: '40px', height: '40px', background: 'var(--accent)', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
        >
          <SendHorizontal size={16} color="#0C0C10" />
        </button>
      </div>
    </div>
  )
}

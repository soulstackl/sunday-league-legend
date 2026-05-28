import type { ChatMessage, ChatChoice } from '../../types/game'
import { NPCS } from '../../data/npcs'
import { NpcAvatar } from '../shared/NpcAvatar'

interface Props {
  message: ChatMessage
  onChoice: (choice: ChatChoice) => void
}

export function ChatBubble({ message, onChoice }: Props) {
  const isPlayer = message.sender === 'player'
  const isSystem = message.sender === 'system'
  const senderNpc = NPCS[message.sender]

  if (isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ background: 'var(--surface)', color: 'var(--text-muted)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontFamily: 'var(--font-mono)', border: '1px solid var(--border)' }}>
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isPlayer ? 'flex-end' : 'flex-start', marginBottom: '12px', alignItems: 'flex-end', gap: '8px', animation: 'slideUp 0.25s ease-out' }}>
      {!isPlayer && <NpcAvatar npcId={message.sender} size={28} />}
      <div style={{
        maxWidth: '78%',
        background: isPlayer ? 'var(--accent-bg-strong)' : 'var(--surface)',
        border: `1px solid ${isPlayer ? 'rgba(240,168,48,0.25)' : 'var(--border)'}`,
        borderRadius: isPlayer ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        padding: '10px 14px',
      }}>
        {!isPlayer && (
          <div style={{ fontSize: '11px', fontWeight: 700, color: senderNpc?.bg ?? 'var(--accent)', marginBottom: '3px', letterSpacing: '0.02em' }}>
            {senderNpc?.name}
          </div>
        )}
        <div style={{ fontSize: '14px', lineHeight: '1.45', color: 'var(--text)' }}>{message.text}</div>

        {message.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            {message.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => onChoice(c)}
                style={{
                  background: 'var(--surface-raised)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'var(--text)',
                  transition: 'background 0.15s',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                {c.text}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: '10px', textAlign: 'right', color: 'var(--text-faint)', marginTop: '5px', fontFamily: 'var(--font-mono)' }}>
          {message.time}
        </div>
      </div>
    </div>
  )
}

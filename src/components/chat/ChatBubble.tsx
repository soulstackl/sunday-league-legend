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
      <div style={{ display: 'flex', justifyContent: 'center', margin: '8px 0', animation: 'fadeIn 0.3s ease' }}>
        <div style={{ background: 'var(--border)', color: 'var(--charcoal)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontFamily: 'var(--font-mono)', border: '1px solid rgba(0,0,0,0.05)' }}>
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: isPlayer ? 'flex-end' : 'flex-start', marginBottom: '10px', alignItems: 'flex-end', gap: '6px', animation: 'slideUp 0.3s ease-out' }}>
      {!isPlayer && <NpcAvatar npcId={message.sender} size={30} />}
      <div style={{
        maxWidth: '75%',
        background: isPlayer ? 'var(--cream)' : 'var(--card-bg)',
        border: '2px solid var(--border)',
        borderRadius: isPlayer ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        padding: '8px 12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
      }}>
        {!isPlayer && (
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: senderNpc?.bg ?? 'var(--charcoal)', marginBottom: '2px' }}>
            {senderNpc?.name}
          </div>
        )}
        <div style={{ fontSize: '14px', lineHeight: '1.4' }}>{message.text}</div>

        {message.choices && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '8px' }}>
            {message.choices.map((c, i) => (
              <button
                key={i}
                onClick={() => onChoice(c)}
                style={{
                  background: 'rgba(255,255,255,0.7)', border: '1px solid var(--charcoal)', borderRadius: '16px',
                  padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer',
                  textAlign: 'left', transition: 'background 0.2s',
                }}
              >
                {c.text}
              </button>
            ))}
          </div>
        )}

        <div style={{ fontSize: '9px', textAlign: 'right', color: 'var(--warm-grey)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
          {message.time}
        </div>
      </div>
    </div>
  )
}

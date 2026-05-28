interface AudioManagerType {
  init(): void
  playKick(variant?: 'strike' | 'pass' | 'header'): void
  playWhistle(): void
  playGoal(): void
  playMiss(): void
  playPing(): void
  playOoh(): void
  playGroan(): void
  playPost(): void
  playCrowdMurmur(intensity?: number): void
  toggleMute(): boolean
  getIsMuted(): boolean
}

export const AudioManager: AudioManagerType = (() => {
  let audioCtx: AudioContext | null = null
  let masterGain: GainNode | null = null
  let isMuted = false

  const init = () => {
    if (audioCtx) return
    audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!)()
    masterGain = audioCtx.createGain()
    masterGain.connect(audioCtx.destination)
  }

  const playOsc = (freq: number, type: OscillatorType, volume: number, duration: number, ramp = true) => {
    if (!audioCtx || !masterGain || isMuted) return
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    if (ramp) gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration)
    osc.connect(gain)
    gain.connect(masterGain)
    osc.start()
    osc.stop(audioCtx.currentTime + duration)
  }

  const playNoise = (duration: number, volume: number, freq = 600, q = 8) => {
    if (!audioCtx || !masterGain || isMuted) return
    const bufferSize = audioCtx.sampleRate * duration
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
    const out = noiseBuffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) out[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    const src = audioCtx.createBufferSource()
    src.buffer = noiseBuffer
    const filter = audioCtx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = freq
    filter.Q.value = q
    const gain = audioCtx.createGain()
    gain.gain.setValueAtTime(volume, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)
    src.start()
    src.stop(audioCtx.currentTime + duration)
  }

  return {
    init,
    playKick(variant = 'strike') {
      if (variant === 'pass') {
        playOsc(180, 'sine', 0.35, 0.08)
      } else if (variant === 'header') {
        playOsc(120, 'square', 0.4, 0.07)
      } else {
        playOsc(110, 'sine', 0.55, 0.12)
        playOsc(220, 'triangle', 0.25, 0.08)
      }
    },
    playWhistle() {
      playOsc(800, 'sine', 0.2, 0.1, false)
      setTimeout(() => playOsc(800, 'sine', 0.2, 0.3), 150)
    },
    playGoal() {
      playOsc(440, 'square', 0.12, 0.6)
      playOsc(660, 'sine', 0.12, 0.6)
      setTimeout(() => playOsc(880, 'sine', 0.1, 0.4), 200)
      playNoise(1.2, 0.18, 800, 3)
      setTimeout(() => playNoise(0.8, 0.12, 1200, 4), 250)
    },
    playMiss: () => playOsc(100, 'triangle', 0.3, 0.4),
    playPing: () => playOsc(1200, 'sine', 0.1, 0.1),
    playOoh() {
      if (!audioCtx || !masterGain || isMuted) return
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(440, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, audioCtx.currentTime + 0.5)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5)
      osc.connect(gain)
      gain.connect(masterGain)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.5)
    },
    playGroan: () => playNoise(0.6, 0.12, 220, 2),
    playPost() {
      playOsc(180, 'square', 0.45, 0.07)
      playOsc(900, 'triangle', 0.2, 0.05)
    },
    playCrowdMurmur(intensity = 0.05) {
      playNoise(2.5, intensity, 400, 1.5)
    },
    toggleMute() {
      isMuted = !isMuted
      if (masterGain) masterGain.gain.value = isMuted ? 0 : 1
      return isMuted
    },
    getIsMuted: () => isMuted,
  }
})()

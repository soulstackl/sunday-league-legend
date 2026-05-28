import type { PlatformAdapter } from './types'

function detectMode(): 'discord' | 'standalone' {
  try {
    if (window.parent !== window && document.referrer.includes('discord')) return 'discord'
    if (
      (window as Window & { DiscordSDK?: unknown }).DiscordSDK ||
      new URLSearchParams(window.location.search).get('frame_id')
    ) {
      return 'discord'
    }
  } catch { /* environment may not support window.parent */ }
  return 'standalone'
}

export const platformAdapter: PlatformAdapter = {
  isDiscord: detectMode() === 'discord',
  async init() {
    if (this.isDiscord) {
      console.log('Discord Activity Mode Initialised')
    }
  },
  async getUser() {
    return null
  },
}

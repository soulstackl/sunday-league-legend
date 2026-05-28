import type { PlatformAdapter } from './types'

export const discordAdapter: PlatformAdapter = {
  isDiscord: true,
  async init() {
    // TODO: initialise @discord/embedded-app-sdk here
  },
  async getUser() {
    return null
  },
}

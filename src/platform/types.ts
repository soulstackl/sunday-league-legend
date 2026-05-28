export interface PlatformAdapter {
  isDiscord: boolean
  init(): Promise<void>
  getUser(): Promise<null>
}

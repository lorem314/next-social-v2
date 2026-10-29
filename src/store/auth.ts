import { makeAutoObservable } from "mobx"

class AuthStore {
  accessToken = ""

  constructor() {
    makeAutoObservable(this)
  }

  saveAccessToken(newAccessToken: string) {
    this.accessToken = newAccessToken
  }

  clearAccessToken() {
    this.accessToken = ""
  }
}

export const authStore = new AuthStore()

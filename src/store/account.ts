import { makeAutoObservable } from 'mobx'

interface networkMap {
  [key: string]: string
}

class AccountStore {
  isInstall: boolean =  false
  accountList: any = []
  currentAccount: string = ''
  accountStatus: number = 0
  networkVersion: networkMap = {
    "253": "Halley",
    "1": "Main",
    "251": "Barnard",
    "252": "Proxima",
    "254": "Localhost:9850"
  }

  constructor() {
    makeAutoObservable(this, {}, {autoBind: true})
  }

  setIsInstall = (v: boolean) => {
    this.isInstall = v
  }
  setAccountList = (v: any) => {
    this.accountList = v
  }
  setCurrentAccount = (v: string) => {
    this.currentAccount = v
  }
  setAccountStatus = (v:number) => {
    this.accountStatus = v
  }
}

export default new AccountStore()



import { makeAutoObservable } from 'mobx'

class AccountStore {
  isInstall: boolean =  false
  accountList: any = []
  currentAccount: string = ''

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
}

export default new AccountStore()



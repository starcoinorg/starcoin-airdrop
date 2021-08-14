import { observable, action } from 'mobx'

export default class AccountStore {
  @observable accountInfo = {
    isInstall: false,
    accountList: [],
    currentAccoutn: ''
  }

  @action
  setAccountInfo = (v: any) => {
    let originData = this.accountInfo
    let newData = Object.assign(originData, v)
    this.accountInfo = newData
  }
}

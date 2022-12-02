import Server from './server'
import axios from 'axios'

const apiUrl = process.env.REACT_APP_STARCOIN_AIRDROP_API_URL;

class API extends Server {
  async getList(params = {}): Promise<any> {
    try {
      let rlt = await this.axios(
        "get",
        `${ apiUrl }/getlist`,
        params,
      )
      if (rlt) {
        return rlt
      } else {
        let err = {
          tip: 'Fail to get tList',
          data: params,
          url: `${ apiUrl }/getlist`,
        }
        throw err
      }
    } catch (err) {
      throw err
    }
  }
  async updateStats(params = {}): Promise<any> {
    try {
      let rlt = await this.axios(
        "get",
        `${ apiUrl }/updatestatus`,
        params,
      )
      if (rlt) {
        return rlt
      } else {
        let err = {
          tip: 'Fail to get tList',
          data: params,
          url: `${ apiUrl }/updatestatus`,
        }
        throw err
      }
    } catch (err) {
      throw err
    }
  }
  async upload(data: any):Promise<any> {
    let rlt = await axios.post(
        `${apiUrl}/uploadProject`,
        data,
    )
    return rlt
  }
}

export default new API()
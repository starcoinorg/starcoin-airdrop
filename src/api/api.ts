import { AxiosResponse } from 'axios'
import Server from './server'

interface rlt {
  data: Object,
  errno: number,
  errmsg: string
}

class API extends Server {
  async getProjectList(params = {}):Promise<any> {
    try {
      let rlt = await this.axios(
        "get",
        'http://localhost:1323/getProjectList',
        params,
      )
      if (rlt) {
        return rlt    
      } else {
        let err = {
          tip: 'Fail to get crime reacord',
          data: params,
          url: 'http://localhost:1323/getProjectList',
        }
        throw err
      }
    } catch (err) {
      throw err
    }
  }
}

export default new API()
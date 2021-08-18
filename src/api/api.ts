import Server from './server'

class API extends Server {
  async getList(params = {}):Promise<any> {
    try {
      let rlt = await this.axios(
        "get",
        'http://localhost:1323/getlist',
        params,
      )
      if (rlt) {
        return rlt    
      } else {
        let err = {
          tip: 'Fail to get tList',
          data: params,
          url: 'http://localhost:1323/getList',
        }
        throw err
      }
    } catch (err) {
      throw err
    }
  }
  async updateStats(params = {}):Promise<any> {
    try {
      let rlt = await this.axios(
        "get",
        'http://localhost:1323/updatestatus',
        params,
      )
      if (rlt) {
        return rlt    
      } else {
        let err = {
          tip: 'Fail to get tList',
          data: params,
          url: 'http://localhost:1323/updatestatus',
        }
        throw err
      }
    } catch (err) {
      throw err
    }
  }
  async upload(file: any) {
      let formData = new FormData()
      formData.append('file', file)
      let rlt = await this.axios(
        "POST",
        'http://localhost:1323/uploadProject',
        formData,
        {
          "Content-Type": "multipart/form-data",
        }
      )
      return rlt
  }
}

export default new API()
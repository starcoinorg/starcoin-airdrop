import Server from './server'

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
  async upload(file: any) {
    let formData = new FormData()
    formData.append('file', file)
    let rlt = await this.axios(
      "POST",
      `${ apiUrl }/uploadProject`,
      formData,
      {
        "Content-Type": "multipart/form-data",
      }
    )
    return rlt
  }
}

export default new API()
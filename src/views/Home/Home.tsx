import React from 'react'
import { Box, Button, ButtonGroup, Grid, LinearProgress, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination';
import { useEffect, useState } from 'react';
import API from '../../api/api'
import { providers, utils, bcs } from '@starcoin/starcoin'
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import CancelRoundedIcon from '@material-ui/icons/CancelRounded';
import { green, red, blue } from '@material-ui/core/colors';
import { hexlify } from '@ethersproject/bytes'
import { useStores } from '../../useStore'
import { observer } from 'mobx-react';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  shape: {
    borderRadius: '1.5rem',
  },
  disabledButton: {
   color: 'rgb(140, 149, 159)',
   backgroundColor: 'rgb(246, 248, 250)',
   border: '1px solid rgba(27, 31, 36, 0.15)'
  },
  paperContent: {
    padding: '1.5rem 0'
  },
  tableContent: {
    margin: '1rem 0',
  },
  inProgress: {
    '&.MuiLinearProgress-colorPrimary': {
      backgroundColor: blue[100],
      '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: blue[600]
      }
    },
  },
  inProgressBtn: {
    color: red[400]
  },
  successProgress: {
    '&.MuiLinearProgress-colorPrimary': {
      backgroundColor: green[100],
      '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: green[600]
      }
    },
  },
  successProgressBtn: {
    color: green[400]
  },
  endProgress: {
    '&.MuiLinearProgress-colorPrimary': {
      backgroundColor: red[100],
      '& .MuiLinearProgress-barColorPrimary': {
        backgroundColor: red[600]
      }
    },
  },
  endProgressBtn: {
    color: red[400]
  },
  tokenIcon: {
    width: '40px',
    height: '40px',
    marginTop: '0.1rem',
    marginRight: '0.35rem'
  },
  textNotes: {
    fontSize: '12px'
  },
  pageContainer: {
    padding: '15px 20px',
    marginBottom: '20px'
  }
}));

interface rowlist {
  Id: number,
  Name: string,
  Amount: string,
  Precision: number,
  CreateAt: string,
  StartAt: string,
  EndAt: string,
  progress: number,
  timediff: string,
  Status: any
}

let starcoinProvider: any

if (window.starcoin) {
  starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
}


const getList = async (addr: string): Promise<any> => {
  if (!addr && !window.starcoin.selectedAddress) {
    return
  }
  let data = await API.getList({
    addr: addr || window.starcoin.selectedAddress,
    networkVersion: window.starcoin.networkVersion
  })
  return data
}



async function checkStatus(data: any) {
  const functionId = '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributor2::is_claimd'
  const tyArgs = [data.Token]
  const args = [data.OwnerAddress, `${ data.AirdropId }`, `x\"${ data.Root.slice(2) }\"`, `${ data.Idx }u64`]
  const isClaimed = await new Promise((resolve, reject) => {
    return starcoinProvider.send(
      'contract.call_v2',
      [
        {
          function_id: functionId,
          type_args: tyArgs,
          args,
        },
      ],
    ).then((result: any) => {
      if (result && Array.isArray(result) && result.length) {
        resolve(result[0])
      } else {
        reject(new Error('fetch failed'))
      }
    }).catch((error: any) => {
      // if an airdrop is revoked, it is not exists on the chain any more.
      // this call_v2 will be failed with message: status ABORTED of type Execution with sub status 1279
      resolve(0)
    })
  });
  return isClaimed
}

const Home: React.FC = () => {
  const {t, i18n } = useTranslation();
  const classes = useStyles();
  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const [address, setAddress] = useState("")
  const [network, setNetwork] = useState('')
  const { AccountStore } = useStores()
  // const [as, setAs] = useState()
  let starcoinProvider: any
  useEffect(() => {
    try {
      if (window.starcoin) {
        starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
        setAddress(window.starcoin.selectedAddress)
        window.starcoin.on('accountsChanged', handleNewAccounts)
        window.starcoin.on('networkChanged', handleNewNetwork)
      }
    } catch (err) {
      console.error(err)
    }
  }, [])
  useEffect(() => {
    if (!(window.starcoin && window.starcoin.selectedAddress && window.starcoin.networkVersion)) {
      return
    }
    setAddress(AccountStore.currentAccount)
  }, [AccountStore.currentAccount])

  function handleNewAccounts(accounts: any) {
    if (accounts.length === 0) {
      setRows([])
    } else {
      setAddress(accounts[0])
    }
  }

  function handleNewNetwork(n: any) {
    setNetwork(n)
  }

  function formatBalance(num: string | number) {
    const value = new BigNumber(num);
    const convertedValue = value.div(1000000000).toFormat();
    return convertedValue;
  }

  useEffect(() => {
    (async () => {
      if (!(window.starcoin && window.starcoin.selectedAddress && window.starcoin.networkVersion)) {
        return
      }
      let data = await getList(window.starcoin.selectedAddress)
      let networkVersion = window.starcoin ? window.starcoin.networkVersion : ""
      if (!data || !data.data) {
        return
      }
      for (let i = 0; i < data.data.length; i++) {
        let s = new Date(data.data[i].StartAt).valueOf()
        let n = new Date().valueOf()
        let end = new Date(data.data[i].EndAt).valueOf()
        let progress: number = ((n - s) / (end - s)) * 100
        data.data[i]['progress'] = progress
        //status: 0-default, 1-已领取, 2-结束, 3-未领取
        if ([0, 3].includes(data.data[i]['Status'])) {
          let r = await checkStatus(data.data[i])
          if (r) {
            if (data.data[i]['Status'] === 3) {
              await API.updateStats({
                networkVersion,
                address,
                id: data.data[i].Id,
                status: 1
              })
            }
            data.data[i]['Status'] = 1
          } else {
            data.data[i]['Status'] = 3
          }
          let startTime: number = new Date().valueOf()
          let endTime: number = new Date(data.data[i].EndAt).valueOf()
          if (endTime <= startTime) {
            data.data[i]['Status'] = 2
          }
          await API.updateStats({
            networkVersion,
            address,
            id: data.data[i].Id,
            status: data.data[i]['Status']
          })
        }

      }
      setRows(data.data)
    })();
  }, [address, network])


  async function claimAirdrop(Id: number) {
    const record = rows.find(o => o.Id === Id)
    starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
    const airdropFunctionIdMap: any = {
      '1': '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script', // main
      '2': '', // proxima
      '251': '', // barnard
      '253': '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script', // halley
      '254': '', // localhost
    }

    const nodeUrlMap: any = {
      '1': 'https://main-seed.starcoin.org',
      '2': 'https://proxima-seed.starcoin.org',
      '251': 'https://barnard-seed.starcoin.org',
      '253': 'https://halley-seed.starcoin.org',
      '254': 'http://localhost:9850',
    }

    const functionId = airdropFunctionIdMap[window.starcoin.networkVersion]
    if (!functionId) {
      window.alert('当前网络没有部署领取空投合约，请切换再重试!')
      return false;
    }
    const tyArgs = [record.Token]
    const args = [record.OwnerAddress, record.AirdropId, record.Root, record.Idx, record.Amount, JSON.parse(record.Proof)]
    const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
    const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

    const payloadInHex = (function () {
      const se = new bcs.BcsSerializer()
      scriptFunction.serialize(se)
      return hexlify(se.getBytes())
    })()

    const txParams = {
      data: payloadInHex,
    }

    const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
    if (transactionHash) {
      getList(window.starcoin.selectedAddress)
      // this.forceUpdate();
      window.location.reload(false);
    } else {
      console.error('Status Updated fail')
      // this.forceUpdate();
      window.location.reload(false);
    }
  }
  function SuccessProgressbar(props: any) {
    let valid = props.valid
    let total = props.total
    return (<Box display="flex" alignItems="center">
      <LinearProgress className={classes.successProgress} variant="determinate" style={{ flexGrow: 1, marginRight: '0.5rem' }} value={(valid / total) * 100}></LinearProgress>
      <CheckCircleRoundedIcon className={classes.successProgressBtn} />
    </Box>)
  }

  function InProgressbar(props: any) {
    let valid = props.valid
    let timeDiff = props.timeDiff
    return (
      <Box display="flex" alignItems="center">
        <LinearProgress className={classes.inProgress} variant="determinate" style={{ flexGrow: 1, marginRight: '0.5rem' }} value={valid}></LinearProgress>
        <Typography className={classes.textNotes}>{timeDiff}</Typography>
      </Box>
    )
  }

  function EndProgressbar(props: any) {
    let valid = props.valid
    let total = props.total
    return (
      <Box display="flex" alignItems="center">
        <LinearProgress className={classes.endProgress} variant="determinate" style={{ flexGrow: 1, marginRight: '0.5rem' }} value={(valid / total) * 100}></LinearProgress>
        <CancelRoundedIcon className={classes.endProgressBtn} />
      </Box>
    )
  }

  function getTimeDiff(end: string) {
    let startTime: number = new Date().valueOf()
    let endTime: number = new Date(end).valueOf()
    if (endTime <= startTime) {
      return ''
    }
    let daysDiff: number = 1000 * 3600 * 24
    if (daysDiff < (endTime - startTime)) {
      let days: number = Math.floor((endTime - startTime) / daysDiff)
      let hours: number = Math.floor(((endTime - startTime) - (days * daysDiff)) / 3600000)
      return `${ days }${t('airdrop.day')}${ hours }${t('airdrop.hour')}`
    } else {
      let hours: number = Math.floor((endTime - startTime) / 3600000)
      let minutes: number = Math.floor(((endTime - startTime) - (hours * 3600000)) / 60000)
      return `${ hours }${t('airdrop.hour')}${ minutes }${t('airdrop.min')}`
    }
  }

  function CustTablebody(props: any) {
    let rows = props.rows
    if (rows.length > 0) {
      return (
        rows.map((row:any, index:any) => {
          row.timediff = getTimeDiff(row.EndAt)
          return <Paper key={index} className={classes.pageContainer} elevation={2}>
            <Grid container>
              <Grid item xs={4}>
                <Box display="flex" alignItems="center">
                  <Box>
                    <img alt="stc" className={classes.tokenIcon} src={`/img/${row.Symbol.toLowerCase()}.svg`} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">{row.Symbol}</Typography>
                    <Typography className={classes.textNotes}>
                      {
                        i18n.language === 'zh' ?
                        row.Name : row.NameEN
                      }
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box>
                  <Typography variant="subtitle2">{t('airdrop.amount')}</Typography>
                  <Typography className={classes.textNotes}>{formatBalance(row.Amount)} {row.Symbol}</Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box>
                  <Typography variant="subtitle2">{t('airdrop.startTime')}</Typography>
                  <Typography className={classes.textNotes}>{row.StartAt.substr(0, 16)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={2} container direction="row" justifyContent="center" alignItems="center">
                <Grid xs item>
                  {row.Status === 1 ? <SuccessProgressbar valid={row.progress} /> : ''}
                  {row.Status === 3 ? <InProgressbar valid={row.progress} timeDiff={row.timediff} /> : ''}
                  {row.Status === 2 ? <EndProgressbar valid={row.progress} /> : ''}
                </Grid>

              </Grid>
              <Grid container item xs={2} direction="row" justifyContent="center" alignItems="center">
                <Box>
                  {row.Status === 2 ? <Button className={classes.shape} style={{textTransform: 'none'}} variant="contained" disabled>{t('airdrop.expired')}</Button> : ''}
                  {row.Status === 3 ? <Button className={classes.shape} style={{textTransform: 'none'}} variant="contained" color="primary" onClick={() => claimAirdrop(row.Id)}>{t('airdrop.claim')}</Button> : ''}
                  {row.Status === 1 ? <Button className={`${classes.shape} ${classes.disabledButton}`} style={{textTransform: 'none'}} variant="contained" disabled>{t('airdrop.claimed')}</Button> : ''}
                  {row.Status === 0 ? <Button className={classes.shape} style={{textTransform: 'none'}} variant="contained" disabled>{t('airdrop.getStatus')}</Button> : ''}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        })
      )
    } else {
      return (
        <Paper className={classes.pageContainer} elevation={2}>
          <Typography align="center">{t('airdrop.noData')}</Typography>
        </Paper>
      )
    }
  }


  return (
    <div>
      <CustTablebody rows={rows} />

      <Grid container justifyContent="flex-end">
        <Pagination count={count / 10 + 1} />
      </Grid>
    </div>
  )
}

export default observer(Home)
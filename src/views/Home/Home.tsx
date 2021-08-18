import React from 'react'
import { Box, Button, ButtonGroup, Grid, LinearProgress, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination';
import { useEffect, useState } from 'react';
import API from '../../api/api'
import { providers, utils, bcs} from '@starcoin/starcoin'
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import CancelRoundedIcon from '@material-ui/icons/CancelRounded';
import { green, red, blue } from '@material-ui/core/colors'; 
import { hexlify } from '@ethersproject/bytes'
import { useStores } from '../../useStore'
import { observer } from 'mobx-react';

const useStyles = makeStyles((theme) => ({
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
    borderRadius: '50%',
    marginRight: '0.3rem'
  },
  textNotes: {
    fontSize: '12px'
  }
}));

interface rowlist {
  Id: number,
  Project: string,
  Amount: string,
  CreateAt: string,
  StartAt: string,
  EndAt: string,
  progress: number,
  timediff: string,
  Status: any
}

const getList = async (addr: string):Promise<any> => {
  if (!addr && !window.starcoin.selectedAddress) {
    return 
  }
  let data = await API.getList({
    addr: addr || window.starcoin.selectedAddress,
    // addr: "0x3f19d5422824f47e6c021978cee98f35",
    networkVersion: window.starcoin.networkVersion
  })
  return data
}

function getTimeDiff(end: string) {
  let startTime:number = new Date().valueOf()
  let endTime:number = new Date(end).valueOf()
  if (endTime <= startTime) {
    return 'Finished'
  }
  console.log(startTime)
  console.log(end)
  console.log(endTime - startTime)
  console.log(1000 * 3600 * 24)
  let daysDiff:number = 1000 * 3600 * 24
  if(daysDiff < (endTime - startTime)) {
    let days:number = Math.floor((endTime - startTime) / daysDiff)
    let hours:number = Math.floor(((endTime - startTime) - (days * daysDiff))  / 3600000)
    return `${days} day ${hours} hours`
  } else {
    let hours:number = Math.floor((endTime - startTime) / 3600000)
    let minutes:number = Math.floor(((endTime - startTime) - (hours * 3600000))  / 60000)
    return `${hours} hours ${minutes} minutes`
  }
}

async function checkStatus(data: any) {
  const functionId = '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributor2::is_claimd'
  const tyArgs = ['0x00000000000000000000000000000001::STC::STC']
  const args = [data.OwnerAddress, `${data.AirdropId}`, `x\"${data.Root.slice(2)}\"`, `${data.Idx}u64`]
  const starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
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
    ).then((result) => {
      if (result && Array.isArray(result) && result.length) {
          resolve(result[0])
      } else {
        reject(new Error('fetch failed'))
      }
    })
  });
  return isClaimed
}

const Home: React.FC = () => {
  const classes = useStyles();
  const [rows, setRows] = useState<any[]>([])
  const [count, setCount] = useState(0)
  const { AccountStore } = useStores()
  // const [as, setAs] = useState()
  let starcoinProvider: any
  useEffect(() => {
    try {
      if (window.starcoin) {
        starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
        // setAs(starcoinProvider)
      }
    } catch (err) {
      console.log(err)
    }
  },[])

  useEffect(() => {
    (async() => {
      let data = await getList(AccountStore.accountList[0])
      let networkVersion = window.starcoin ? window.starcoin.networkVersion : ""
      let address = window.starcoin & window.starcoin.selectedAddress ? window.starcoin.selectedAddress : ""
      // let address = "0xd7f20befd34b9f1ab8aeae98b82a5a51"
      if (!data || !data.data || !data.data.length) {
        return
      }
      for (let i = 0; i < data.data.length; i++ ) {
        let progress:number = ((new Date(data.data[i].Create).valueOf())/((new Date(data.data[i].Update).valueOf()))) * 100
        data.data[i]['progress'] = progress
        if (data.data[i]['Status'] === 0) {
          let r = await checkStatus(data.data[i])
          if (r) {
            data.data[i]['Status'] = 1 
          } else {
            data.data[i]['Status'] = 3
          }
          let timeDiff = getTimeDiff(data.data[i].UpdateAt)
          if (timeDiff === 'Finished') {
            data.data[i]['Status'] = 2
          } else {
            data.data[i]['timediff'] = timeDiff
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
  },[AccountStore.accountList])


  async function claimAirdrop(e:any) {
    let record = rows[e.button]
    starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
    const airdropFunctionIdMap:any = {
      '1': '', // main
      '2': '', // proxima
      '251': '0xf8af03dd08de49d81e4efd9e24c039cc::MerkleDistributorScript::claim_script', // barnard
      '253': '0xb987F1aB0D7879b2aB421b98f96eFb44::MerkleDistributorScript::claim_script', // halley
      '254': '', // localhost
    }
    
    const nodeUrlMap:any = {
      '1': 'https://main-seed.starcoin.org',
      '2': 'https://proxima-seed.starcoin.org',
      '251': 'https://barnard-seed.starcoin.org',
      '253': 'https://halley-seed.starcoin.org',
      '254': 'http://localhost:9850',
    }
    
    const functionId = airdropFunctionIdMap[window.starcoin.networkVersion]

    const tyArgs = ['0x00000000000000000000000000000001::STC::STC']
    console.log('========>', record)
    const args = [record.OwnerAddress, record.AirdropId, record.Root, record.Idx, record.Amount, JSON.parse(record.Proof)]
    const nodeUrl = nodeUrlMap[window.starcoin.networkVersion]
    const scriptFunction = await utils.tx.encodeScriptFunctionByResolve(functionId, tyArgs, args, nodeUrl)

    const payloadInHex = (function () {
      const se = new bcs.BcsSerializer()
      scriptFunction.serialize(se)
      return hexlify(se.getBytes())
    })()
    // console.log({ payloadInHex })

    const txParams = {
      data: payloadInHex,
    }

    const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
    console.log(transactionHash)
  }
  function SuccessProgressbar (props:any) {
    let valid = props.valid
    let total = props.total
    return (<Box display="flex" alignItems="center">
      <LinearProgress className={classes.successProgress} variant="determinate" style={{ flexGrow: 1, marginRight:'0.5rem'}}  value={(valid/total)* 100}></LinearProgress>
      <CheckCircleRoundedIcon className={classes.successProgressBtn}/>
    </Box>)
  }

  function InProgressbar (props: any) {
    let valid = props.valid
    let timeDiff = props.timeDiff
    console.log(props)
    return (
    <Box display="flex" alignItems="center">
      <LinearProgress className={classes.inProgress} variant="determinate" style={{ flexGrow: 1, marginRight:'0.5rem'}}  value={valid}></LinearProgress>
      <Typography className={classes.textNotes}>{timeDiff}</Typography>
    </Box>
    )
  }

  function EndProgressbar(props:any) {
    let valid = props.valid
    let total = props.total
    return (
      <Box display="flex" alignItems="center">
        <LinearProgress className={classes.endProgress} variant="determinate" style={{ flexGrow: 1, marginRight:'0.5rem'}}  value={(valid/total)* 100}></LinearProgress>
        <CancelRoundedIcon className={classes.endProgressBtn} />
      </Box>
    )
  }

  return (
    <div>
      <Box display="flex" justifyContent="space-between">
        <Typography  variant="h6" align="left"> 空投列表 </Typography>
        <ButtonGroup color="primary" aria-label="outlined primary button group">
          <Button>全部</Button>
          <Button>进行中</Button>
          <Button>已经结束</Button>
        </ButtonGroup>
      </Box>
      {/* <Paper elevation={3}>
        <Grid justifyContent="center" container spacing={3} className={classes.paperContent}>
          <Grid item xs={4}>
            <Box>
              <Typography align="center">
                待领取空投
              </Typography>
              <Typography variant="h5" align="center">
                2000 STC
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography align="center">
                待领取空投
              </Typography>
              <Typography variant="h5" align="center">
                2000 STC
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box>
              <Typography align="center">
                待领取空投
              </Typography>
              <Typography variant="h5" align="center">
                2000 STC
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper> */}
      <TableContainer component={Paper} className={classes.tableContent}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="30%">Coin</TableCell>
              <TableCell width="10%">数量</TableCell>
              <TableCell width="20%">开始时间</TableCell>
              <TableCell>领取状态</TableCell>
              <TableCell width="20%">操作</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {rows.length === 0 ? '暂无数据' : '暂无数据'}
            {rows.map((row: rowlist) => (
              <TableRow key={row.Id}><TableCell>
                  <Box display="flex" alignItems="center">
                    <Box>
                      <img alt="stc" className={classes.tokenIcon} src="/img/token.png" />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">STC</Typography>
                      <Typography className={classes.textNotes}>参与投票获得空投奖励</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {row.Amount}
                </TableCell>
                <TableCell>
                  {row.StartAt}
                </TableCell>
                <TableCell>
                  { row.Status === 1 ? <SuccessProgressbar valid={row.progress}  /> : ''}
                  { row.Status === 3 ? <InProgressbar valid={row.progress} timeDiff={row.timediff} /> : ''}
                  { row.Status === 2 ? <EndProgressbar valid={row.progress}  /> : ''}
                </TableCell>
                <TableCell>
                  { row.Status === 2 ? <Button variant="contained" disabled>已过期</Button> : ''}
                  { row.Status === 3 ? <Button variant="contained" color="primary" onClick={claimAirdrop}>领取空投</Button> : ''}
                  { row.Status === 1 ? <Button variant="contained" color="secondary">已领取</Button> : ''}
                  { row.Status === 0 ? <Button variant="contained" disabled>状态获取中</Button> : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody> 
        </Table>
      </TableContainer>
      <Grid container justifyContent="flex-end">
        <Pagination count={count/10 + 1} /> 
      </Grid>
    </div>
  )
}

export default observer(Home)
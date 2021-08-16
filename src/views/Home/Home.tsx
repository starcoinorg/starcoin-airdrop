import React from 'react'
import { Box, Button, ButtonGroup, Grid, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination';
import { useEffect, useState } from 'react';
import API from '../../api/api'
import { providers} from '@starcoin/starcoin'
//import { useStores } from '../../useStore';

const useStyles = makeStyles((theme) => ({
  paperContent: {
    padding: '1.5rem 0'
  },
  tableContent: {
    margin: '1rem 0',
  }
}));

interface projectList {
  Data: any,
  Count: number
}

const getProjectList = async ():Promise<projectList> => {
  let rlt:any =  await API.getProjectList({
    status: 'all',
    token: window.starcoin ? window.starcoin.selectedAddress || '' : ""
  })
  let resp: projectList = rlt.data
  return resp
}


const Home: React.FC = () => {
  const classes = useStyles();
  const [rows, setRows] = useState([{
    ExpireTime: '',
    CreateTime: '',
    status: 0,
    Id: 0,
    Project: '',
    ValidAmount: 0,
    TotalAmount: 0,
  }])
  const [count, setCount] = useState(0)
  const [as, setAs] = useState()
  let starcoinProvider: any
  useEffect(() => {
    try {
      if (window.starcoin) {
        console.log(1)
        starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
        setAs(starcoinProvider)
      }
    } catch (err) {
      console.log(err)
    }
  },[])
  useEffect(() => {
    (async() => {
      let data = await getProjectList()
      setRows(data.Data || [])
      setCount(data.Count)
    })();
  },[])
  async function clickSendSTC() {
    let account = window.starcoin._state.accounts[0] || ''
    let transAmount = 1000000
    let amount = `0x${transAmount.toString(16)}`
    let txParams = {
      to: account,
      value: amount,
      gasLimit: 127845,
      gasPrice: 1,
    }
    starcoinProvider = new providers.Web3Provider(window.starcoin, 'any')
    const transactionHash = await starcoinProvider.getSigner().sendUncheckedTransaction(txParams)
    console.log(transactionHash)
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
              <TableCell>Project</TableCell>
              <TableCell>Winner Amount</TableCell>
              <TableCell>Airdrop Amount</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length ? rows.map((row) => (
              <TableRow key={row.Id}>
                <TableCell>
                  {row.Project}
                </TableCell>
                <TableCell>
                  {row.ValidAmount}
                </TableCell>
                <TableCell>
                  {row.TotalAmount}
                </TableCell>
                <TableCell>
                  {row.CreateTime}
                </TableCell>
                <TableCell>
                  {row.ExpireTime}
                </TableCell>
                <TableCell>
                  { row.status === 2 ? <Button variant="contained" disabled>已过期</Button> : ''}
                  { row.status === 3 ? <Button variant="contained" color="primary" onClick={clickSendSTC}>领取空投</Button> : ''}
                  { row.status === 1 ? <Button variant="contained" color="secondary">已领取</Button> : ''}
                  { row.status === 0 ? <Button variant="contained" disabled>已领完</Button> : ''}
                </TableCell>
              </TableRow>
            )):''}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container justifyContent="flex-end">
        <Pagination count={count/10 + 1} /> 
      </Grid>
    </div>
  )
}

export default Home
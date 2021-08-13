import React from 'react'
import { Box, Button, Grid, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination';

const useStyles = makeStyles((theme) => ({
  paperContent: {
    padding: '1.5rem 0'
  },
  tableContent: {
    margin: '1rem 0',
  }
}));

function createData(project: string, winner: number, amount: number, startTime: string, endTime: string, status: number) {
  return {project, winner, amount, startTime, endTime, status}
}

const rows = [
  createData('test1', 1, 10, '2021年8月3日', '2021年8月23日', 1),
  createData('test2', 2, 12, '2021年8月5日', '2021年8月23日', 2),
  createData('test3', 3, 30, '2021年8月6日', '2021年8月23日', 3),
  createData('test4', 4, 14, '2021年8月7日', '2021年8月23日', 0),
  createData('test5', 5, 50, '2021年8月8日', '2021年8月23日', 1),
]

const Home: React.FC = () => {
  const classes = useStyles();
  console.log(rows)
  return (
    <div>
      <Paper elevation={3}>
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
      </Paper>
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
            {rows.map((row) => (
              <TableRow key={row.project}>
                <TableCell>
                  {row.project}
                </TableCell>
                <TableCell>
                  {row.winner}
                </TableCell>
                <TableCell>
                  {row.amount}
                </TableCell>
                <TableCell>
                  {row.startTime}
                </TableCell>
                <TableCell>
                  {row.endTime}
                </TableCell>
                <TableCell>
                  { row.status === 0 ? <Button variant="contained" disabled>已过期</Button> : ''}
                  { row.status === 1 ? <Button variant="contained" color="primary">领取空投</Button> : ''}
                  { row.status === 2 ? <Button variant="contained" color="secondary">已领取</Button> : ''}
                  { row.status === 3 ? <Button variant="contained" disabled>已领完</Button> : ''}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Grid container justifyContent="flex-end">
        <Pagination count={10} /> 
      </Grid>
    </div>
  )
}

export default Home
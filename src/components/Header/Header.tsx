import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Box, Button, MenuItem, Select } from '@material-ui/core';
import TranslateIcon from '@material-ui/icons/Translate';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useStores } from '../../useStore'
import { useEffect, useState } from 'react';
import StarMaskOnboarding from '@starcoin/starmask-onboarding';
// import IconButton from '@material-ui/core/IconButton';
// import MenuIcon from '@material-ui/icons/Menu';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  iconTr: {
    marginRight: '0.3rem'
  },
  selectComp: {
    color: '#ffffff',
    '& .MuiSelect-select': {
      paddingRight: '30px'
    },
    '& .MuiSelect-icon': {
      top: '3px',
      color: '#ffffff'
    }
  },
  buttonStyle: {
    color: '#ffffff',
    borderColor: '#ffffff'
  }
}));

const Headers: React.FC = () => {
  const classes = useStyles();
  const [accountStatus, setAccountStatus] = useState(-1)
  const { AccountStore } = useStores()
  console.log('===>', AccountStore)
  useEffect(() => {
    if (window.starcoin.selectedAddress) {
      setAccountStatus(1)
    } else if (AccountStore.isInstall) {
      setAccountStatus(0)
    } else {
      setAccountStatus(-1)
    }
  },[AccountStore])
  function connectWallet() {
    if(accountStatus === 2) {
      window.starcoin.request({
        method: 'stc_requestAccounts',
      }).then((res: any) => {
        console.log(res)
      })
    }
  }
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" className={classes.title}>
            Starcoin Airdrop
          </Typography>
          <Box display="flex" alignItems="center">
            <TranslateIcon className={classes.iconTr}/>
            <Select defaultValue="1" className={classes.selectComp} disableUnderline IconComponent={ExpandMoreIcon}>
              <MenuItem value={1}>
                English
              </MenuItem>
            </Select>
          </Box>
          <Box display="flex" alignItems="center">
            <Button variant="outlined" className={classes.buttonStyle} onClick={connectWallet}>
              {accountStatus === 0 ? 'Connect Wallet':''}
              {accountStatus === 1 ? window.starcoin.selectedAddress:''}
              {accountStatus === -1 ? 'Install Wallet':''}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Headers 
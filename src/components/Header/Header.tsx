import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Box, ButtonGroup, Button } from '@material-ui/core';
// import TranslateIcon from '@material-ui/icons/Translate';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useStores } from '../../useStore'
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
// import IconButton from '@material-ui/core/IconButton';
// import MenuIcon from '@material-ui/icons/Menu';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appbar: {
    backgroundColor: '#ffffff',
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
    color: '#000'
  },
  iconTr: {
    marginRight: '0.3rem'
  },
  selectComp: {
    color: '#1C4BDE',
    marginRight: '0.5rem',
    '& .MuiSelect-select': {
      paddingRight: '28px'
    },
    '& .MuiSelect-icon': {
      top: '3px',
      color: '#1C4BDE'
    }
  },
  buttonStyle: {
    color: '#1C4BDE',
    borderColor: '#1C4BDE',
    borderRadius: '25px',
    marginRight: '0.3rem'
  },
  darkBgButton: {
    color: '#000',
    backgroundColor: '#F7F9FA',
    borderRadius: '25px',
    marginRight: '0.3rem'
  },
  logo: {
    width: '195px',
    height: '40px'
  }
}));

const Headers: React.FC = () => {
  const {t, i18n } = useTranslation();
  const classes = useStyles();
  const [accountStatus, setAccountStatus] = useState(-1)
  const [accountAddress, setAccountAddress] = useState('')
  const [network, setNetwork] = useState('')
  const { AccountStore } = useStores()
  useEffect(() => {
    // console.log(window.starcoin && window.starcoin.selectedAddress,  window.starcoin.selectedAddress)
    if (window.starcoin && window.starcoin.selectedAddress) {
      setAccountAddress(window.starcoin.selectedAddress)
      setAccountStatus(1)
    } else if (AccountStore.isInstall) {
      setAccountStatus(0)
    } else {
      setAccountStatus(-1)
    }
  }, [AccountStore.isInstall, AccountStore.accountStatus])

  if (window.starcoin) {
    window.starcoin.on('accountsChanged', handleNewAccounts)
    window.starcoin.on('networkChanged', handleNewNetwork)
  }

  function handleNewAccounts(accounts: any) {
    if (accounts.length === 0) {
      setAccountStatus(0)
      setAccountAddress("")
    } else {
      setAccountAddress(accounts[0])
      AccountStore.setCurrentAccount(window.starcoin.selectedAddress)
    }
  }

  function handleNewNetwork(network: any) {
    setNetwork(network)
  }

  useEffect(() => {
    if (window.starcoin && window.starcoin.networkVersion) {
      setNetwork(window.starcoin && window.starcoin.networkVersion)
    }
  }, [])



  useEffect(() => {
    if (window.starcoin && window.starcoin.selectedAddress) {
      setAccountAddress(window.starcoin.selectedAddress)
      AccountStore.setCurrentAccount(window.starcoin.selectedAddress)
    }
  }, [])

  async function connectWallet() {
    if (accountStatus === 0) {
      window.starcoin.request({
        method: 'stc_requestAccounts',
      }).then((res: any) => {
        if (res.length > 0) {
          setAccountStatus(1)
          setAccountAddress(res[0] || '')
          AccountStore.setCurrentAccount(res[0] || '')
        }
      })
    } else if (accountStatus === -1) {
      window.open("https://chrome.google.com/webstore/detail/starmask/mfhbebgoclkghebffdldpobeajmbecfk")
    }
  }

  const changeLanguage = (lng:any) => {
    i18n.changeLanguage(lng);
  }

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          {/* <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton> */}
          <Typography variant="h6" className={classes.title}>
            {t('airdrop.title')}
          </Typography>

          <Box display="flex" alignItems="center" style={{marginRight: '1.5rem'}}>
            <ButtonGroup size="small" disableElevation variant="contained">
              <Button color="primary" onClick={() => changeLanguage('en')}>English</Button>
              <Button color="secondary" onClick={() => changeLanguage('zh')}>中文</Button>
            </ButtonGroup>
          </Box>

          {/* <Box display="flex" alignItems="center">
            <TranslateIcon className={classes.iconTr}/>
            <Select defaultValue="1" className={classes.selectComp} disableUnderline IconComponent={ExpandMoreIcon}>
              <MenuItem value={1}>
                English
              </MenuItem>
            </Select>
          </Box> */}
          <Box display="flex" alignItems="center">
            {accountStatus === 1 ? <Button variant="outlined" className={classes.darkBgButton}>
              {AccountStore.networkVersion[window.starcoin.networkVersion]}
            </Button> : null}
            <Button variant="outlined" className={classes.buttonStyle} onClick={connectWallet}>
              {accountStatus === -1 ? t('airdrop.installWallet') : ''}
              {accountStatus === 0 ? t('airdrop.connectWallet') : ''}
              {accountStatus === 1 ? accountAddress.substr(0, 4) + '....' + accountAddress.substring(accountAddress.length - 4) : ''}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default observer(Headers)
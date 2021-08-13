import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { Box, Button, MenuItem, Select } from '@material-ui/core';
import TranslateIcon from '@material-ui/icons/Translate';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
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
            <Button variant="outlined" className={classes.buttonStyle}>Install Wallet</Button>
          </Box>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Headers 
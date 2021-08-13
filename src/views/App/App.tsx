import React from "react";
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import routes from '../../router';
import { RouteWithSubRoutes } from '../../assets/common';
import { RouteInterface } from '../../assets/interface';
import Header from "../../components/Header/Header";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '5rem'
  },
}));

const App = () => {
  const classes = useStyles();
  return (
    <div>
      <Header />
      <div className={classes.root}>
        <BrowserRouter>
          <Switch>  
          {routes.map((route: RouteInterface, i: number) => {
                return RouteWithSubRoutes(route, i)
              })}
          </Switch>
        </BrowserRouter>
      </div>
    </div>
    
  )
}

export default App
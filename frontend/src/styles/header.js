import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useLocation } from "react-router-dom";
import { Nav, NavDropdown, Navbar } from 'react-bootstrap';
import styled from 'styled-components';
import { shade } from 'polished';


import Menu from '../pages/menu/menu';
import Homepage from '../pages/homepage/homepage';
import SignIn from '../pages/signIn/signIn';
import SignUp from '../pages/signUp/signUp';


const Menubar = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    position: fixed;
      
    
  a, .navbar-nav, .nav-dropdown {
      font-family: 'Roboto Slab', serif;
      font-size: 16px; 
      color: #000;
      

    &:hover { 
        color: ${shade(0.2, '#fff')} }
        
  }
`;

const Header = () => {

    return <Router>
        <Menubar>
            <Navbar bg="light" expand="lg">
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ml-auto">
                        <Nav.Link><Link to='/'>Home</Link></Nav.Link>
                        <Nav.Link><Link to='/menu'>Menu</Link></Nav.Link>
                        <Nav.Link><Link to='/booking'>Book a Table</Link></Nav.Link>
                        <NavDropdown title="Order Online" id="basic-nav-dropdown">
                            <NavDropdown.Item><Link to='/takeout'>Takeout</Link></NavDropdown.Item>
                            <NavDropdown.Item><Link to='/delivery'>Delivery</Link></NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link><Link to='/login'>Login</Link></Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </Menubar>
        <Switch>
            <Route path="/menu" exact component={Menu} />
            <Route path="/booking">
            </Route>
            <Route path="/login" exact component={SignIn} />
            <Route path="/register" exact component={SignUp} />
            <Route path="/" component={Homepage} />
        </Switch>
    </Router>
}

export default Header;


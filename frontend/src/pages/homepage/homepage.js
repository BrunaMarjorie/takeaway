import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
  } from "react-router-dom";
import { Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { Container, Content, Menubar } from '../homepage/style';


const Homepage = () => {
    return (
        <>
            <Router>
                <Menubar>
                    <Navbar bg="light" expand="lg">
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ml-auto">
                                <Nav.Link href="#home">Menu</Nav.Link>
                                <Nav.Link href="#us">Contact Us</Nav.Link>
                                <Nav.Link href="#link">Book a Table</Nav.Link>
                                <NavDropdown title="Order Online" id="basic-nav-dropdown">
                                    <NavDropdown.Item href="#action/3.1">Takeout</NavDropdown.Item>
                                    <NavDropdown.Item href="#action/3.2">Delivery</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar>
                </Menubar>
            </Router>

            <Container>
                <Content><h1>Welcome to Takeaway Restaurant</h1>
                    <p>Available for eating-in, takeaway and delivery</p>
                </Content>
            </Container>
        </>
    )
};

export default Homepage;
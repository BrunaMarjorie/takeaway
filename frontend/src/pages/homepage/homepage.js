import React from 'react';
import { Nav, NavDropdown, Navbar, Row } from 'react-bootstrap';
import { Container, Content, Menubar } from '../homepage/style';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';



const Homepage = () => {
    return <Container>
        <Row>
            <Menubar>
                <Navbar bg="light" expand="lg">
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="ml-auto">
                            <Nav.Link href="#home">Menu</Nav.Link>
                            <Nav.Link href="#home">Contact Us</Nav.Link>
                            <Nav.Link href="#link">Book a Table</Nav.Link>
                            <NavDropdown title="Order Online" id="basic-nav-dropdown">
                                <NavDropdown.Item href="#action/3.1">Takeout</NavDropdown.Item>
                                <NavDropdown.Item href="#action/3.2">Delivery</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </Menubar>
        </Row>
        <Row>   
            <Content><h1>Welcome to Takeaway Restaurant</h1> 
            <p>Available for eating-in, takeaway and delivery</p>
            </Content>
        </Row>
        
    </Container>
};

export default Homepage;
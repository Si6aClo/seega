import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Link, NavLink } from 'react-router-dom';
import logo from '../../assets/logo.png';

import './appHeader.css';

const AppHeader = () => {
    return (
        <header className="header">
            <Navbar expand="lg">
                <Container>
                    <Link to={"/"}><img src={logo} className='header__logo'/></Link>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <NavLink to={"/"} className="header__link">ГЛАВНАЯ</NavLink>
                            <NavLink to={"/bot/create"} className="header__link">С КОМПЬЮТЕРОМ</NavLink>
                            <NavLink to={"/offline"} className="header__link">НА ОДНОМ УСТРОЙСТВЕ</NavLink>
                            <NavLink to={"/rules"} className="header__link">ПРАВИЛА</NavLink>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
        </header>
    );
}

export default AppHeader;
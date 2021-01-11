import styled from 'styled-components';
import logo from '../../images/chinese.jpg';
import { shade } from 'polished';

export const Container = styled.div`
    height: 90.2vh;
    display: flex;
    align-items: stretch;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${logo});
    background-size: cover;
`;

export const Menubar = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    
    
  a, .navbar-nav, .navbar-light .nav-link .nav-dropdown {
      font-family: 'Roboto Slab', serif;
      font-size: 16px; 
      

    &:hover { 
        color: ${shade(0.2, '#581845')} }
        
  }
`;

export const Content = styled.div`
    align-items: center;
    width: 100%;

    h1 {
      margin-top: 200px;       
      color: #fff;
      font-size: 3rem;
      font-weight: 500;
      white-space: nowrap;
      text-align: center;
    }

    p { 
      font-size: 1.5rem;
      color: #fff;
      text-align: center;
    }
`;

import styled from 'styled-components';
import logo from '../../images/chinese.jpg';
import { shade } from 'polished';

export const Container = styled.div`
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${logo});
    background-size: cover;
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

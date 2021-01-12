import styled from 'styled-components';
import background from '../../images/background.jpg';
import { shade } from 'polished';

export const Container = styled.div`
    height: 100vh;
    display: flex;
    align-items: stretch;
`;

export const Content = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    place-content: center;
    width: 100%;
    max-width: 700px;
    background-image: radial-gradient(#8e9eab, #eef2f3);
    
    form {
        margin: 10px 0;
        height: 70%;
        width: 340px;
        text-align: center;

    h1 {
        margin-top: 50px;
        margin-bottom: 24px;
    }

    input {
        background: #232129;
        border-radius: 10px;
        border: 2px solid #232129;
        padding: 10px;
        width: 100%;
        color: #CCD1D1;

        &:focus {
            background: #CCD1D1;
            color: #232129;
        }

        & + input {
            margin-top: 8px;
        } 
    }

    button {
        background: #2f9162;
        height: 35px;
        border-radius: 10px;
        border: 0;
        padding: 0 16px;
        color: #312e38;
        width: 100%;
        font-weight: 500;
        margin-top: 16px;
        
        &:hover {
            background: ${shade(0.2, '#2f9162')}
        }
    }

    a {
        color: #f5f5f5;
        display: block;
        margin-top: 14px;
        margin-bottom: 14px;
        text-decoration: none;
        text-align: right;
        font-size: 14px;

        &:hover {
            color: ${shade(0.2, '#f5f5f5')}
        }
    }
    }

    > a {
        color: #2f9162;
        display: flex;
        text-decoration: none;
        align-items: center;

        svg{
            margin-right: 8px;
        }

        &:hover {
            color: ${shade(0.2, '#2f9162')}
        }
    }

`;

export const Background = styled.div`
    flex: 1;
    background: url(${background}) no-repeat center;
    background-size: cover;
`;

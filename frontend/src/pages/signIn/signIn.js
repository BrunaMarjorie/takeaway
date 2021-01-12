import React from 'react';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { Background, Container, Content } from './style';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SignUp from '../signUp/signUp';
import Form from './form';


const SignIn = () => {
    const { data, handleChange, HandleSubmit } = Form();


    return (
        <Container>
            <Content>
                <form onSubmit={HandleSubmit}>
                    <h1>Sign in</h1>
                    <input name='email' placeholder='E-mail' value={data.email} onChange={handleChange} />
                    <input name='password' type='password' placeholder='Password' value={data.password} onChange={handleChange} />
                    <a href=''> Forgot password? </a>
                    <button type='submit'> Sign in </button>
                </form>
                    <div>
                    <Link to='/register'> <AiOutlineUserAdd /> Create an account</Link>
                    </div>
            </Content>
            <Background />
        </Container>
    )
};

export default SignIn;
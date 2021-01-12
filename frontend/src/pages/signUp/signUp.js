import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Background, Container, Content } from './style';
import { BrowserRouter as Router, Switch, Route, Link, useHistory } from "react-router-dom";
import Form from './form';
import SignIn from '../signIn/signIn';


const SignUp = () => {

    const { data, handleChange, HandleSubmit } = Form();
    

    return (
        <Container>
            <Background />
            <Content>
                <form onSubmit={HandleSubmit}>
                    <h1>Create your account</h1>
                    <input name='name' type='text' placeholder='Username' value={data.name} onChange={handleChange} />
                    <input name='email' type='text' placeholder='E-mail' value={data.email} onChange={handleChange} />
                    <input name='password' type='password' placeholder='Password' value={data.password} onChange={handleChange} />
                    <input name='confPassword' type='password' placeholder='Confim Password' value={data.confPassword} onChange={handleChange} />
                    <button type='submit'> Sign up </button>
                </form>
                    <div>
                    <Link to='/login'> <FiLogIn /> Log in</Link>
                    </div> 
            </Content>
        </Container>
    )
};

export default SignUp;
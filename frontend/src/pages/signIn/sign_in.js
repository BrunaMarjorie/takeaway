import React from 'react';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { Background, Container, Content } from '../signIn/style';


const SignIn = () => {
    return (
        <Container>
            <Content>
                <form>
                    <h1>Sign in</h1>
                    <input name='email' placeholder='E-mail' />
                    <input name='password' type='password' placeholder='Password' />
                    <a href=''> Forgot password? </a>
                    <button type='submit'> Sign in </button>
                </form>
                <a href=''>
                    <AiOutlineUserAdd /> Create an account </a>
            </Content>
            <Background />
        </Container>
    )
};

export default SignIn;
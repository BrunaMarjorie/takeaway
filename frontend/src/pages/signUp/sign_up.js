import React from 'react';
import { Background, Container, Content } from '../signUp/style';


const SignUp = () => {
    return <Container>
        <Background />
        <Content>
            <form>
                <h1>Create your account</h1>
                <input name='name' placeholder='Username' />
                <input name='email' placeholder='E-mail' />
                <input name='password' type='password' placeholder='Password' />
                <input name='phone' placeholder='Phone number' />
                <button type='submit'> Sign up </button>
            </form>
        </Content>
    </Container>
};

export default SignUp;
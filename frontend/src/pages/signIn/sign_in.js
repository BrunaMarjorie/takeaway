import React from 'react';
import { AiOutlineUserAdd } from 'react-icons/ai';
import { MdEmail } from 'react-icons/md';
import { RiLockPasswordFill } from 'react-icons/ri';
import { Background, Container, Content } from '../signIn/style';


const SignIn = () => {
return <Container>
<Content>
    <form>
        <h1>Sign in</h1>
        <input name= 'email' icon={MdEmail} placeholder='E-mail' />
        <input name= 'password' icon={RiLockPasswordFill} type= 'password' placeholder='Password' />
        <a href=''> Forgot password? </a>
        <button type='submit'> Sign in </button>
    </form>
    <a href=''> 
    <AiOutlineUserAdd/>
    Create an account </a>
</Content>
<Background/>
</Container>
};

export default SignIn;
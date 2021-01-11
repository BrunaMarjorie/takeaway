import React from 'react';
import { FiLogIn } from 'react-icons/fi';
import { Background, Container, Content } from '../signUp/style';
import api from '../../services/api';


class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            password: '',
            confPassword: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleSubmit(event) {
        event.preventDefault();
        const data = {
            'name': this.state.name,
            'email': this.state.email,
            'password': this.state.password,
            'confPassword': this.state.confPassword,
        };

        console.log(data);

        async function postapi() {
            const post = await api.post('/users/register');
        };

        postapi();
    }

    render() {
        return (
            <Container>
                <Background />
                <Content>
                    <form onSubmit={this.handleSubmit}>
                        <h1>Create your account</h1>
                        <input name='name' type='text' placeholder='Username' value={this.state.name} onChange={this.handleChange} />
                        <input name='email' type='text' placeholder='E-mail' value={this.state.email} onChange={this.handleChange} />
                        <input name='password' type='password' placeholder='Password' value={this.state.password} onChange={this.handleChange} />
                        <input name='confPassword' type='password' placeholder='Confim Password' value={this.state.confPassword} onChange={this.handleChange} />
                        <button type='submit'> Sign up </button>
                    </form>
                    <a href='login'>
                        <FiLogIn /> Log in </a>
                </Content>
            </Container>
        )
    }
};

export default SignUp;
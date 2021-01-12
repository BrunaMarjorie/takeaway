import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import api from '../../services/api';


const Form = (callback) => {
    const [submit, setSubmit] = useState(false);

    const [data, setData] = useState( {
        email: '',
        password: '',
    }); 

    useEffect(() => {
        if (submit === true){
            Login();
        }      

    }, [submit]);

    async function HandleSubmit (event) {
        event.preventDefault();
        const validation = await validate(data);
        if (validation === 1) {
            setSubmit(true);
        }
    }

    const handleChange = (event) => {
        event.persist();
        setData(data => ({...data, 
            [event.target.name]: event.target.value
        }));
    };


    async function validate (data) {
        try {
            const schema = Yup.object().shape({
                email: Yup.string().required('Email is required').email('Email is not valid'),
                password: Yup.string().required('Password is required'),
            });

            await schema.validate(data);
            return 1;

        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async function Login() {
        const post = await api.post('/users/login', data);
    };

    return {
        data,
        handleChange, 
        HandleSubmit
    }

}

export default Form;
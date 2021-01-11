import React from 'react';
import { icons } from 'react-icons/lib';

export const Input = ({icon: Icon, ... rest}) => {
    <Container>
        {Icon && <Icon size={20} />}
        <input {... rest}/>
    </Container>

}

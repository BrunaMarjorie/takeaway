import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    outline: 0;
}

body {
    background: #b2b074;
    color: #000;
}

body, input, button {
    font-family: 'Roboto Slab', serif;
    font-size: 16px;
}

button {
    cursor: pointer;
}

`
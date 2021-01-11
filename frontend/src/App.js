import React from 'react';
import GlobalStyle from './styles/global';
import SignIn from './pages/signIn/sign_in';
import SignUp from './pages/signUp/sign_up';
import Homepage from './pages/homepage/homepage';
import Menu from './pages/menu/menu';

const App = () => {
  return <>
  <GlobalStyle/>
  <SignUp/>
  </>
}

export default App;

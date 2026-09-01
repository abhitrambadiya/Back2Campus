import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
    font-size: 16px;
  }

  body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.textDark};
    overflow-x: hidden;
    background-color: ${({ theme }) => theme.colors.white};
  }

  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
`;
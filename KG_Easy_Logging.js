// ==UserScript==
// @name         KG_Easy_Logging
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Logging into accounts simply clicking the buttons what are representing the account nickname
// @author       Patcher
// @match        *://klavogonki.ru/*
// @grant        none
// ==/UserScript==

(function () {

  // Get account data from local storage, or an empty array if none exists
  const accountSavedData = JSON.parse(localStorage.getItem('accountSavedData')) || [];

  // Create a container element for the account buttons
  const accountsContainer = document.createElement('div');
  accountsContainer.classList.add('accounts');

  // Create a button for each account and append it to the container
  accountSavedData.forEach(account => {
    const [login, password] = account;
    const button = document.createElement('button');
    button.classList.add('userAccount');
    button.textContent = login;
    button.dataset.account = JSON.stringify({ login, password });
    accountsContainer.appendChild(button);
  });

  // Add the container to the page
  document.body.appendChild(accountsContainer);

  // Function to handle button click
  async function handleButtonClick(event) {
    const { login, password } = JSON.parse(event.target.dataset.account);
    await logout(); // logout before logging in with a new account
    await loginIntoAccount(login, password);
  }

  // Add event listener to all buttons with class 'user'
  const userButtons = document.querySelectorAll('.userAccount');
  userButtons.forEach(button => button.addEventListener('click', handleButtonClick));

  // URL for the login page
  const loginUrl = 'https://klavogonki.ru/login';

  // URL for the logout page
  const logoutUrl = 'https://klavogonki.ru/logout';

  // Function to log in to an account
  async function loginIntoAccount(login, password) {
    const xsrfToken = document.cookie.match(/XSRF-TOKEN=([\w-]+)/)?.[1];

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          login: login,
          pass: password,
          submit_login: 'Войти',
          redirect: '/',
          'X-XSRF-TOKEN': xsrfToken,
        }).toString(),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Login successful');
        window.location.reload(); // Reload the page after successful login
      } else {
        console.error(`Login failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }

  // Function to log out of the current account
  async function logout() {
    try {
      const response = await fetch(logoutUrl, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Logout successful');
      } else {
        console.error(`Logout failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // CSS styles
  const css = `
  .accounts {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 45px;
    left: 0px;
  }

  .userAccount {
    min-width: 80px;
    max-width: 120px;
    background-color: #424242;
    color: #fff;
    border: none;
    padding: 8px 8px;
    font-size: 10px;
    font-weight: 500;
    transition: background-color 0.2s ease;
  }

  .userAccount:hover {
    background-color: #616161;
    cursor: pointer;
  }

`;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);

})();
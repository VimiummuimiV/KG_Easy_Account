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
  // BUTTONS AND EVENTS
  // Get account data from local storage, or an empty array if none exists
  const accountSavedData = JSON.parse(localStorage.getItem('accountSavedData')) || [];

  // Create a container element for the account buttons
  const accountsContainer = document.createElement('div');
  accountsContainer.classList.add('accounts');

  // Loop through each account and create a button for it
  accountSavedData.forEach(account => {
    const [login, password] = account;

    // Create a button element and set its properties
    const button = document.createElement('button');
    button.classList.add('userAccount');
    button.textContent = login;
    button.dataset.login = login;
    button.dataset.password = password;

    // Append the button to the container
    accountsContainer.appendChild(button);
  });

  // Append the container to the page
  document.body.appendChild(accountsContainer);

  // Function to handle button click
  async function handleButtonClick(event) {
    // Get the login and password from the button's data attributes
    const login = event.target.dataset.login;
    const password = event.target.dataset.password;

    // Logout before logging in with a new account, unless the Ctrl key is pressed
    if (!event.ctrlKey) {
      // Set the active class on the clicked button
      setActiveButton(login);
      await logout();
      await loginIntoAccount(login, password);
    }

    // Copy the password to the clipboard if the Ctrl key is pressed
    if (event.ctrlKey) {
      navigator.clipboard.writeText(password);
      showCopiedPassword(event);
    }
  }

  // Add event listener to all buttons with class 'userAccount'
  document.querySelectorAll('.userAccount').forEach(button => button.addEventListener('click', handleButtonClick));

  function randomHSLColor() {
    var hue = Math.floor(Math.random() * 360);
    var saturation = 20;
    var lightness = 15;
    var color = "hsl(" + hue + "," + saturation + "%," + lightness + "%)";
    return color;
  }

  // Reference for the existing popup
  let previousPopup = null;

  function showCopiedPassword(event) {
    // Create a new div element for the password popup
    const passwordPopup = document.createElement('div');
    passwordPopup.classList.add('passwordPopup');
    passwordPopup.innerText = `Password copied: ${event.target.dataset.password} From user: ${event.target.dataset.login}`;

    // Set the initial styles for the password popup
    passwordPopup.style.position = 'fixed';
    passwordPopup.style.right = '-100%';
    passwordPopup.style.transform = 'translateY(-50%)';
    passwordPopup.style.opacity = '0';
    passwordPopup.style.color = '#dadada';
    passwordPopup.style.backgroundColor = randomHSLColor();
    passwordPopup.style.setProperty('border-radius', '4px 0 0 4px', 'important');
    passwordPopup.style.padding = '8px 16px';
    passwordPopup.style.display = 'flex';
    passwordPopup.style.alignItems = 'center';

    // Append the password popup to the body
    document.body.appendChild(passwordPopup);

    // Calculate the width and height of the password popup
    const popupWidth = passwordPopup.offsetWidth;
    const popupHeight = passwordPopup.offsetHeight;
    const verticalOffset = 2;

    // Set the position of the password popup relative to the previous popup
    let topPosition = '30vh';
    if (previousPopup !== null) {
      const previousPopupPosition = previousPopup.getBoundingClientRect();
      topPosition = `calc(${previousPopupPosition.bottom}px + ${popupHeight}px / 2 + ${verticalOffset}px)`;
    }
    passwordPopup.style.top = topPosition;
    passwordPopup.style.right = `-${popupWidth}px`;

    // Animate the password popup onto the screen
    passwordPopup.style.transition = 'all 0.3s ease-in-out';
    passwordPopup.style.right = '0';
    passwordPopup.style.opacity = '1';

    // Store a reference to the current popup
    previousPopup = passwordPopup;

    // Hide the password popup after a short delay
    setTimeout(() => {
      passwordPopup.style.transition = 'all 0.3s ease-in-out';
      passwordPopup.style.right = `-${popupWidth}px`;
      passwordPopup.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(passwordPopup);
        // Clear the reference to the previous popup
        if (previousPopup === passwordPopup) {
          previousPopup = null;
        }
      }, 300);
    }, 5000);
  }

  // Function to set the active button
  function setActiveButton(login) {
    // Set the active button in local storage
    localStorage.setItem('activeAccount', login);

    // Set the active class on the clicked button
    document.querySelectorAll('.userAccount').forEach(button => {
      if (button.dataset.login === login) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Set the active class on the stored active button, if it exists
  const activeButton = localStorage.getItem('activeAccount');
  if (activeButton) {
    setActiveButton(activeButton);
  }


  // REQUESTING
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


  // CSS STYLES
  const css = `
  .accounts {
    display: flex;
    flex-direction: column;
    max-width: 120px;
    position: fixed;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }

  .userAccount {
    position: relative;
    min-width: 80px;
    max-width: 120px;
    background-color: #424242;
    color: white;
    border: none;
    padding: 8px 8px;
    font-size: 10px;
    font-weight: 500;
    transition: background-color 0.2s ease;
    overflow: hidden;
  }

  .userAccount:hover {
    background-color: #565656;
    cursor: pointer;
    overflow: visible;
  }

  .userAccount::after {
    content: attr(data-password);
    pointer-events: none;
    min-width: 80px;
    max-width: 120px;
    position: absolute;
    top: 0;
    right: 2px;
    background-color: #838383;
    color: white;
    padding: 8px 8px;
    font-size: 10px;
    font-weight: 500;
    z-index: -1;
    transform: translateX(0%);
    transition: transform 0.1s ease-out;
  }

  .userAccount:hover::after {
    transform: translateX(100%);
  }

  .userAccount.active {
    background-color: #616161;
  }

`;

  const head = document.head || document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  style.appendChild(document.createTextNode(css));
  head.appendChild(style);

})();
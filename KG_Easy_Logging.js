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
  // VALIDATION PROCESS
  function checkAccountAccessibility() {
    // Access the data in localStorage
    const accountSavedData = JSON.parse(localStorage.getItem('accountSavedData'));
    // Extract the current profile ID from window.location.href using a regular expression
    const currentProfileID = parseInt(window.location.href.match(/\/(\d+)\//)?.[1], 10);
    // Retrieve the blocked accounts ID array from localStorage, or create a new array if it doesn't exist
    const blockedAccountsID = JSON.parse(localStorage.getItem('blockedAccountsID')) || [];

    // Store references to make sure elements exist with meaning the profile is blocked
    const hiddenProfile = document.querySelector('.profile-hidden');
    const iconBlocked = document.querySelector('.icon-blocked');
    // Profile path without ID
    const profilePath = 'https://klavogonki.ru/u/#/';

    // Loop through the saved account data to check for matches and blocked accounts
    if (Array.isArray(accountSavedData)) {
      accountSavedData.forEach(subArray => {
        const profileID = parseInt(subArray[2], 10);
        // Check if the saved profile ID matches the current profile ID
        if (profileID === currentProfileID) {
          console.log(`Match found for profile ID ${currentProfileID} and saved profile ID ${profileID}`);
          // Check if the profile is blocked
          const isBlocked = hiddenProfile && iconBlocked && iconBlocked.parentNode === hiddenProfile;
          if (isBlocked) {
            console.log(`Profile ID ${profileID} is blocked.`);
            // Add the matching profile ID to the blockedAccountsID array in localStorage
            blockedAccountsID.push(profileID);
            localStorage.setItem('blockedAccountsID', JSON.stringify(blockedAccountsID));
          }
        }
      });
    }
  }

  // Helper function to easily clean "accountSavedData" KEY subArrayS with login, pass, id
  // If the ID [, , profileID] from each subArray matching the ID from "blockedAccountsID" localStorage KEY Array
  function cleanSavedAccounts() {
    const accountSavedData = JSON.parse(localStorage.getItem('accountSavedData'));
    const blockedAccountsID = JSON.parse(localStorage.getItem('blockedAccountsID')) || [];

    // Extract profile IDs from accountSavedData
    const profileIDs = accountSavedData.map(subArray => parseInt(subArray[2], 10));

    if (profileIDs.length === blockedAccountsID.length && profileIDs.every(id => blockedAccountsID.includes(id))) {
      // Full match, remove keys
      console.log('All accounts are blocked. Removing all saved account data.');
      localStorage.removeItem('accountSavedData');
      localStorage.removeItem('blockedAccountsID');
      localStorage.removeItem('activeAccount');
    } else {
      // Partial match, filter accountSavedData
      const filteredData = accountSavedData.filter(subArray => {
        const profileID = parseInt(subArray[2], 10);
        return !blockedAccountsID.includes(profileID);
      });
      console.log(`Updating "accountSavedData" with filtered data. Original length: ${accountSavedData.length}. Filtered length: ${filteredData.length}`);
      localStorage.setItem('accountSavedData', JSON.stringify(filteredData));
      localStorage.removeItem('blockedAccountsID');
    }
  }

  // Helper function to extract profile IDs from saved data
  function getProfilesID() {
    // Get saved data from local storage
    const data = JSON.parse(localStorage.getItem('accountSavedData'));

    // Create an array to store profile IDs
    const ids = [];

    // Loop through each saved account and extract its ID
    data.forEach(item => {
      item.forEach(value => {
        if (typeof value === 'string' && !isNaN(value)) {
          ids.push(Number(value));
        }
      });
    });

    // Return the array of profile IDs
    return ids;
  }

  function navigateToProfiles() {
    // Get an array of profile IDs from saved data
    const ids = getProfilesID();

    // Set the current profile index to 0 in localStorage
    localStorage.setItem('currentProfileIndex', 0);

    // Set the path for the profile page
    const profilePath = 'https://klavogonki.ru/u/#/';
    const gamelistPage = 'https://klavogonki.ru/gamelist/';

    // Get the current profile index from localStorage, defaulting to 0 if it's not set
    let currentProfileIndex = parseInt(localStorage.getItem('currentProfileIndex')) || 0;

    // Get the flag to continue checking from localStorage, defaulting to false if it's not set
    let checkForProfiles = localStorage.getItem('checkForProfiles') === 'true';

    // Loop through each ID from the current index and navigate to its profile page
    for (let i = currentProfileIndex; i < ids.length && checkForProfiles; i++) {
      // Construct the URL for the profile page
      const url = `${profilePath}${ids[i]}`;

      // Set a timeout to navigate to the profile page
      setTimeout(() => {
        // Store the current profile id inside "blockedAccountsID" key into localStorage if profile is banned
        checkAccountAccessibility();
        // Navigate to next profile for checking profile accessibility
        window.location.assign(url);
        // Update the current profile index in localStorage
        localStorage.setItem('currentProfileIndex', i + 1);
        // Update the checkForProfiles flag in localStorage if this is the last profile
        if (i === ids.length - 1) {
          // Close checking latest profile for ban
          checkAccountAccessibility();
          // Disconnect profile checker from the future calls with global call function
          localStorage.setItem('checkForProfiles', false);
          setTimeout(() => {
            // Remove unnecessary localStorage key "currentProfileIndex"
            localStorage.removeItem('currentProfileIndex');
            // Remove all profile data if full match. Remove partially if not all are blocked.
            cleanSavedAccounts();
            // Navigate back to chat 
            window.location.href = gamelistPage;
          }, 1000);
        }
      }, 1000 * (i - currentProfileIndex));
    }
  }

  // Function what will trigger the checking profiles process
  function validateProfiles() {
    // Access the data in localStorage for "accountSavedData" KEY to check if exist
    const accountSavedData = JSON.parse(localStorage.getItem('accountSavedData'));
    const validateButton = document.querySelector('.validate-profiles');
    const filterSpeed = 1; // seconds

    if (!accountSavedData) {
      console.log('No saved account data found.');

      // Add class to start animation
      validateButton.classList.add('filter-unaccessible');

      // Add event listener for animationend
      validateButton.addEventListener('animationend', () => {
        validateButton.remove();
      }, { once: true });

      // Add class to trigger the destroy-validation animation
      setTimeout(() => {
        validateButton.classList.add('destroy-validation');
      }, 1000);

      return;
    }

    // Set the flag to continue checking in localStorage
    localStorage.setItem('checkForProfiles', true);

    // Call the navigateToProfiles function to start checking
    navigateToProfiles();
  }

  // Function what will trigger validation again after first trigger made by user button click
  function continiueValidation() {
    const profilePath = 'https://klavogonki.ru/u/#/';
    // Check if the current page URL matches the profile page URL pattern
    // If the flag is true it will start checking if false will do nothing
    if (window.location.href.startsWith(profilePath)) {
      navigateToProfiles();
    }
  } continiueValidation();


  // BUTTONS AND EVENTS
  // Get account data from local storage, or an empty array if none exists
  const accountSavedData = JSON.parse(localStorage.getItem('accountSavedData')) || [];

  // Create a container element for the account buttons
  const accountsContainer = document.createElement('div');
  accountsContainer.classList.add('accounts');

  // Create a button for validating profiles
  const validateButton = document.createElement('button');
  validateButton.classList.add('validate-profiles');
  validateButton.textContent = 'validate';

  // Attach the navigateToProfiles function to the click event of the validateButton
  validateButton.addEventListener('click', validateProfiles);

  // Append the validate button to the container
  accountsContainer.appendChild(validateButton);

  // Loop through each account and create a button for it
  accountSavedData.forEach(account => {
    const [login, password, id] = account;

    // Create a button element and set its properties
    const button = document.createElement('button');
    button.classList.add('userAccount');
    button.textContent = login;
    button.dataset.login = login;
    button.dataset.password = password;
    button.dataset.id = id;

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

    if (event.ctrlKey) {
      // Ctrl key is pressed
      // Copy password to the clipboard
      navigator.clipboard.writeText(password);
      showCopiedPassword(event);
    } else if (event.shiftKey) {
      // Shift key is pressed
      setActiveButton(login);
      await logout();
      await loginIntoAccount(login, password);
      const id = event.target.dataset.id;
      // Navigate to the Logged Profile
      window.location.assign(`https://klavogonki.ru/u/#/${id}/`);
    } else {
      // Neither Ctrl nor Shift key is pressed
      setActiveButton(login);
      await logout();
      await loginIntoAccount(login, password);
      // Simply reload the page
      window.location.reload();
    }

  }

  // Add event listener to all buttons with class 'userAccount'
  document.querySelectorAll('.userAccount').forEach(button => button.addEventListener('click', handleButtonClick));

  // Define the function to randomize te color with exposed lightness parameter
  function randomHSLColor(lightness) {
    // Set default value for lightness
    if (typeof lightness === 'undefined') {
      lightness = 15;
    }
    var hue = Math.floor(Math.random() * 360);
    var saturation = 20;
    var color = `hsl(${hue},${saturation}%,${lightness}%)`;
    return color;
  }

  // POPUPS
  // Reference for the existing popup
  let previousPopup = null;

  function showCopiedPassword(event) {
    // Create a new div element for the password popup
    const passwordPopup = document.createElement('div');
    passwordPopup.classList.add('passwordPopup');
    passwordPopup.innerText = `Password copied: ${event.target.dataset.password} From user: ${event.target.dataset.login}`;

    // Set the initial styles for the password popup
    passwordPopup.style.position = 'fixed';
    passwordPopup.style.left = '-100%';
    passwordPopup.style.transform = 'translateY(-50%)';
    passwordPopup.style.opacity = '0';
    passwordPopup.style.color = '#dadada';
    passwordPopup.style.backgroundColor = randomHSLColor(15); // lightness 15%
    passwordPopup.style.border = `1px solid ${randomHSLColor(35)}`; // lightness 35%
    passwordPopup.style.setProperty('border-radius', '0 4px 4px 0', 'important');
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
    passwordPopup.style.left = `-${popupWidth}px`;

    // Animate the password popup onto the screen
    passwordPopup.style.transition = 'all 0.3s ease-in-out';
    passwordPopup.style.left = '0';
    passwordPopup.style.opacity = '1';

    // Store a reference to the current popup
    previousPopup = passwordPopup;

    // Hide the password popup after a short delay
    setTimeout(() => {
      passwordPopup.style.transition = 'all 0.3s ease-in-out';
      passwordPopup.style.left = `-${popupWidth}px`;
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
          // redirect: '/',
          'X-XSRF-TOKEN': xsrfToken,
        }).toString(),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Login successful');
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

  .validate-profiles, .userAccount {
    position: relative;
    min-width: 80px;
    max-width: 120px;
    padding: 8px 8px;
    font-size: 10px;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .validate-profiles {
    color: #83cf40;
    background-color: #2b4317;
    border: 1px solid #4b7328;
    filter: brightness(1);
  }

  .validate-profiles.filter-unaccessible {
    filter: brightness(1) hue-rotate(280deg) !important;
  }

  .validate-profiles.filter-unaccessible:hover {
    filter: brightness(1.2) hue-rotate(80deg) !important;
  }

  .validate-profiles.destroy-validation {
    animation: destroy-validation 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes destroy-validation {
    0% {
      transform: translateX(0%);
    }
    50% {
      transform: translateX(25%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .validate-profiles:hover {
    filter: brightness(1.2);
  }

  .userAccount {
    color: #d9d9d9;
    background-color: #424242;
    border: none;
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
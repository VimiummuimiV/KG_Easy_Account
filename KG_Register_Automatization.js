// ==UserScript==
// @name         KG_Register_Automatization
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fast registration without suffering and timeconsuming
// @author       Patcher
// @match        *://klavogonki.ru/*
// @match        *://temp-mail.org/*
// @grant        none
// ==/UserScript==

(function () {

  // Run only on klavogonki globally
  if ((window.location.protocol + "//" + window.location.host).includes("klavogonki.ru")) {
    // Function what will navigate to temp mail if mouse from current position moves to the right 10%+
    // Also logs out from account if mouse from current position moves to the left 10%-
    function mouseGesture() {
      let startX;

      // Add a mousedown event listener to the window
      window.addEventListener('mousedown', function (event) {
        // Check if the left mouse button was pressed
        if (event.button === 0) {
          // Store the starting X coordinate of the mouse cursor
          startX = event.clientX;

          // Add mousemove and mouseup event listeners to the window
          window.addEventListener('mousemove', checkForDrag);
          window.addEventListener('mouseup', removeEventListeners);
        }
      });

      // Define the checkForDrag function, which checks if the mouse cursor has moved to the right or left
      function checkForDrag(event) {
        const offsetX = event.clientX - startX;

        // If the offset is greater than 0, redirect to temp mail and remove event listeners
        if (offsetX > 0) {
          window.location.href = "https://temp-mail.org/en/";
          removeEventListeners();
        } else {
          // If the offset is less than or equal to 0, logout and remove event listeners
          logout();
          removeEventListeners();
        }
      }

      // Define the removeEventListeners function, which removes the mousemove and mouseup event listeners from the window
      function removeEventListeners() {
        window.removeEventListener('mousemove', checkForDrag);
        window.removeEventListener('mouseup', removeEventListeners);
      }
    }

    // Navigate to temp mail if mouse moves to right and logout if mouse moves to left
    mouseGesture();

    function addProfileID() {
      const regex = /profile\/(\d+)/;
      const match = window.location.href.match(regex);
      if (match) {
        const [, profileID] = match;
        const accountData = JSON.parse(localStorage.getItem('accountSavedData'));
        const latestAccount = accountData[accountData.length - 1];
        latestAccount.push(profileID);
        localStorage.setItem('accountSavedData', JSON.stringify(accountData));
        return profileID;
      }
      return null;
    }

    function checkForConfirmationParam() {
      const gamelistUrl = "https://klavogonki.ru/gamelist";
      const currentUrl = window.location.href;

      if (currentUrl.includes("confirm")) {
        console.log("Adding profile ID to the new registered accounts data.")
        addProfileID();
        console.log("Redirecting to gamelist page...");
        window.location.href = gamelistUrl;
      } else {
        console.log("No confirmation parameter found.");
      }
    }

    setTimeout(checkForConfirmationParam, 2000); // Delay execution for 2 seconds (2000 milliseconds)
  }

  // Function to run code on "klavogonki.ru/register"
  function KG_RUNNER() {

    // Get references to the form fields
    const registerLogin = document.querySelector('#register_login');
    const registerPass = document.querySelector('#register_pass');
    const registerConfirmPass = document.querySelector('#register_confirmpass');
    const registerEmail = document.querySelector('#register_email');
    const registerSubmitButton = document.querySelector('#register_submit_button');

    // Function to generate a random nickname
    function generateNickname() {
      const consonants = 'bcdfghjklmnpqrstvwxyz';
      const vowels = 'aeiouy';
      const currentYear = new Date().getFullYear();
      const age = Math.floor(Math.random() * (currentYear - 2007 + 1)) + 15;
      const yearString = age.toString();
      const yearIncluded = Math.random() < 0.5;
      const includeUnderline = Math.random() < 0.5;

      let length = Math.floor(Math.random() * 8) + 8;
      let lastCharIsConsonant = Math.random() < 0.5; // randomize the first character

      let nickname = '';

      for (let i = 0; i < length; i++) {
        if (lastCharIsConsonant) { // add a vowel
          const randomIndex = Math.floor(Math.random() * vowels.length);
          nickname += vowels[randomIndex];
          lastCharIsConsonant = false;
        } else { // add a consonant
          const randomIndex = Math.floor(Math.random() * consonants.length);
          nickname += consonants[randomIndex];
          lastCharIsConsonant = true;
        }
      }

      // Function to capitalize the first letter of a string and optionally the letter after a specified character
      function capitalizeLetter(str, char) {
        const index = str.indexOf(char);
        if (index !== -1) {
          const firstPart = str.slice(0, index + 1);
          const secondPart = str.slice(index + 1);
          const capitalized = secondPart.charAt(0).toUpperCase() + secondPart.slice(1);
          return firstPart + capitalized;
        } else {
          return str.charAt(0).toUpperCase() + str.slice(1);
        }
      }

      // Randomly capitalize the first letter of the beginning of the nickname
      const capitalizeFirstLetter = Math.random() < 0.5;
      if (capitalizeFirstLetter) {
        nickname = capitalizeLetter(nickname);
      }

      // Randomly add underscore to nickname
      // Also randomly capitalize the first letter after the underscore if exist
      if (includeUnderline) {
        const middleIndex = Math.floor(nickname.length / 2);
        nickname = nickname.slice(0, middleIndex) + '_' + nickname.slice(middleIndex);
        // Randomly capitalize letter after underscore
        if (Math.random() < 0.5) {
          nickname = capitalizeLetter(nickname, '_');
        }
      }

      // Randomly add year to nickname
      if (yearIncluded) {
        if (Math.random() < 0.5) {
          nickname += yearString;
        } else {
          nickname += '_' + yearString;
        }

        // Check if nickname is longer than 15 characters and contains the year
        if (nickname.length > 15 && nickname.indexOf(yearString) !== -1) {
          // Remove characters from end of nickname until it is 15 characters long
          while (nickname.length > 15) {
            nickname = nickname.substring(0, nickname.length - 1);
          }
        }
      } else {
        // Limit the length of the nickname to 15 characters
        if (nickname.length > 15) {
          nickname = nickname.substring(0, 15);
        }
      }

      return nickname;
    }

    // Fill nickname in the nickname field
    function fillNickname() {
      // Fill the nickname in the nickname field, if nickname field exist
      if (registerLogin) {
        // Generate a new nickname
        const generatedNickname = generateNickname();

        // Fill the nickname field with generated nickname
        registerLogin.value = generatedNickname;
      }
    }

    fillNickname();

    // Check if the nickname field exists before adding event listener
    if (registerLogin) {
      // Add double click event listener to the nickname field
      registerLogin.addEventListener('dblclick', () => {
        fillNickname(registerLogin);
        updateRegisterData();
      });
    } else {
      console.log('Nickname field not found!');
    }

    // Define a function to generate a random length password
    function generatePassword() {
      const symbols = '0123456789abcdefghijklmnopqrstuvwxyz';
      // Randomize password length
      const length = Math.floor(Math.random() * 11) + 10;
      // Store generated password
      let password = '';
      for (let i = 0; i < length; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
      }
      return password;
    }

    // Fill the password in the password fields
    function fillPassword() {
      // Fill the password in the password fields, if password fields exist
      if (registerPass && registerConfirmPass) {
        // Generate a new password
        const generatedPassword = generatePassword();

        // Fill the password fields with the generated password
        registerPass.value = generatedPassword;
        registerConfirmPass.value = generatedPassword;

        // Change the type of the password fields to "text"
        registerPass.type = "text";
        registerConfirmPass.type = "text";
      }
    }

    fillPassword();

    // Define an array of objects to attach the event listener to
    const passwordFields = [registerPass, registerConfirmPass];

    // Check if the password fields exist before adding event listeners
    if (passwordFields.every(field => field)) {
      // Loop through the password fields and add the event listeners
      passwordFields.forEach(field => {
        field.addEventListener('dblclick', () => {
          fillPassword(field);
          updateRegisterData();
        });
      });
    } else {
      console.log('One or both password fields not found!');
    }

    // Define a function to set the login input blink cursor
    function focusLoginInput() {
      if (registerLogin) {
        registerLogin.focus();
        registerLogin.setSelectionRange(registerLogin.value.length, registerLogin.value.length);
      }
    }

    focusLoginInput();

    // Define the function to observe the state of a submit button
    function observeSubmitButtonState(button) {
      // Check if the button exists
      if (button) {
        // Create a new observer instance
        const observer = new MutationObserver((mutations) => {
          // Loop through the mutations that were observed
          mutations.forEach((mutation) => {
            // Check if the "disabled" attribute was added or removed
            if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
              // Check the value of the "disabled" attribute
              if (button.disabled || button.getAttribute("disabled") === "") {
                button.removeAttribute("disabled");
              } else { }
            }
          });
        });

        // Configure the observer to watch for changes to the "disabled" attribute
        const config = { attributes: true, attributeFilter: ["disabled"] };

        // Start observing the submit button
        observer.observe(button, config);
      }
    }

    // Observe the state of the submit button
    observeSubmitButtonState(registerSubmitButton);

    // Define a function to check the reCAPTCHA response
    function checkRecaptchaResponse() {
      // Get the reCAPTCHA response
      let response = grecaptcha.getResponse();

      // If the response length is greater than 0, reCAPTCHA is verified
      if (response.length > 0) {
        console.log('reCAPTCHA verified');

        // Stop the interval from running
        clearInterval(checkInterval);

        // Click the register submit button
        registerSubmitButton.click();
      }
    }

    // Set an interval to check the reCAPTCHA response every 1 second
    let checkInterval = setInterval(checkRecaptchaResponse, 1000);

    function getTempMailAddress() {
      // Get the email value from the URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');

      if (!email) {
        // If the email parameter doesn't exist in the URL, return early
        return null;
      }

      // Retrieve the current value of the accountRegisterData key from local storage
      let accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData'));

      if (!accountRegisterData) {
        // If the accountRegisterData key doesn't exist in local storage, create it with default values
        const login = generateNickname();
        const password = generatePassword();
        accountRegisterData = [login, password, email];
        localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
      } else {
        // If the accountRegisterData key exists in local storage, update the email if necessary
        if (accountRegisterData) {
          // Call the helper function to restore the login and password fields
          restoreRegistrationFields();
        }
      }

      return email;
    }

    getTempMailAddress();

    function restoreRegistrationFields() {
      // Get the email value from the URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const emailFromUrl = urlParams.get('email');

      // Get the login, password and email values from localStorage
      const accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData'));
      const login = accountRegisterData ? accountRegisterData[0] : '';
      const password = accountRegisterData ? accountRegisterData[1] : '';
      const emailFromStorage = accountRegisterData ? accountRegisterData[2] : '';

      // Check if email from URL parameter is different from email in localStorage
      if (emailFromUrl && emailFromStorage !== emailFromUrl) {
        // Update email value in localStorage with email from URL parameter
        const updatedAccountRegisterData = [login, password, emailFromUrl];
        localStorage.setItem('accountRegisterData', JSON.stringify(updatedAccountRegisterData));
      }

      // Fill the login, password and email fields with the values from localStorage
      if (registerLogin) {
        registerLogin.value = login;
      }
      if (registerPass) {
        registerPass.value = registerConfirmPass.value = password;
      }
      if (registerEmail) {
        registerEmail.value = emailFromStorage;
      }
    }

    // Define function what will update localStorage data key "accountRegisterData" with double click events 
    function updateRegisterData() {
      // Get the login value from the form field
      const login = registerLogin.value;
      // Get the password value from the form field
      const password = registerPass.value;
      // Get the email value from the form field
      const email = registerEmail.value;

      // Get the existing accountRegisterData from localStorage
      let accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData')) || ['', '', ''];

      // Update the login and email value in the accountRegisterData array
      accountRegisterData[0] = login;
      accountRegisterData[1] = password;
      accountRegisterData[2] = email;

      // Store the updated account register data array in localStorage
      localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
    }

    // Save account into "localStorage" key "accountSavedData" if registration succeeds
    function saveAccount() {
      // Get accountRegisterData from localStorage
      const accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData'));

      // Get accountSavedData from localStorage
      let accountSavedData = JSON.parse(localStorage.getItem('accountSavedData'));

      // Check if the accountRegisterData already exists in the accountSavedData array
      const existsInSavedData = accountSavedData && // Check that accountSavedData is truthy
        // Check that accountSavedData is an array
        Array.isArray(accountSavedData) &&
        // Check if at least one element of accountSavedData satisfies the following condition:
        accountSavedData.some(savedData =>
          /* Compare the stringified version of savedData
          with the stringified version of accountRegisterData to see if they are equal */
          JSON.stringify(savedData) === JSON.stringify(accountRegisterData)
        );

      // If the accountRegisterData doesn't already exist in the accountSavedData array, add it to the array
      if (!existsInSavedData) {
        const newSavedData = [accountRegisterData[0], accountRegisterData[1]];

        // If accountSavedData is not an array, create a new array with newSavedData as the first element
        if (!Array.isArray(accountSavedData)) {
          accountSavedData = [newSavedData];
        } else {
          // If accountSavedData is an array, push newSavedData to the end of the array
          accountSavedData.push(newSavedData);
        }

        // Store the new accountSavedData in localStorage
        localStorage.setItem('accountSavedData', JSON.stringify(accountSavedData));
      }
    }

    function checkRegistrationStatus() {
      // Define the URLs
      const tempMailUrl = 'https://temp-mail.org/en/';
      const registrationSuccessful = 'registration=successful';
      const tempMailWithParams = `${tempMailUrl}?${registrationSuccessful}`;
      const registerUrl = 'https://klavogonki.ru/register/';

      // Get the main container
      const content = document.getElementById('content');

      // Check if the email field exists and is empty
      if (registerEmail && !registerEmail.value) {
        // Restore the fields from localStorage
        restoreRegistrationFields();
      }

      // Check for a success message
      const successMessage = Array.from(content.querySelectorAll('p')).find(p => p.textContent.includes('Спасибо'));

      if (successMessage) {
        console.log('Registration successful!');
        // Save account into "localStorate" key "accountSavedData"
        saveAccount();
        // Delete temporary used "localStorage" key "accountRegisterData"
        localStorage.removeItem('accountRegisterData');

        // Redirect to the confirmation page after 1 second
        setInterval(() => {
          window.location.href = tempMailWithParams;
        }, 1000);
      } else {
        // Check for an error message
        const errorMessage = Array.from(content.querySelectorAll('.msg')).find(msg => msg.textContent.includes('Ошибка'));

        if (errorMessage) {
          console.log('Registration failed!');
          // Redirect back to registration page
          setInterval(() => {
            window.location.href = registerUrl;
          }, 1000);
        } else {
          // Check again in 2 seconds
          setTimeout(checkRegistrationStatus, 2000);
        }
      }
    }

    // Restore the fields from localStorage
    restoreRegistrationFields();

    // Check the registration status
    checkRegistrationStatus();

    registerLogin.addEventListener('keyup', () => {
      // Get the login value from the form field
      const login = registerLogin.value;
      // Get the password value from the form field
      const password = registerPass.value;
      // Get the email value from the form field
      const email = registerEmail.value;

      // Get the existing accountRegisterData from localStorage
      let accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData')) || ['', '', ''];

      // Update the login and email value in the accountRegisterData array
      accountRegisterData[0] = login;
      accountRegisterData[1] = password;
      accountRegisterData[2] = email;

      // Store the updated account register data array in localStorage
      localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
    });

  } // KG_RUNNER_END

  // Function to run code on "temp-mail.org"
  function TM_RUNNER() {

    const mailBox = document.querySelector('.inboxWarpMain');
    const emailInput = document.querySelector('#mail');
    const deleteButton = document.querySelector('#click-to-delete');
    const refreshButton = document.querySelector('#click-to-refresh');
    const registerUrlDomain = 'https://klavogonki.ru/register/';

    // Function to automatically delete email if the session in time of N minutes is out
    function sessionTimeDifference() {
      // Get the current time
      const currentDate = new Date();

      // Get the previous session time from local storage
      let previousSession = localStorage.getItem("previousSession");

      // If the previous session time is not in local storage, create it with current time
      if (!previousSession) {
        previousSession = currentDate;
        localStorage.setItem("previousSession", previousSession);
      }

      // Calculate the time difference in minutes and seconds
      const timeDifference = getTimeDifference(currentDate, previousSession);

      // If more than assigned minutes have passed, update the previous session time in local storage
      if (timeDifference.minutes >= 20) {
        localStorage.setItem("previousSession", currentDate);
        console.log("Session time is out. Deleting current temp mail address.");
        return true;
      } else {
        console.log(`Only ${timeDifference.minutes} minutes and ${timeDifference.seconds} seconds have passed since your last session.`);
        // Update the previous session time in local storage with the current time
        localStorage.setItem("previousSession", currentDate);
        console.log("Updated previousSession in localStorage with current time:", currentDate);
        return false;
      }
    }


    // Function to calculate the time difference between two dates
    function getTimeDifference(currentDate, previousSession) {
      const timeDifference = currentDate.getTime() - new Date(previousSession).getTime();
      const minutes = Math.floor(timeDifference / 60000);
      const seconds = Math.floor((timeDifference % 60000) / 1000);
      return { minutes, seconds };
    }


    // Add a click event listener to the delete button
    deleteButton.addEventListener('click', function () {
      localStorage.setItem('confirmation_Status', 'welcome');
      console.log('Email address deleted by user.');
    });

    // Actualize status by clicking refresh button if the "KG" refused temp mail
    refreshButton.addEventListener('click', () => {
      const isWaitingStatus = localStorage.getItem("confirmation_Status") === "waiting";
      if (isWaitingStatus) {
        localStorage.setItem('confirmation_Status', 'welcome');
        location.reload();
      }
    });

    // Define function to delete email address by script logic
    function deleteEmail() {
      localStorage.setItem('confirmation_Status', 'welcome');
      console.log('Email address deleted by function.');
      deleteButton.click();
    }

    // Define function to check for the status key availability
    function checkStatusKey() {
      setTimeout(() => {
        const status = localStorage.getItem('confirmation_Status');
        const searchParams = new URLSearchParams(window.location.search);
        if (status === null) {
          console.log('Assigning proper status data to make observer work properly.');
          localStorage.setItem('confirmation_Status', 'welcome');
        }
        // Delete used email address if localStorage key is expired OR session time is out
        else if (status === 'expired' || sessionTimeDifference()) {
          // Function already has logic to assign status welcome before deleting
          deleteEmail();
        }
        // Redirect to the register URL with the email parameter only
        else if (status === 'copied' && searchParams.has('registration')) {
          localStorage.setItem('confirmation_Status', 'waiting');
          // Define function to console log messages with delay
          function logMessageWithDelay(message, delay) {
            setTimeout(() => {
              console.log(message);
            }, delay);
          }
          // Messages to be shown successively
          logMessageWithDelay('The current URL contains the "registration" parameter.', 500);
          logMessageWithDelay('Changing status from copied to waiting.', 1000);
          logMessageWithDelay('Waiting for confirmation message.', 1500);
        }
      }, 1000);
    }

    checkStatusKey();

    // Waiting for the email value to grab
    const observer = new MutationObserver(function (mutationsList) {
      for (let mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const hasDisabledClass = emailInput.classList.contains('disabledText');
          if (!hasDisabledClass) {
            console.log('Email address has appeared!');
            // Set the email input field value to the temporary email address
            let tempMailAddress = emailInput.value;
            let encodedTempMail = encodeURIComponent(tempMailAddress);
            let encodedRegisterUrl = registerUrlDomain + '?email=' + encodedTempMail;
            // Storing email address into localStorage to check if matching or not 

            // Check status if "waiting"
            const status = localStorage.getItem('confirmation_Status');
            const searchParams = new URLSearchParams(window.location.search);
            // Push to the localStorage data copied if the fresh visit
            if (status === 'welcome') {
              localStorage.setItem('confirmation_Status', 'copied');
              console.log("Grabbed fresh email address. Navigating to registration page.")
              window.location.href = encodedRegisterUrl;
            }
            else if (status === 'copied' && !searchParams.has('registration')) {
              console.log("Email not used yet. Trying current email again.");
              window.location.href = encodedRegisterUrl;
            }
          }
        }
      }
    });

    observer.observe(emailInput, { attributes: true });

    function clickMailMessage() {
      // Check status if "waiting"
      const status = localStorage.getItem('confirmation_Status');

      if (status === 'waiting') {
        // Get the message item
        const mailMessage = mailBox.querySelector('a[data-mail-id]');

        if (!mailMessage) {
          return;
        }

        setTimeout(() => {
          console.log('Opening email message.');
          mailMessage.click();
        }, 1000);
      } else {
        console.log('Mail message not found or confirmation already received.');
      }
    }

    function clickConfirmRegistration() {
      // Check status if "waiting"
      const status = localStorage.getItem('confirmation_Status');

      if (status === 'waiting') {
        // Get the confirmation link from the email
        const confirmRegistration = mailBox.querySelector('a[href*="confirm"]');

        if (!confirmRegistration) {
          return;
        }

        console.log('Confirming the registration.');
        localStorage.setItem('confirmation_Status', 'expired');
        setTimeout(() => {
          confirmRegistration.click();
        }, 1000);
      } else {
        console.log('Confirmation link not found or confirmation already received.');
      }
    }

    // Set up a mutation observer to watch for new message
    const mailMessageObserver = new MutationObserver(() => clickMailMessage());
    mailMessageObserver.observe(mailBox, { childList: true, subtree: true });

    // Set up a mutation observer to watch for confirmation link
    const confirmRegistrationObserver = new MutationObserver(() => clickConfirmRegistration());
    confirmRegistrationObserver.observe(mailBox, { childList: true, subtree: true });

  } // TM_RUNNER_END

  // Run code for klavogonki.ru/register
  const KG_Register_Page = "klavogonki.ru/register";

  if (window.location.href.includes(KG_Register_Page)) {
    console.log("Running code for Klavogonki register page...");
    KG_RUNNER();
  }

  // Run code for temp-mail.org
  if ((window.location.protocol + "//" + window.location.host).includes("temp-mail.org")) {
    console.log("Running code for temp-mail.org...");
    TM_RUNNER();
  }

})();
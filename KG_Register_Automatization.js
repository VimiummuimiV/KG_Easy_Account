// ==UserScript==
// @name         KG_Register_Automatization
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fast registration without suffering and timeconsuming
// @author       Patcher
// @match        *://klavogonki.ru/register/*
// @match        *://temp-mail.org/*
// @grant        none
// ==/UserScript==

(function () {

  // Function to run code on "klavogonki.ru"
  function KG_RUNNER() {

    // Get references to the form fields
    const registerLogin = document.querySelector('#register_login');
    const registerPass = document.querySelector('#register_pass');
    const registerConfirmPass = document.querySelector('#register_confirmpass');
    const registerEmail = document.querySelector('#register_email');
    const registerSubmitButton = document.querySelector('#register_submit_button');

    // Define a function to generate a random length password
    const generatePassword = () => {
      const symbols = '0123456789abcdefghijklmnopqrstuvwxyz';
      // Randomize password length
      const length = Math.floor(Math.random() * 11) + 10;
      // Store generated password
      let password = '';
      for (let i = 0; i < length; i++) {
        password += symbols.charAt(Math.floor(Math.random() * symbols.length));
      }
      return password;
    };

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

    // Check if the password fields exist before adding event listeners
    if (registerPass && registerConfirmPass) {
      // Add click event listeners to the password fields
      registerPass.addEventListener('click', fillPassword);
      registerConfirmPass.addEventListener('click', fillPassword);
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

    function getTempMailAddress() {
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
        accountRegisterData = ['', '', email];
        localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
      } else {
        // If the accountRegisterData key exists in local storage, update the email if necessary
        if (accountRegisterData[2] !== email) {
          accountRegisterData[1] = registerPass.value; // Backup generated password
          accountRegisterData[2] = email; // Backup filled email
          localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
        }
      }

      // Remove the email parameter from the URL
      urlParams.delete('email');
      const newUrl = window.location.pathname + '?' + urlParams.toString();
      window.history.replaceState({}, '', newUrl);

      // Set the email value in the register_email input element
      const registerEmail = document.querySelector('#register_email');
      registerEmail.value = email;
      focusLoginInput();

      return email;
    }

    getTempMailAddress();

    function restoreRegistrationFields() {
      if (registerEmail && !registerEmail.value) {
        // Get the login and email values from localStorage
        const accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData'));
        const login = accountRegisterData ? accountRegisterData[0] : '';
        const password = accountRegisterData ? accountRegisterData[1] : '';
        const email = accountRegisterData ? accountRegisterData[2] : '';

        // Fill the login and email fields with the values from localStorage
        setTimeout(() => {
          registerLogin.value = login;
          registerPass.value = registerConfirmPass.value = password;
          registerEmail.value = email;
        }, 2000);
      }
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
          window.location.href = tempMailUrl;
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
        if (status === null) {
          console.log('Assigning proper status data to make observer work properly.');
          localStorage.setItem('confirmation_Status', 'welcome');
        }
        // Redirect to the register URL with the email parameter only
        else if (status === 'copied') {
          localStorage.setItem('confirmation_Status', 'waiting');
          console.log("Waiting for confirmation message.")
        }
        // Delete used email address
        else if (status === 'expired') {
          // Function already has logic to assign status welcome before deleting
          deleteEmail();
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
            // Push to the localStorage data copied if the fresh visit
            if (status === 'welcome') {
              localStorage.setItem('confirmation_Status', 'copied');
              console.log("Grabbed fresh email address. Navigating to registration page.")
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

  // Run code for klavogonki.ru
  if ((window.location.protocol + "//" + window.location.host).includes("klavogonki.ru")) {
    console.log("Running code for klavogonki.ru...");
    KG_RUNNER();
  }

  // Run code for temp-mail.org
  if ((window.location.protocol + "//" + window.location.host).includes("temp-mail.org")) {
    console.log("Running code for temp-mail.org...");
    TM_RUNNER();
  }

})();
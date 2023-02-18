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

    // Retrieve email address from the browser search bar
    function getTempMailAddress() {
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email');
      if (email) {
        // Delete nickname and update email in localStorage
        // Retrieve the current value of the accountRegisterData key from local storage
        let accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData'));
        // Update the password value
        accountRegisterData[0] = ''; // Empty login string
        accountRegisterData[1] = email; // New email
        // Save the updated value back to local storage
        localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
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
      return null;
    }

    getTempMailAddress();

    function restoreRegistrationFields() {
      if (registerEmail && !registerEmail.value) {
        // Get the login and email values from localStorage
        const accountRegisterData = JSON.parse(localStorage.getItem('accountRegisterData'));
        const login = accountRegisterData ? accountRegisterData[0] : '';
        const email = accountRegisterData ? accountRegisterData[1] : '';

        // Fill the login and email fields with the values from localStorage
        setTimeout(() => {
          registerLogin.value = login;
          registerEmail.value = email;
        }, 2000);
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

    registerSubmitButton.addEventListener('click', () => {
      // Get the login and email values from the form fields
      const login = registerLogin.value;
      const email = registerEmail.value;

      // Combine the login and email values into an array
      const accountRegisterData = [login, email];

      // Store the account register data array in localStorage
      localStorage.setItem('accountRegisterData', JSON.stringify(accountRegisterData));
    });

  } // KG_RUNNER_END

  // Function to run code on "temp-mail.org"
  function TM_RUNNER() {

    const mailBox = document.querySelector('.inboxWarpMain');
    const emailInput = document.querySelector('#mail');
    const deleteButton = document.querySelector('#click-to-delete');
    const registerUrlDomain = 'https://klavogonki.ru/register/';

    // Add a click event listener to the delete button
    deleteButton.addEventListener('click', function () {
      console.log('Email address deleted by user.');
      // Remove the "confirmation_Status" key from localStorage
      localStorage.removeItem('confirmation_Status');
    });

    function deleteEmail() {
      console.log('Email address deleted with function.');
      // Remove the "confirmation_Status" key from localStorage
      localStorage.removeItem('confirmation_Status');
      // Trigger the click event on the delete button
      deleteButton.click();
    }

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
            // Check status if "waiting"
            const status = localStorage.getItem('confirmation_Status');
            if (status === 'waiting') {
              console.log('Waiting for email confirmation');
              return; // stop the navigation to the register page
            }
            // Push to the localStorage data waiting what will indicated the email address already is grabbed and used for registration
            if (status === null) {
              localStorage.setItem('confirmation_Status', 'waiting');
            }
            // Redirect to the register URL with the email parameter only
            if (status !== 'expired') {
              window.location.href = encodedRegisterUrl;
            }
          }
        }
      }
    });

    observer.observe(emailInput, { attributes: true });

    // Define the function that will open new message inside mailbox
    function clickMailMessage() {
      const mailMessage = mailBox.querySelector('a[data-mail-id]');
      if (mailMessage) {
        setTimeout(() => {
          console.log('Mail message found. Opening...');
          mailMessage.click();
        }, 1000);
      } else {
        console.log('Mail message not found.');
      }
    }

    // Define the function that will wait for confirmation link and click
    const clickConfirmRegistration = () => {
      // Get the confirmation link from the email
      const confirmRegistration = mailBox.querySelector('a[href*="confirm"]');

      if (!confirmRegistration) {
        return;
      }

      const status = localStorage.getItem('confirmation_Status');

      if (status === 'waiting') {
        console.log('Confirming the registration by navigating to the registration page.');
        localStorage.setItem('confirmation_Status', 'expired');
        confirmRegistration.click();
      } else if (status === 'expired') {
        deleteEmail();
      }
    };

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
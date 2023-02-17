// ==UserScript==
// @name         KG_Register_Automatization
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fast registration without suffering and timeconsuming
// @author       Patcher
// @match        *://klavogonki.ru/register/*
// @grant        none
// ==/UserScript==

(function () {

  // Get references to the form fields
  const registerLogin = document.querySelector('#register_login');
  const registerPass = document.querySelector('#register_pass');
  const registerConfirmPass = document.querySelector('#register_confirmpass');
  const registerEmail = document.querySelector('#register_email');
  const registerSubmitButton = document.querySelector('#register_submit_button');

  // Define a function to generate a random password using only letters and digits
  function generatePassword() {
    // Define a regular expression that matches only letters (lowercase and uppercase) and digits
    const charset = /[a-zA-Z0-9]/;

    // Generate a random password length between 10 and 20 characters
    const length = Math.floor(Math.random() * 11) + 10;

    // Initialize an empty string to hold the password
    let password = "";

    // Loop through the desired length of the password
    for (let i = 0; i < length; i++) {
      // Get a random character using the helper function getRandomChar
      let randomChar = getRandomChar();
      // Loop until the random character matches the character set defined by the charset regular expression
      while (!charset.test(randomChar)) {
        randomChar = getRandomChar();
      }
      // Add the random character to the password
      password += randomChar;
    }

    // Return the generated password
    return password;
  }

  // Define a helper function to get a random character
  function getRandomChar() {
    return String.fromCharCode(Math.floor(Math.random() * 62) + 48);
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
      // Remove the email parameter from the URL
      urlParams.delete('email');
      const newUrl = window.location.pathname + '?' + urlParams.toString();
      window.history.replaceState({}, '', newUrl);

      // Set the email value in the register_email input element
      const registerEmail = document.querySelector('#register_email');
      registerEmail.value = email;

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
    const confirmationUrl = 'https://temp-mail.org/en/?visited=true';
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
        window.location.href = confirmationUrl;
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

})();
// ==UserScript==
// @name         TM_Fast_Confirmation
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Easy KG account confirmation
// @author       Patcher
// @match        https://temp-mail.org/*
// @grant        none
// ==/UserScript==

(function () {

  // Global references
  const emailInput = document.querySelector('#mail');
  const registerUrlDomain = 'https://klavogonki.ru/register/';

  // Define the mailbox container and delete button
  const mailBox = document.querySelector('.inboxWarpMain');

  // Define the function that will look for and click the child element with a data-mail-id attribute
  const clickMailMessage = () => {
    let mailMessage = mailBox.querySelector('a[data-mail-id]');
    if (mailMessage) {
      setTimeout(() => {
        mailMessage.click();
      }, 1000);
    }
  };

  // Define the function that will look for and click the child element with an href containing 'confirm'
  const clickConfirmRegistration = () => {
    let confirmRegistration = mailBox.querySelector('a[href*="confirm"]');
    if (confirmRegistration) {
      setTimeout(() => {
        // Store the confirmation link address
        let confirmationAddress = confirmRegistration.href;
        // Navigate to the confirmation link
        window.location.href = confirmationAddress;
      }, 1000);
    }
  };

  // Set up a mutation observer to watch for changes in the mailBox and trigger the clickMailMessage function
  const mailMessageObserver = new MutationObserver(() => clickMailMessage());
  mailMessageObserver.observe(mailBox, { childList: true, subtree: true });

  // Set up a mutation observer to watch for changes in the mailBox and trigger the clickConfirmRegistration function
  const confirmRegistrationObserver = new MutationObserver(() => clickConfirmRegistration());
  confirmRegistrationObserver.observe(mailBox, { childList: true, subtree: true });


  // Get the URL parameters and check if the "visited" parameter is set to "true"
  const urlParams = new URLSearchParams(window.location.search);
  const visited = urlParams.get('visited');
  if (visited === 'true') {
    // Exit the function because the page has already been visited
    return;
  }

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
          // Set the "visited" parameter to "true" and redirect to the register URL
          urlParams.set('visited', 'true');
          let newUrl = window.location.pathname + '?' + urlParams.toString();
          window.history.replaceState({}, '', newUrl);
          window.location.href = encodedRegisterUrl;
        }
      }
    }
  });

  observer.observe(emailInput, { attributes: true });

})();

const registerForm = document.querySelector('#register');
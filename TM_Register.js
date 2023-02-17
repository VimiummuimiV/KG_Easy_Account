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

})();
// cypress/support/e2e.js
// Prevent uncaught exception failures
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
// Clear state and storage
Cypress.Commands.add('clearAppState', () => {
  cy.clearLocalStorage();
  cy.reload();
  cy.get('[data-testid="app-header"]').should('be.visible');
});

// Switch view mode
Cypress.Commands.add('switchView', (mode) => {
  cy.get(`[data-testid="${mode}-view-btn"]`).click();
  cy.get(`[data-testid="${mode}-view-btn"]`).should('have.class', 'Mui-selected');
});

// Set test data in localStorage
Cypress.Commands.add('setTestData', (employeeData) => {
  cy.window().then((win) => {
    const testData = {
      data: {
        byId: {
          [employeeData.id]: {
            ...employeeData,
            directReports: employeeData.directReports || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        allIds: [employeeData.id],
        version: 1
      },
      version: 1,
      timestamp: Date.now()
    };

    win.localStorage.setItem('orgChart', JSON.stringify(testData));
    cy.reload();
    cy.get('[data-testid="app-header"]').should('be.visible');
  });
});
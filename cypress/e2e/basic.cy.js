describe('Organization Chart - Basic Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    // Wait for basic React mount
    cy.get('#root').should('exist');
  });

  it('loads the application', () => {
    // First log what we can find
    cy.get('#root').then($root => {
      cy.log('Root content:', $root.html());
    });

    // Check for MUI components
    cy.get('.MuiToolbar-root').should('exist');
  });

  it('loads toggle buttons', () => {
    // More specific MUI class checks
    cy.get('.MuiToggleButtonGroup-root')
      .should('exist')
      .then($group => {
        cy.log('Toggle group content:', $group.html());
      });
  });

  it('has basic structure', () => {
    // Check basic structure exists
    cy.get('.MuiBox-root').should('exist');
    cy.get('.MuiAppBar-root').should('exist');
  });
});
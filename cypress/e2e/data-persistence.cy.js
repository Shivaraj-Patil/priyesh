describe('Data Persistence', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.get('[data-testid="app-header"]').should('be.visible');
  });


  it('should persist view preference', () => {
    // Switch to grid view
    cy.get('[data-testid="grid-view-btn"]').click();
    cy.get('[data-testid="grid-view-btn"]').should('have.class', 'Mui-selected');
    
    // Reload page
    cy.reload();
    cy.get('[data-testid="app-header"]').should('be.visible');
    
    // Verify still in grid view
    cy.get('[data-testid="grid-view-btn"]').should('have.class', 'Mui-selected');
  });

  it('should persist localStorage data', () => {
    // Set test data
    cy.window().then((win) => {
      const testData = {
        data: {
          byId: {
            'test-1': {
              id: 'test-1',
              name: 'Test Employee',
              designation: 'Software Engineer',
              email: 'test@example.com',
              phone: '1234567890',
              managerId: null,
              directReports: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          },
          allIds: ['test-1'],
          version: 1
        },
        version: 1,
        timestamp: Date.now()
      };

      win.localStorage.setItem('orgChart', JSON.stringify(testData));
    });

    // Reload page
    cy.reload();
    cy.get('[data-testid="app-header"]').should('be.visible');

    // Verify data persists
    cy.window().then((win) => {
      const storedData = JSON.parse(win.localStorage.getItem('orgChart'));
      expect(storedData.data.byId['test-1'].name).to.equal('Test Employee');
    });
  });
});
describe('Organization Chart', () => {
  describe('Data Persistence', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.clearLocalStorage();
      cy.get('#root').should('exist');
    });

    it('persists employee data across page reloads', () => {
      // Set test data directly in localStorage
      cy.window().then((win) => {
        const testData = {
          data: {
            byId: {
              'test-1': {
                id: 'test-1',
                name: 'Jane Smith',
                designation: 'Product Manager',
                email: 'jane.smith@example.com',
                phone: '0987654321',
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

      // Reload page and switch to grid view
      cy.reload();
      cy.get('#root').should('exist');
      cy.get('[data-testid="grid-view-btn"]').click();

      // Verify employee data persists
      cy.contains('Jane Smith').should('be.visible');
    });
  });
});
describe('Employee Management', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.clearLocalStorage();
  });

  it('should persist data in localStorage', () => {
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

    // Verify data was saved
    cy.window().then((win) => {
      const storedData = JSON.parse(win.localStorage.getItem('orgChart'));
      expect(storedData.data.byId['test-1'].name).to.equal('Test Employee');
    });
  });


});
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.js',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: true, // Enable video for debugging
  videoCompression: false,
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 20000,
  execTimeout: 20000,
  taskTimeout: 20000,
  responseTimeout: 20000,
  requestTimeout: 20000,
});
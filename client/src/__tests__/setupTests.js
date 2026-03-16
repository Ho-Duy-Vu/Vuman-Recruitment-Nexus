// Make @testing-library/jest-dom matchers available in all tests
require('@testing-library/jest-dom')

// Polyfill TextEncoder/TextDecoder for react-router-dom v7 in jsdom
const { TextEncoder, TextDecoder } = require('util')
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

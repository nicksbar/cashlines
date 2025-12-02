import '@testing-library/jest-dom'

// Ensure DATABASE_URL is set for tests
if (!process.env.DATABASE_URL) {
  // Default to PostgreSQL test database (must be running via docker-compose)
  process.env.DATABASE_URL = 'postgresql://cashlines:cashlines_secure_password@localhost:5432/cashlines?schema=public'
}

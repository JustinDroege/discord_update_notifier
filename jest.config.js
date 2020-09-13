module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
		"<rootDir>/test"
  ],
  moduleNameMapper: {
    '^@App/(.*)$': '<rootDir>/src/$1',
  }
};
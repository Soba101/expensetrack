# ExpenseTrack Backend Testing Guide

## Running Tests
- All tests use Jest and Supertest.
- Run all tests with:
```sh
npm test
```

## What is Covered
- User registration and login (auth)
- Receipt upload and listing (receipts)
- Authentication and authorization checks

## Adding More Tests
- Add new test files in `backend/tests/`
- Use Supertest to test endpoints
- Use Jest's `describe` and `it` blocks for structure

## Example Test Structure
```js
describe('Feature', () => {
  it('should do something', async () => {
    // test code
  });
});
```

---
*Tests should be run inside your Conda environment for correct dependencies.* 
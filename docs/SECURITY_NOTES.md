# ExpenseTrack Backend Security Notes

## JWT Secret
- Store your JWT secret in the `.env` file
- Use a long, random string
- Never commit your real secret to version control

## Password Hashing
- User passwords are hashed with bcryptjs before storage
- Never store plain-text passwords

## Best Practices
- Always use HTTPS in production
- Validate all user input
- Keep dependencies up to date
- Restrict JWT token lifetime (currently 1 day)
- Use environment variables for all secrets

---
*Security is critical. Review these notes before deploying to production.* 
# MTTest telegram bot

### Deployment process

1. Create `functions/.env` file with telegram bot token (see functions/.env.example)
2. Run `npm run deploy` in `functions/` dir
3. Copy function public url (`<HANDLER_URL>`)
4. Set up bot webhook: `$ curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<HANDLER_URL>"`

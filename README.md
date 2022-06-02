# Quick start

## Install dependencies
```bash
npm i
```

## Set environment variables in .env file
```
IRC_HOSTNAME=irc.ppy.sh
IRC_PORT=xxxxx
IRC_USERNAME=xxxxx
IRC_PASSWORD=xxxxx
```

# Run the bot
```bash
npx tsc
node dist/index.js
```

You will get an error from the irc.js npm package. To fix it, apply this change inside `node_modules/irc/lib/irc.js`:  
https://github.com/martynsmith/node-irc/pull/489/files/0c0f0d6c93ff5fa1410ffcfb279335a5352ebcd9

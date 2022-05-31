import dotenv from 'dotenv'
dotenv.config()

const ircUsername = process.env.IRC_USERNAME
const ircPassword = process.env.IRC_SERVER_PASSWORD
console.log('username', ircUsername)
console.log('password', ircPassword)

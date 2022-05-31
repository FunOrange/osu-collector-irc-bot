import dotenv from 'dotenv'
import * as irc from 'irc'
dotenv.config()

const bot = new irc.Client('irc.ppy.sh', process.env.IRC_USERNAME, {
  channels: [],
  userName: process.env.IRC_USERNAME,
  password: process.env.IRC_PASSWORD,
  port: parseInt(process.env.IRC_PORT),
})

bot.addListener('message', function (from, to, text, message) {
  console.log('from', from)
  console.log('to', to)
  console.log('text', text)
  console.log('message', message)
  bot.say(from, 'hello! ' + text)
})

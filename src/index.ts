import dotenv from 'dotenv'
import * as irc from 'irc'
import { appendFile } from 'fs'
import moment from 'moment'
dotenv.config()

const log = (...args) => {
  const timestamp = moment().format('MM/DD/YYYY HH:mm:ss')
  appendFile('bot.log', `[${timestamp}] ` + args.map((arg) => JSON.stringify(arg, null, 2)).join('\t'), () => 0)
  console.log(`[${timestamp}]`, ...args)
}

const bot = new irc.Client('irc.ppy.sh', process.env.IRC_USERNAME, {
  channels: [],
  userName: process.env.IRC_USERNAME,
  password: process.env.IRC_PASSWORD,
  port: parseInt(process.env.IRC_PORT),
})

bot.addListener('message', function (from, to, text, message) {
  log({ from, to, text, message })
  bot.say(from, message)
})

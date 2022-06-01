import dotenv from 'dotenv'
import * as irc from 'irc'
import { appendFile } from 'fs'
import moment from 'moment'
import { getUserByUsername, init as initDb, patchUser } from './db'
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

const pendingVerificationIrcUsernames: string[] = []

const main = async () => {
  await initDb()

  bot.addListener('message', async (from: string, to: string, text: string, message) => {
    log({ from, to, text, message })
    const setup = text.match(/^!setup/)
    if (setup) {
      pendingVerificationIrcUsernames.push(from)
      bot.say(from, 'Hello! Please make sure you are logged into the osu!Collector website, then proceed to this link.')
      bot.say(from, `https://osucollector.com/login/linkIrc?ircName=${from}`)
    } else {
      // do nothing
    }
  })
}
main()

import dotenv from 'dotenv'
import * as irc from 'irc'
import { appendFile } from 'fs'
import moment from 'moment'
import { getCollectionById, getUserByIrcName, init as initDb } from './db'
import axios from 'axios'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
dotenv.config()

const log = (...args) => {
  const timestamp = moment().format('MM/DD/YYYY HH:mm:ss')
  appendFile('bot.log', `[${timestamp}] ` + args.map((arg) => JSON.stringify(arg, null, 2)).join('\t') + '\n', () => 0)
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

  // read bot token
  const secretClient = new SecretManagerServiceClient()
  const [version] = await secretClient.accessSecretVersion({
    name: 'projects/886315950958/secrets/np-bot-token/versions/latest',
  })
  const token = version.payload.data.toString()

  bot.addListener('message', async (from: string, to: string, text: string, message) => {
    log({ from, to, text, message })

    if (to !== process.env.IRC_USERNAME) return

    const setup = text.match(/^!setup/)
    if (setup) {
      pendingVerificationIrcUsernames.push(from)
      bot.say(from, 'Hello! Please make sure you are logged into the osu!Collector website, then proceed to this link.')
      bot.say(from, `https://osucollector.com/login/linkIrc?ircName=${from}`)
    }
  })

  const onAction = async (from: string, to: string, text: string, message) => {
    log({ from, to, text, message })

    if (to !== process.env.IRC_USERNAME) return

    const npMatch = text.match(/osu\.ppy\.sh.+?(\d+) /)
    if (!npMatch) return

    const user = await getUserByIrcName(from)
    if (!user?.npCollectionId) return

    const collection = await getCollectionById(user?.npCollectionId)
    if (!collection) return

    const beatmaps = collection.beatmapsets.flatMap((beatmapset) => beatmapset.beatmaps)
    const existingChecksums = [...beatmaps.map((beatmap) => beatmap.checksum), ...(collection.unknownChecksums ?? [])]
    const newBeatmapId = npMatch[1]
    const body = {
      beatmapChecksums: existingChecksums,
      beatmapIds: [...(collection.unknownIds ?? []), newBeatmapId],
    }
    try {
      await axios.put(`https://osucollector.com/api/collections/${collection.id}/beatmaps`, body, {
        headers: {
          ['bot-api-key']: token,
        },
      })
      bot.say(from, `Beatmap added to collection: ${collection.name} (link: https://osucollector.com/collections/${collection.id})`)
    } catch (error) {
      console.error(error)
      bot.say(from, 'Sorry, an error occurred.')
    }
  }
  bot.addListener('action', onAction)
}

// const a = {
//   from: 'FunOrange',
//   to: 'FunOrange',
//   text: 'is listening to [https://osu.ppy.sh/beatmapsets/1690314#/3454225 Wagakki Band - Tengaku]',
//   message: {
//     prefix: 'Felis_jp!cho@ppy.sh',
//     nick: 'Felis_jp',
//     user: 'cho',
//     host: 'ppy.sh',
//     command: 'PRIVMSG',
//     rawCommand: 'PRIVMSG',
//     commandType: 'normal',
//     args: [
//       'FunOrange',
//       '\x01ACTION is listening to [https://osu.ppy.sh/beatmapsets/1690314#/3454225 Wagakki Band - Tengaku]\x01',
//     ],
//   },
// }
main()

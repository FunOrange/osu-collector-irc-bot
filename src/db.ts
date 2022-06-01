import admin from 'firebase-admin'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

let db
export async function init() {
  // access credentials
  const secretClient = new SecretManagerServiceClient()
  const [version] = await secretClient.accessSecretVersion({
    name: 'projects/886315950958/secrets/osu-collector-service-account-key/versions/latest',
  })
  const serviceAccount = JSON.parse(version.payload.data.toString())

  // connect to database
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  })
  db = admin.firestore()
  console.log('firestore ready')
}

export async function patchUser(userId, data) {
  await db.collection('users').doc(userId.toString()).set(data, { merge: true })
}

export async function getUserByUsername(username) {
  const queryResult = await db.collection('users').where('osuweb.username', '==', username).get()
  return queryResult.empty ? null : queryResult.docs[0]
}

export async function getUserByIrcName(ircName) {
  const queryResult = await db.collection('users').where('ircName', '==', ircName).get()
  return queryResult.empty ? null : queryResult.docs[0]
}

export async function getCollectionById(id) {
  const snapshot = await db.collection('collections').doc(id.toString()).get()
  return snapshot.exists ? snapshot.data() : null
}

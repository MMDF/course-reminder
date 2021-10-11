const token = process.argv[2]
if (process.argv.indexOf("-t") !== -1)
  process.env.FIRESTORE_EMULATOR_HOST = "localhost:8080"

const admin = require("firebase-admin")

admin.initializeApp({
  credential: admin.credential.cert(require("./service.json")),
})

admin.messaging().sendToDevice([token], { data: { title: "abc", body: "abc" } })
// admin.firestore().doc(`semesters/2021-2022-1`).set({ courses: data })
// admin.firestore().doc(`abc/abc`).set({ hello: 1 })

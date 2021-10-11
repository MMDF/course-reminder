const data = JSON.parse(
  require("fs").readFileSync("./data.json").toString("utf-8")
)

const admin = require("firebase-admin")

admin.initializeApp({
  credential: admin.credential.cert(require("./service.json")),
})

admin.firestore().doc(`abc/abc`).set({ hello: 1 })

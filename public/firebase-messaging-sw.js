// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/9.1.1/firebase-app-compat.js")
importScripts(
  "https://www.gstatic.com/firebasejs/9.1.1/firebase-messaging-compat.js"
)
// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "api-key",
  authDomain: "project-id.firebaseapp.com",
  databaseURL: "https://project-id.firebaseio.com",
  projectId: "project-id",
  storageBucket: "project-id.appspot.com",
  messagingSenderId: "sender-id",
  appId: "app-id",
  measurementId: "G-measurement-id",
})
// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging()
const actionHandlers = {
  openLink: (actionTask) => {
    self.clients.openWindow("/?r=" + encodeURIComponent(actionTask.url))
  },
}

// If you would like to customize notifications that are received in the
// background (Web app is closed or not in browser focus) then you should
// implement this optional method.
// Keep in mind that FCM will still show notification messages automatically
// and you should use data messages for custom notifications.
// For more info see:
// https://firebase.google.com/docs/cloud-messaging/concept-options
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  )
  // Customize notification here
  const notificationTitle = payload.data.title
  const actions = payload.data.actions

  const notificationOptions = {
    notificationTitle,
    body: payload.data.body,
    icon: "/boun.png",
    actions:
      actions && actions instanceof Array
        ? actions.map((action) => ({
            title: action.title,
            action: action.action,
          }))
        : undefined,
    data: payload.data,
  }

  self.registration.addEventListener("notificationclick", function (e) {
    e.notification.data.actions
  })
  self.registration.showNotification(notificationTitle, notificationOptions)
})

import * as functions from "firebase-functions"
import * as admin from "firebase-admin"
import * as Yup from "yup"

interface Device {
  name: string
  token: string
  disabled: boolean
}
enum ReminderType {
  TenMinuteBefore,
  FiveMinuteBefore,
  OneMinuteBefore,
  OnTime,
}
const templates: Record<ReminderType, { title: string; body: string }> = {
  [ReminderType.TenMinuteBefore]: {
    title: "$code dersine 10 dk kaldı.",
    body: "$name 10 dk sonra başlayacak. Bu bildirim Course Reminders uygulaması tarafından gönderildi.",
  },
  [ReminderType.FiveMinuteBefore]: {
    title: "$code dersine 5 dk kaldı.",
    body: "$name 5 dk sonra başlayacak. Bu bildirim Course Reminders uygulaması tarafından gönderildi.",
  },
  [ReminderType.OneMinuteBefore]: {
    title: "$code dersine 1 dk kaldı!",
    body: "$name 1 dk sonra başlayacak. Bu bildirim Course Reminders uygulaması tarafından gönderildi.",
  },
  [ReminderType.OnTime]: {
    title: "$code dersi başladı!",
    body: "$name başladı. Bu bildirim Course Reminders uygulaması tarafından gönderildi.",
  },
}

admin.initializeApp()
const hourMap = {
  1: "09:00",
  2: "10:00",
  3: "11:00",
  4: "12:00",
  5: "13:00",
  6: "14:00",
  7: "15:00",
  8: "16:00",
  9: "17:00",
  10: "18:00",
  11: "19:00",
  12: "20:00",
  13: "21:00",
  14: "22:00",
}

let coursesCache: { empty: true } | { courses: { [key: string]: any } } = {
  empty: true,
}
admin
  .firestore()
  .doc(`semesters/2021-2022-1`)
  .onSnapshot((snap) => {
    coursesCache = snap.data() as any
  })

const courses = Yup.object({
  courses: Yup.array()
    .of(
      Yup.string()
        .min(1, "Boş kurs eklenemez")
        .test(
          "is-course",
          "Eklediğiniz bir kurs değildir",
          (val) => !!val && val in (coursesCache as any)?.courses
        )
    )
    .max(10, "En fazla 10 kurs seçilebilir."),
})

const ensureCache = async () => {
  if ("empty" in coursesCache) {
    await admin
      .firestore()
      .doc(`semesters/2021-2022-1`)
      .get()
      .then((snap) => {
        coursesCache = snap.data() as any
      })
  }
}
export const addDevice = functions.https.onCall(async (data, ctx) => {
  if (!ctx.auth)
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Cihaz eklemek için giriş yapmalısınız."
    )
  if (!data.token || typeof data.token !== "string")
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Token verilmelidir."
    )
  await ensureCache()

  const userDoc = await admin.firestore().doc(`users/${ctx.auth!.uid}`).get()
  if (userDoc.exists) {
    if (
      (userDoc.get("devices") || []).findIndex(
        (d: any) => d.token === data.token
      ) !== -1
    )
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Bu cihaz zaten mevcut."
      )
    await admin
      .firestore()
      .doc(`users/${ctx.auth!.uid}`)
      .update({
        devices: admin.firestore.FieldValue.arrayUnion({
          name: "İsimsiz Cihaz",
          token: data.token,
          disabled: false,
        }),
      })
  } else {
    await admin
      .firestore()
      .doc(`users/${ctx.auth!.uid}`)
      .set({ devices: [{ name: "İsimsiz Cihaz", token: data.token }] })
  }
})
export const setMyCourses = functions.https.onCall(async (data, ctx) => {
  if (!ctx.auth)
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Kurs kaydetmek için giriş yapmış olmalısınız."
    )
  await ensureCache()

  try {
    await courses.validate(data)
  } catch (e) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Yanlış kurs verisi:" + (e as any)?.toString()
    )
  }
  const userDoc = await admin.firestore().doc(`users/${ctx.auth!.uid}`).get()
  if (userDoc.exists) {
    await admin
      .firestore()
      .doc(`users/${ctx.auth!.uid}`)
      .update({ courses: data.courses })
  } else {
    await admin
      .firestore()
      .doc(`users/${ctx.auth!.uid}`)
      .set({ courses: data.courses })
  }
})
const getMinutesFromHourString = (hourString: string): number =>
  parseInt(hourString.substr(0, 2)) * 60 + parseInt(hourString.substr(3, 2))
const getHourStringFromMinutes = (minutes: number) =>
  `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`

export const setReminders = functions.https.onCall(async (data, ctx) => {
  if (!ctx.auth)
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Hatırlatma ayarlamak için giriş yapmalısınız."
    )

  await ensureCache()

  const userDoc = await admin.firestore().doc(`users/${ctx.auth!.uid}`).get()
  const reminders = await admin
    .firestore()
    .collection(`users/${ctx.auth!.uid}/reminders`)
    .get()

  console.log("Clean up old reminders")
  for (const reminder of reminders.docs) {
    await reminder.ref.delete()
  }

  if (userDoc.exists) {
    const courses = userDoc.get("courses")
    if (!courses || !courses.length)
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Hiçbir kurs bulunamadı!"
      )
    const courseHours = courses
      .map((course: string) => (coursesCache as any).courses[course])
      .map((course: any) => ({
        ...course,
        times: course.days.map((day: string, i: number) => ({
          day,
          hour: hourMap[course.hours[i] as keyof typeof hourMap],
        })),
      }))

    for (const course of courseHours) {
      let times: string[] = []
      let types: ReminderType[] = []
      if (data.tenMinutes) {
        times = times.concat(
          course.times.map(
            (time: { day: string; hour: string }) =>
              time.day +
              getHourStringFromMinutes(getMinutesFromHourString(time.hour) - 10)
          )
        )
        types = types.concat(
          course.times.map(() => ReminderType.TenMinuteBefore)
        )
      }
      if (data.fiveMinutes) {
        times = times.concat(
          course.times.map(
            (time: { day: string; hour: string }) =>
              time.day +
              getHourStringFromMinutes(getMinutesFromHourString(time.hour) - 5)
          )
        )
        types = types.concat(
          course.times.map(() => ReminderType.FiveMinuteBefore)
        )
      }
      if (data.oneMinute) {
        times = times.concat(
          course.times.map(
            (time: { day: string; hour: string }) =>
              time.day +
              getHourStringFromMinutes(getMinutesFromHourString(time.hour) - 1)
          )
        )
        types = types.concat(
          course.times.map(() => ReminderType.OneMinuteBefore)
        )
      }
      if (data.onTime) {
        times = times.concat(
          course.times.map(
            (time: { day: string; hour: string }) => time.day + time.hour
          )
        )
        types = types.concat(course.times.map(() => ReminderType.OnTime))
      }
      await admin
        .firestore()
        .collection(`users/${ctx.auth!.uid}/reminders`)
        .add({
          code: course.code,
          name: course.name,
          times,
          types,
        })
    }
  } else {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "Hiçbir kurs bulunamadı!"
    )
  }
})

const dayMap = { 0: "Su", 1: "M", 2: "T", 3: "W", 4: "Th", 5: "F", 6: "S" }
const actualRunner = async (ctx: any) => {
  let currentTime = ctx.timestamp ? new Date(ctx.timestamp) : new Date()

  currentTime = new Date(
    currentTime.toLocaleString("en-US", { timeZone: "Turkey" })
  )
  console.log(currentTime)
  const day = currentTime.getDay()
  const time =
    currentTime.getHours().toString().padStart(2, "0") +
    ":" +
    currentTime.getMinutes().toString().padStart(2, "0")
  const reminderSearch = dayMap[day as keyof typeof dayMap] + time
  console.log("Searching for reminders on " + reminderSearch)
  admin
    .firestore()
    .collectionGroup("reminders")
    .where("times", "array-contains", reminderSearch)
    .get()
    .then(async (snap) => {
      for (const reminder of snap.docs) {
        try {
          const userDoc = await reminder.ref.parent?.parent?.get()
          const reminderIndex = reminder
            .data()
            .times.findIndex((time: string) => time === reminderSearch)
          const type: ReminderType = reminder.data().types[reminderIndex]
          if (!userDoc?.exists) continue
          const tokensToSend = (<Device[]>userDoc.get("devices") || [])
            .filter((device) => !device.disabled)
            .map((d) => d.token)
          const template = templates[type]
          if (!template)
            return console.log("Could not find template for type,", type)
          if (tokensToSend.length > 0) {
            console.log("Send to ", tokensToSend)
            admin.messaging().sendToDevice(tokensToSend, {
              data: {
                title: templates[type].title.replace(
                  /\$code/g,
                  reminder.data().code
                ),
                body: templates[type].body.replace(
                  /\$name/g,
                  reminder.data().name
                ),
              },
            })
          }
        } catch (e) {
          console.log(e)
        }
      }
    })
}

export const developerTest = functions.https.onCall((data, ctx) =>
  actualRunner(ctx)
)

export const reminderRunner = functions.pubsub
  .schedule("every 1 minutes")
  .timeZone("Turkey")
  .onRun(actualRunner)

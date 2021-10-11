import { doc } from "@firebase/firestore"
import { getDoc } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useFirestore } from "../util/firebase"
import { getFunctions, httpsCallable } from "firebase/functions"
import { getAuth } from "firebase/auth"

export const ReminderTimes = () => {
  const fs = useFirestore()
  const auth = getAuth()
  const [user, setUser] = useState(null)
  useEffect(() => {
    getDoc(doc(fs, `users/${auth.currentUser.uid}`)).then((s) =>
      setUser(s.data())
    )
  }, [])
  const selected = user?.courses
  const [tenMinuteBefore, setTenMinute] = useState(false)
  const [fiveMinuteBefore, setFiveMinuteBefore] = useState(false)
  const [oneMinuteBefore, setOneMinuteBefore] = useState(false)
  const [onTime, setOnTime] = useState(false)

  return (
    <div className="relative flex-row container z-10 bg-white text-black flex font-semibold rounded-lg border shadow-lg px-10 py-8 m-20">
      <div className="flex-[2] flex flex-col items-start">
        <h1 className="mb-4 text-lg font-semibold">Seçtiğiniz dersler:</h1>
        {selected?.map((key: string) => (
          <div key={key} className="relative font-bold text-xl group">
            {key}
          </div>
        ))}
        <div className="flex-1" />
      </div>
      <div className="flex-1 flex flex-col h-[70vh] ">
        <label htmlFor="tenmin">
          <input
            className="mr-2"
            onChange={(e) => setTenMinute(e.target.checked)}
            checked={tenMinuteBefore}
            type="checkbox"
            id="tenmin"
            placeholder="abc"
          />
          10 dakika önce hatırlat
        </label>
        <label htmlFor="fivemin">
          <input
            className="mr-2"
            onChange={(e) => setFiveMinuteBefore(e.target.checked)}
            checked={fiveMinuteBefore}
            type="checkbox"
            id="fivemin"
            placeholder="abc"
          />
          5 dakika önce hatırlat
        </label>
        <label htmlFor="onemin">
          <input
            className="mr-2"
            onChange={(e) => setOneMinuteBefore(e.target.checked)}
            checked={oneMinuteBefore}
            type="checkbox"
            id="fivemin"
            placeholder="abc"
          />
          1 dakika önce hatırlat
        </label>
        <label htmlFor="ontime">
          <input
            className="mr-2"
            onChange={(e) => setOnTime(e.target.checked)}
            checked={onTime}
            type="checkbox"
            id="ontime"
            placeholder="abc"
          />
          Zamanında hatırlat
        </label>
        <div className="flex-1" />
        <button
          className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
          onClick={() =>
            httpsCallable(
              getFunctions(),
              "setReminders"
            )({
              onTime,
              tenMinutes: tenMinuteBefore,
              fiveMinutes: fiveMinuteBefore,
              oneMinute: oneMinuteBefore,
            })
          }
        >
          Hatırlatmaları ayarla{" "}
        </button>
        {window.location.hostname === "localhost" && (
          <button
            className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
            onClick={() => httpsCallable(getFunctions(), "developerTest")()}
          >
            DevTest
          </button>
        )}
      </div>
    </div>
  )
}

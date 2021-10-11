import { getFunctions, httpsCallable } from "firebase/functions"
import { getMessaging, getToken } from "firebase/messaging"
import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router"
import { Redirect } from "react-router-dom"
import { useAppSelector } from "../store"
import { setToken } from "../store/token"
import { useApp, useAuth } from "../util/firebase"

export const EnableNotifs = () => {
  const firebaseApp = useApp()
  const dispatch = useDispatch()
  const loginHandler = useCallback(() => {
    const messaging = getMessaging(firebaseApp)
    getToken(messaging, {
      vapidKey:
        "BFmy7nNrHloEPwkkTU5izFO0uc1JRiUZ6Kp91wQ7wAL87NxGOAqB_8u-m6NdFoIoZqKBbj-ZTn7mD2zubF3Qkcw",
    }).then((token) => {
      dispatch(setToken(token))
      httpsCallable(getFunctions(), "addDevice")({ token })
    })
  }, [firebaseApp, dispatch])
  const history = useHistory()
  const skipHandler = useCallback(() => {
    history.push("/courselist")
  }, [])
  const user = useAuth()
  const token = useAppSelector((s) => s.deviceToken)
  return (
    <div className="relative z-10 bg-white text-black flex flex-col font-semibold rounded-lg border shadow-lg px-10 py-8 m-20">
      <span>
        Hoş geldin, {user.displayName}!<br />
        Başlamak için bildirimlere izin ver:
      </span>
      {token !== null && <Redirect to="/courselist" />}
      <button
        className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
        onClick={loginHandler}
      >
        Bildirimlere izin ver
      </button>
      <button
        className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
        onClick={skipHandler}
      >
        Atla
      </button>
    </div>
  )
}

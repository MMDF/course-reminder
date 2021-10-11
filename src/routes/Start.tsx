import { getAuth, GoogleAuthProvider, signInWithRedirect } from "@firebase/auth"
import { useCallback, useMemo } from "react"
import { useApp } from "../util/firebase"

export const Start = () => {
  const firebaseApp = useApp()
  const auth = useMemo(() => {
    const auth = getAuth(firebaseApp)
    auth.languageCode = "tr"
    return auth
  }, [])
  const google = useMemo(() => new GoogleAuthProvider(), [])
  const loginHandler = useCallback(() => {
    signInWithRedirect(auth, google)
  }, [])
  return (
    <div className="relative z-10 bg-white text-black flex flex-col font-semibold rounded-lg border shadow-lg px-10 py-8 m-20">
      <span>
        Kurs hatırlatma uygulamasına hoş geldiniz. Başlamak için lütfen giriş
        yapınız.
      </span>
      <button
        className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
        onClick={loginHandler}
      >
        Google ile giriş yap
      </button>
    </div>
  )
}

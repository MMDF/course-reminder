import { getAuth, GoogleAuthProvider, signInWithRedirect } from "@firebase/auth"
import { useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { useApp } from "../util/firebase"

export const NotFound = () => {
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
      <span>Aradığınız sayfa bulunamadı.</span>
      <Link
        to="/"
        className="px-4 py-2 dev rounded-lg self-center mt-6 border-2 mt-4 border-gray-700"
      >
        Ana sayfaya git
      </Link>
    </div>
  )
}

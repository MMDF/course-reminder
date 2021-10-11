import type { FirebaseApp } from "@firebase/app"
import { GoogleAuthProvider, getAuth } from "@firebase/auth"
import { getRedirectResult, signOut as firebaseSignOut } from "firebase/auth"
import { useEffect, useMemo } from "react"
import { BlurryBG } from "./components/BlurryBackground"
import { AppContext, useAuth } from "./util/firebase"
import { Route, Switch, NavLink } from "react-router-dom"
import { Start } from "./routes/Start"
import { EnableNotifs } from "./routes/EnableNotifs"
import { Provider, useDispatch } from "react-redux"
import { persistor, store, useAppSelector } from "./store"
import { NotFound } from "./routes/NotFound"
import { CoursePicker } from "./routes/CoursePicker"
import { doc, getDoc, getFirestore } from "firebase/firestore"
import { signIn, signOut } from "./store/prev-login"
import { PersistGate } from "redux-persist/integration/react"
import { ReminderTimes } from "./routes/ReminderTimes"
import { User } from "./routes/User"

type AppProps = {
  firebaseApp: FirebaseApp
}
const App: React.FC<AppProps> = ({ firebaseApp }: AppProps) => {
  const user = useAuth()
  useEffect(() => {
    if (user) store.dispatch(signIn({ uid: user.uid }))
    if (!user) {
      const invalidatePastLogin = setTimeout(() => {
        store.dispatch(signOut())
        return
      }, 15000)
      return () => clearTimeout(invalidatePastLogin)
    }
  }, [user])

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    // Log in user if redirected from google
    getRedirectResult(auth)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result)

        // The signed-in user info.
        const user = result.user
        console.log(user)
        return user
      })
      .catch((error) => {
        // Handle Errors here.
        // The email of the user's account used.
        // The AuthCredential type that was used.
        // ...
      })

    // Cache courses
    getDoc(doc(getFirestore(firebaseApp), "semesters/2021-2022-1"))
  }, [])

  const appContext = useMemo(() => ({ app: firebaseApp }), [firebaseApp])

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <AppContext.Provider value={appContext}>
          <Root />
        </AppContext.Provider>
      </PersistGate>
    </Provider>
  )
}
const NavLinkClassName =
  "relative hover:bg-gray-100 z-10 bg-white font-medium rounded-lg border shadow-lg px-5 py-4"
const Root = () => {
  const user = useAuth()
  const loggedIn = useAppSelector((s) => s.prevLoginState.signedIn)
  const dispatch = useDispatch()
  return (
    <div className="flex items-center justify-center h-screen pt-16">
      <div className="fixed inset-0">
        <BlurryBG />
      </div>
      <div className="flex flex-col items-center fixed pt-4 inset-0">
        <div className="flex container space-x-4">
          <NavLink
            to="/courselist"
            activeClassName="text-blue-800 font-semibold"
            className={NavLinkClassName}
          >
            Ders Seçimi
          </NavLink>
          <NavLink
            to="/remindertimes"
            activeClassName="text-blue-800 font-semibold"
            className={NavLinkClassName}
          >
            Hatırlatma Seçimi
          </NavLink>
          <div className="flex-1" />
          {user || loggedIn ? (
            <>
              <NavLink
                to="/user"
                activeClassName="text-blue-800 font-bold"
                className={NavLinkClassName + " mr-2"}
              >
                Hesap
              </NavLink>
              <button
                onClick={() => {
                  firebaseSignOut(getAuth())

                  dispatch(signOut())
                }}
                className={NavLinkClassName + " text-red-800"}
              >
                Çıkış
              </button>
            </>
          ) : null}
        </div>
      </div>
      <Switch>
        {user ? (
          [
            <Route key="/" path="/" exact>
              <EnableNotifs />
            </Route>,
            <Route key="courselist" path="/courselist">
              <CoursePicker />
            </Route>,
            <Route key="remindertimes" path="/remindertimes">
              <ReminderTimes />
            </Route>,
            <Route key="user" path="/user">
              <User />
            </Route>,
          ]
        ) : loggedIn ? (
          <Route path="/" component={Start} />
        ) : (
          <Route path="/" exact component={Start} />
        )}
        <Route path="*" component={NotFound} />
      </Switch>
    </div>
  )
}

export default App

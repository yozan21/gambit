import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App, { AppShell } from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/index.ts";

import NotFound from "./pages/NotFound";
import { createBrowserRouter } from "react-router";
import Home from "./pages/Home.tsx";
import Game from "./pages/Game.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./components/forms/SignupForm.tsx";
import { registerSocketListeners } from "./services/socket.ts";
import Profile from "./pages/Profile.tsx";
import ProfileSettings from "./components/profile/ProfileSettings.tsx";
import ProfileMatches from "./components/profile/ProfileMatches.tsx";
import ProfileOverview from "./components/profile/ProfileOverview.tsx";
import ProfileStats from "./components/profile/ProfileStats.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import FriendLobby from "./pages/FriendLobby.tsx";
import CreateRoom from "./pages/Createroom.tsx";
import JoinRoom from "./pages/JoinRoom.tsx";
import ComingSoon from "./pages/ComingSoon.tsx";
import ErrorPage from "./pages/ErrorPage.tsx";
import TermsOfService from "./pages/TermsOfService.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import CompleteSignup from "./components/forms/CompleteSignup.tsx";

/* =====================
   Router Configuration
===================== */
export const router = createBrowserRouter([
  {
    element: <AppShell />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/play/bot",
        element: <ComingSoon />,
      },
      {
        path: "/play/friend",
        element: <FriendLobby />,
      },
      {
        path: "/play/friend/create",
        element: <CreateRoom />,
      },
      {
        path: "/play/friend/join/:code?",
        element: <JoinRoom />,
      },
      {
        path: "/play/:mode",
        element: <Game />,
      },
      {
        path: "/play/:mode/:gameId",
        element: <Game />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/signup-complete",
        element: <CompleteSignup />,
      },
      {
        path: "/profile",
        element: <Profile />,
        children: [
          {
            index: true,
            element: <ProfileOverview />,
          },
          {
            path: "matches",
            element: <ProfileMatches />,
          },
          {
            path: "stats",
            element: <ProfileStats />,
          },
          {
            path: "settings",
            element: <ProfileSettings />,
          },
        ],
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/terms",
        element: <TermsOfService />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

registerSocketListeners({
  dispatch: store.dispatch,
  getState: store.getState,
  navigate: (path) => router.navigate(path),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);

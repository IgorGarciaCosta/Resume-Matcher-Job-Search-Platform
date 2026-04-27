import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import JobSearchPage from "./pages/JobSearchPage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/search", element: <JobSearchPage /> },
      { path: "/analyzer", element: <ResumeAnalyzerPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/auth/callback", element: <OAuthCallbackPage /> },
    ],
  },
]);

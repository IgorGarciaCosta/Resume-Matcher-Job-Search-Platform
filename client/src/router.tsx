import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import JobSearchPage from "./pages/JobSearchPage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";
import SavedAnalysesPage from "./pages/SavedAnalysesPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/search", element: <JobSearchPage /> },
      { path: "/analyzer", element: <ResumeAnalyzerPage /> },
      { path: "/saved-analyses", element: <SavedAnalysesPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
    ],
  },
]);

import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import JobSearchPage from "./pages/JobSearchPage";
import ResumeAnalyzerPage from "./pages/ResumeAnalyzerPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/search", element: <JobSearchPage /> },
      { path: "/analyzer", element: <ResumeAnalyzerPage /> },
    ],
  },
]);

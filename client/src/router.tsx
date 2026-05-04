import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";

const HomePage = lazy(() => import("./pages/HomePage"));
const JobSearchPage = lazy(() => import("./pages/JobSearchPage"));
const ResumeAnalyzerPage = lazy(() => import("./pages/ResumeAnalyzerPage"));
const SavedAnalysesPage = lazy(() => import("./pages/SavedAnalysesPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid rgba(124,92,252,0.2)",
              borderTopColor: "#7c5cfc",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/search",
        element: (
          <SuspenseWrapper>
            <JobSearchPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/analyzer",
        element: (
          <SuspenseWrapper>
            <ResumeAnalyzerPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/saved-analyses",
        element: (
          <SuspenseWrapper>
            <SavedAnalysesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/login",
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: "/signup",
        element: (
          <SuspenseWrapper>
            <SignupPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

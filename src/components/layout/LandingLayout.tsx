import { PropsWithChildren } from "react";

/**
 * Simple layout wrapper for the landing page
 */
export default function LandingLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
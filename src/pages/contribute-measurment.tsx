import React from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";
import {
  SignIn,
  ClerkLoading,
  RedirectToSignIn,
  ClerkLoaded,
  SignedOut,
  useSession,
  SignInButton,
  SignOutButton,
} from "@clerk/clerk-react";

const ContributeMeasurement: React.FC = () => {
  const { isLoaded, session, isSignedIn } = useSession();
  console.log({ session });
  const email = session?.publicUserData.identifier;
  return (
    <HeaderAndFooter>
      <div>
        <h1>Contribute Measurement</h1>

        <p>
          Help find intersections that need better priority for pedestrians and
          cyclists!
        </p>

        <p>
          By submitting this form you are happy for your answers to be published
          as open data under ODbL.
        </p>

        <p>
          Email address is required to identify sources of spam (so that it can
          be batch-removed by email), however email will not be published.
        </p>

        <p>
          View all data on the{" "}
          <a 
          target="_blank"
          rel="noopener noreferrer"
          href="https://docs.google.com/spreadsheets/d/1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM/edit#gid=0">
            Google Sheet
          </a>
        </p>

        {!isLoaded && <p>Loading authentication...</p>}
        {isLoaded && !isSignedIn && <SignInButton />}
        {isLoaded && isSignedIn && (
          <div>
            <h2>Contribute a measurement</h2>
            <p>You are now signed in as {email}!</p>


            <SignOutButton></SignOutButton>
          </div>
        )}
      </div>
    </HeaderAndFooter>
  );
};

export default ContributeMeasurement;

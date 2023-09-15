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

        <p>Intro on how to measure is here</p>

        {!isLoaded && <p>Loading authentication...</p>}
        {isLoaded && !isSignedIn && <SignInButton />}
        {isLoaded && isSignedIn && (
          <div>
            <p>You are now signed in as {email}!</p>

            <h2>Here goes the questions and form submit</h2>

            <SignOutButton></SignOutButton>
          </div>
        )}
      </div>
    </HeaderAndFooter>
  );
};

export default ContributeMeasurement;

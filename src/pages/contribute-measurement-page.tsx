import React, { useState, useEffect } from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";
import { createClient, Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase-client";
import { AuthenticatedForm } from "../components/AuthenticatedContributeMeasurementForm";

type AuthState =
  | "no-login-email-sent"
  | "sending-email"
  | "waiting-on-code"
  | "checking-code"
  | "logged-in";
export const ContributeMeasurementPage: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>("no-login-email-sent");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    async function getDBSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    }
    getDBSession();
  }, []);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

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
            href="https://docs.google.com/spreadsheets/d/1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM/edit#gid=0"
          >
            Google Sheet
          </a>
        </p>

        {!session &&
          (authState === "no-login-email-sent" ||
            authState === "sending-email") && (
            <form
              className="form-widget"
              onSubmit={async (event: any) => {
                event.preventDefault();
                setAuthState("sending-email");
                const { error } = await supabase.auth.signInWithOtp({ email });
                if (error) {
                  alert(error.message);
                } else {
                  alert("Check your email for the login code!");
                }
                setAuthState("waiting-on-code");
              }}
            >
              <div>
                <input
                  className="inputField"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  required={true}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <button
                  className={"button block"}
                  disabled={authState === "sending-email"}
                >
                  {authState === "sending-email" ? (
                    <span>Sending code</span>
                  ) : (
                    <span>Send login code</span>
                  )}
                </button>
              </div>
            </form>
          )}

        {!session &&
          (authState === "waiting-on-code" ||
            authState === "checking-code") && (
            <div>
              <h1>Enter your code</h1>
              <form
                className="form-widget"
                onSubmit={async (event: any) => {
                  event.preventDefault();
                  setAuthState("checking-code");
                  const { error } = await supabase.auth.verifyOtp({
                    email,
                    type: "signup",
                    token: verificationCode,
                  });
                  if (error !== null) {
                    console.log(
                      "Signup failed, user likely already has account. Trying signin. Error:",
                      error
                    );
                    const { error: secondError } =
                      await supabase.auth.verifyOtp({
                        email,
                        type: "magiclink",
                        token: verificationCode,
                      });
                    if (secondError) {
                      alert(error.message);
                      setAuthState("waiting-on-code");
                      return;
                    }
                    alert("You're logged in!");
                    setAuthState("logged-in");
                  } else {
                    alert("You're signed up!");
                    setAuthState("logged-in");
                  }
                }}
              >
                <div>
                  <input
                    className="inputField"
                    type="text"
                    placeholder="Verification code"
                    value={verificationCode}
                    required={true}
                    onChange={(e) => setVerificationCode(e.target.value)}
                  />
                </div>
                <div>
                  <button
                    className={"button block"}
                    disabled={authState === "checking-code"}
                  >
                    {authState === "checking-code" ? (
                      <span>Verifing code</span>
                    ) : (
                      <span>Check verification code</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        {session && (
          <AuthenticatedForm key={session.user.id} session={session} />
        )}

        {/* {!isLoaded && <p>Loading authentication...</p>}
        {isLoaded && !isSignedIn && <SignInButton />}
        {isLoaded && isSignedIn && (
          <div>
            <h2>Contribute a measurement</h2>
            <p>You are now signed in as {email}!</p>

          

            <SignOutButton></SignOutButton>
          </div>
        )} */}
      </div>
    </HeaderAndFooter>
  );
};

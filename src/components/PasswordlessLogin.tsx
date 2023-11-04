import { useState, FC } from "react";
import { supabase } from "../utils/supabase-client";
import { Session } from "@supabase/supabase-js";

type AuthState =
  | "no-login-email-sent"
  | "sending-email"
  | "waiting-on-code"
  | "checking-code"
  | "logged-in";

export interface PasswordlessLoginProps {
  /** Session is null when not logged in */
  session: Session | null;
}
export const PasswordlessLogin: FC<PasswordlessLoginProps> = (
  props: PasswordlessLoginProps
) => {
  const { session } = props;
  const [authState, setAuthState] = useState<AuthState>("no-login-email-sent");

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  if (session) {
    return (
      <>
        <p>Logged in as {session.user.email}</p>
        <button
          className="button block"
          type="button"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </>
    );
  }

  if (authState === "no-login-email-sent" || authState === "sending-email") {
    return (
      <>
        <h1>Verify your email to submit a measurement</h1>
        <form
          className="form-widget"
          onSubmit={async (event: any) => {
            event.preventDefault();
            setAuthState("sending-email");
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
              alert(error.message);
              setAuthState("no-login-email-sent");
            }
            setAuthState("waiting-on-code");
          }}
        >
          <div>
            <input
              className="inputField"
              type="email"
              placeholder={"Your email"}
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
                <span>Sending code...</span>
              ) : (
                <span>Send login code</span>
              )}
            </button>
          </div>
        </form>
      </>
    );
  }
  if (authState === "waiting-on-code" || authState === "checking-code") {
    return (
      <div>
        <h1>Enter your verification code</h1>
        <p>Check your email for the login code!</p>
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
              const { error: secondError } = await supabase.auth.verifyOtp({
                email,
                type: "magiclink",
                token: verificationCode,
              });
              if (secondError) {
                alert(error.message);
                setAuthState("no-login-email-sent");
                setVerificationCode("");
                return;
              }
              // alert("You're logged in!");
              setAuthState("logged-in");
            } else {
              // alert("You're signed up!");
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
                <span>Verifing code...</span>
              ) : (
                <span>Verify code</span>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <h1>null</h1>;
};

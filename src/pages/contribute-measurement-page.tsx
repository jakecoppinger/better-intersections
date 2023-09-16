import React, { useState, useEffect } from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";
import { createClient, Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase-client";
import { AuthenticatedForm } from "../components/AuthenticatedContributeMeasurementForm";
import { PasswordlessLogin } from "../components/PasswordlessLogin";

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

        {session && (
          <AuthenticatedForm key={session.user.id} session={session} />
        )}

        <PasswordlessLogin session={session} />
      </div>
    </HeaderAndFooter>
  );
};

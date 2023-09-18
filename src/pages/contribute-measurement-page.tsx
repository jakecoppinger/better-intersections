import React, { useState, useEffect } from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";
import { Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase-client";
import { AuthenticatedForm } from "../components/AuthenticatedContributeMeasurementForm";
import { PasswordlessLogin } from "../components/PasswordlessLogin";

export const ContributeMeasurementPage: React.FC = () => {
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

        <PasswordlessLogin session={session} />

        {session && (
          <AuthenticatedForm key={session.user.id} session={session} />
        )}
        <br></br>
        <iframe
          width="315"
          height="560"
          src="https://www.youtube.com/embed/HJCyV1cQoqo"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>

        <p>
          If you are unable to sign in or have other issues, try using the
          legacy Google Form:{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://forms.gle/3FFGD5Jk14wUS22n6"
          >
            forms.gle/3FFGD5Jk14wUS22n6
          </a>
        </p>

        <p>
          If you hit an issue or find a bug, email Jake (
          <a href="jake@jakecoppinger.com">jake@jakecoppinger.com</a>) or{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/jakecoppinger/better-intersections/issues"
          >
            raise an issue on Github
          </a>
          .
        </p>
      </div>
    </HeaderAndFooter>
  );
};

import { useState, useEffect, FC } from "react";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
import { Session } from "@supabase/gotrue-js/src/lib/types";
import { supabase } from "../utils/supabase-client";
import { AuthenticatedForm } from "../components/AuthenticatedContributeMeasurementForm";
import { PasswordlessLogin } from "../components/PasswordlessLogin";
import { Link, useParams } from "react-router-dom/dist/index";

export const ContributeMeasurementPage: FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  let suppliedNodeId :string = ""
  const isNodeId = useParams();

  if (isNodeId.nodeId !== undefined) {
    suppliedNodeId = isNodeId.nodeId;
  }



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
          A reminder -{" "}
          <b>
            <em>this website is a proof of concept</em>
          </b>{" "}
          and is bare bones! Things may not work - and feel free to contact Jake
          if they don't.
        </p>

        <p>
          By submitting this form you are happy for your answers to be published
          as open data under{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://opendatacommons.org/licenses/odbl/"
          >
            ODbL
          </a>{" "}
          license.
        </p>

        <p>
          Your email address is required to identify and remove spam
          submissions, however your email will not be published. Read more on
          the <Link to="/about">about page</Link>. Code is open source on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/jakecoppinger/better-intersections"
          >
            Github
          </a>
          .
        </p>

        {session && (
          <AuthenticatedForm key={session.user.id} session={session} nodeId={suppliedNodeId}/>
        )}
        <br></br>

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
        <PasswordlessLogin session={session} />
      </div>
    </HeaderAndFooter>
  );
};

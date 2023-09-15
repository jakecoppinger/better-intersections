import React, { useState, useEffect } from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";
import { createClient, Session } from "@supabase/supabase-js";
import { supabase } from "../utils/supabase-client";
import { AuthenticatedForm } from "../components/AuthenticatedContributeMeasurementForm";


export const ContributeMeasurementPage: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    async function getDBSession() {
      const {data: {session}} = await supabase.auth.getSession();
      setSession(session);

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });
    }
    getDBSession();
  }, []);

  const [email, setEmail] = useState('')

  const handleLogin = async (event: any) => {
    event.preventDefault()

    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      alert(error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

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


        {!session ? 
        
        <form className="form-widget" onSubmit={handleLogin}>
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
            <button className={"button block"} disabled={loading}>
              {loading ? <span>Loading</span> : <span>Send magic link</span>}
            </button>
          </div>
        </form>
        
        
        : <AuthenticatedForm key={session.user.id} session={session} />}

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

import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase-client";

export interface AuthenticatedFormProps {
  session: Session;
}

export const AuthenticatedForm: React.FC<AuthenticatedFormProps> = (props) => {
  const { session } = props;

  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState<string | undefined>();

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { user } = session;
        
      let { data, error } = await supabase
        .from("profiles")
        .select(`website`)
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn(error);
      } else if (data) {
        setWebsite(data.website);
      }

      setLoading(false);
    }

    getProfile();
  }, [session]);

  const updateProfile: any = async (event: any, avatarUrl: any) => {
    event.preventDefault();
    console.log({event});

    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      website,
      updated_at: new Date(),
    };

    let { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert(error.message);
    } else {
    }
    setLoading(false);
  }

  return (
    <form onSubmit={updateProfile} className="form-widget">
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="website">Website</label>
        <input
          id="website"
          type="url"
          value={website || ""}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading ..." : "Update"}
        </button>
      </div>

      <div>
        <button
          className="button block"
          type="button"
          onClick={() => supabase.auth.signOut()}
        >
          Sign Out
        </button>
      </div>
    </form>
  );
};

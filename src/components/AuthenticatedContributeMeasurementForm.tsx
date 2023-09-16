import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase-client";

export interface AuthenticatedFormProps {
  session: Session;
}

export const AuthenticatedForm: React.FC<AuthenticatedFormProps> = (props) => {
  const { session } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | undefined>();

  useEffect(() => {
    async function getMeasurements() {
      setLoading(true);
      // const { user } = session;

      const { data, error } = await supabase
        .from("measurements")
        .select(
          `id,updated_at,location_description,green_light_duration,flashing_red_light_duration,solid_red_light_duration,osm_node_id,crossing_lantern_type,can_cars_cross_while_flashing_red,intersection_id,is_scramble_crossing,notes`
        );
      // .eq("id", user.id)

      if (error) {
        console.warn(error);
      } else if (data) {
        setData(data);
      }

      setLoading(false);
    }

    getMeasurements();
  }, [session]);

  const updateProfile: any = async (event: any, avatarUrl: any) => {
    event.preventDefault();
    console.log({ event });

    setLoading(true);
    const { user } = session;

    const updates = {
      id: user.id,
      website: data,
      updated_at: new Date(),
    };

    let { error } = await supabase.from("profiles").upsert(updates);

    if (error) {
      alert(error.message);
    } else {
    }
    setLoading(false);
  };

  return (
    <>
      <p>Measurements: {JSON.stringify(data)}</p>

      <form onSubmit={updateProfile} className="form-widget">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="text" value={session.user.email} disabled />
        </div>
        <div>
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            value={data || ""}
            onChange={(e) => setData(e.target.value)}
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
      </form>
    </>
  );
};

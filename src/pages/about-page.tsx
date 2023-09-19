import React from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";
// @ts-ignore
import { HashLink } from "react-router-hash-link";
import { Link } from "react-router-dom";

const About: React.FC = () => {
  return (
    <HeaderAndFooter>
      <div>
        <h1>About</h1>
        <p>
          Better Intersections is a tool to record and visualise how long people
          walking and on bikes have to wait at traffic lights. You can{" "}
          <Link to={"/contribute-measurement"}>
            contribute timing measurements
          </Link>{" "}
          yourself. It's focused on Sydney, Australia, but is adaptable for
          anywhere in the world.
        </p>

        <p>
          This website is open source on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/jakecoppinger/better-intersections"
          >
            Github
          </a>{" "}
          (contributions welcome!), and the data is under an open license (
          <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a>{" "}
          license).
        </p>
        <p>
          If you have ideas for improvements, please create a{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/jakecoppinger/better-intersections"
          >
            Github issue
          </a>
          , email me at{" "}
          <a href="mailto:jake@jakecoppinger.com">jake@jakecoppinger.com</a> or
          message me on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://aus.social/@jakecoppinger"
          >
            Mastodon (@jakecoppinger@aus.social)
          </a>
          .
        </p>
        <h3>Downloading data</h3>
        <p>
          Better Intersections has recently moved from a Google Form / Google
          Sheets architecture to a dedicated (Postgres) database.
        </p>
        <p>
          View all data up to the transition on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM/edit?usp=sharing"
          >
            Google Sheets
          </a>
          . CSV download coming soon (see{" "}
          <Link
            target="_blank"
            to={
              "https://github.com/jakecoppinger/better-intersections/issues/18"
            }
          >
            Github issue
          </Link>
          .
        </p>

        <h1>Why does the timing of pedestrian signals matter?</h1>
        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://en.wikipedia.org/wiki/Transport_for_NSW"
          >
            Transport for NSW
          </a>
          , the government agency which controls traffic signal timing in Sydney
          and elsewhere in NSW, has an excellent{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.future.transport.nsw.gov.au/future-transport-plans/active-transport-strategy"
          >
            stated
          </a>{" "}
          goal of increasing walking and cycling trips - and reducing pedestrian
          wait times at intersections.
        </p>
        <p>
          However, there is{" "}
          <i>
            <b>no public data on traffic light timing in Sydney or NSW</b>
          </i>
          .
        </p>
        <p>
          In the absence of traffic light timing data, and as we hold hope for
          it to become publicly available; the aim of this project is to
          crowdsource measurements and inform where positive changes could be
          made.
        </p>
        <p>
          This website bridges the excellent TfNSW Active Transport policy
          guidelines and pedestrians on the street themselves, allowing people
          on foot (and bicycle) to see their experience represented.
        </p>
        <blockquote>
          Increasing pedestrian priority and providing crossing opportunities at
          the right locations and along desire lines, reduces the risk of
          pedestrian injury at intersections by encouraging safer behaviours.
          Transport is currently rolling out measures at intersections to
          improve pedestrian priority in areas of high pedestrian activity.
          These measures may include automation of pedestrian crossings,{" "}
          <b>reduced pedestrian wait times</b>, provision of pedestrian
          crossings on missing legs and kerb ramps, where applicable.
        </blockquote>
        <figcaption>
          —{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.future.transport.nsw.gov.au/sites/default/files/2022-12/Active_transport_strategy_0.pdf"
          >
            TfNSW Active Transport Strategy, page 30.
          </a>{" "}
          Emphasis added.
        </figcaption>
        <p>
          Research has shown that 30 seconds is the longest a pedestrian will
          wait at a signalised crossings before attempting to cross against the
          'red man'. (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="http://content.tfl.gov.uk/factors-influencing-pedestrian-safety-literature-review.pdf"
          >
            Martin, A., 2006. Factors influencing pedestrian safety: a
            literature review (No. PPR241). Wokingham, Berks: TRL (Transport for
            London.
          </a>
          )
        </p>
        <p>From the above report:</p>
        <blockquote>
          Hunt, Lyons and Parker (2000) state that 'Although no clear
          relationship has been established between pedestrian delay and
          casualties,{" "}
          <b>
            a more balanced and responsive approach to the allocation of time at
            Pelican/Puffin crossings has the potential to make a substantial
            contribution to a decrease in pedestrian casualties as well as
            improving pedestrian amenity'.
          </b>{" "}
          They point out that because pedestrians are more likely to become
          impatient when a red man continues to be shown during periods of low
          vehicle flow, the reduction of unnecessary delay for pedestrians
          should encourage pedestrians to use crossings correctly and reduce
          risk taking.
        </blockquote>
        <p>
          In 2020, people driving vehicles killed 138 pedestrians on Australian
          roads (
          <a href="https://www.roadsafety.gov.au/nrss/fact-sheets/vulnerable-road-users">
            Department of Infrastructure, Transport, Regional Development and
            Communications (2021) Fact sheet: Vulnerable road users, National
            Road Safety Strategy.
          </a>
          )
        </p>
        <h1>Further reading</h1>
        <p>
          Read more on Jake Coppinger's blog post,{" "}
          <Link
            target="_blank"
            to={
              "https://jakecoppinger.com/2023/07/shining-a-light-on-the-traffic-signals-of-sydney/"
            }
          >
            Shining a Light on the Traffic Signals of Sydney
          </Link>
          .
        </p>
        <h1>
          <a  id="contributing">How to contribute measurements</a>
        </h1>
        <h2>
          <a href="/contribute-measurement">Open the form</a> and follow the
          steps!
        </h2>

        <ul>
          <li>
            Submit the location of the intersection and exactly which crossing
            if there are multiple nearby
            <ul>
              <li>eg. George st and Cleveland st, east side</li>
            </ul>
          </li>
          <li>
            Start the stopwatch on your watch (or phone) when the
            pedestrian/bicycle lantern turns green
          </li>
          <li>
            Press lap when the light starts flashing red, or:
            <ul>
              <li>if it has a number counting down, when that starts</li>
              <li>if it's a bicycle lantern, when it turns orange</li>
            </ul>
          </li>
          <li>Press lap when the light turns solid red</li>
          <li>
            Press the crossing button to request the lights to change
            <ul>
              <li>
                if you're inside the{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://jakecoppinger.com/2023/07/shining-a-light-on-the-traffic-signals-of-sydney/"
                >
                  Sydney CBD automated signal area
                </a>
                , you won't need to do this
              </li>
            </ul>
          </li>
          <li>Press lap when the light turns green again</li>
          <li>
            Submit the <a href="/contribute-measurement">form</a> with your
            measurement!
          </li>
        </ul>
        <h1>Further reading</h1>
        <ul>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.future.transport.nsw.gov.au/future-transport-plans/active-transport-strategy"
            >
              Transport for NSW Active Transport Strategy
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://jakecoppinger.com/2022/12/sydney-cbd-is-bringing-back-pedestrian-beg-buttons/"
            >
              Sydney CBD is bringing back pedestrian “beg buttons” - Jake
              Coppinger
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.livingstreets.org.uk/policy-and-resources/our-policy/crossings"
            >
              UK Living Streets Crossings policy
            </a>
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.livingstreets.org.uk/media/7942/is-your-signalised-crossing-up-to-scratch-nov-2022.pdf"
            >
              UK Living Streets Crossing Audit checklist
            </a>
          </li>
        </ul>
      </div>
    </HeaderAndFooter>
  );
};

export default About;

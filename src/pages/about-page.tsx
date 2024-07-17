import { FC } from "react";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
import { Link } from "react-router-dom/dist/index";
import { CsvExport } from "../components/CsvExport";
import { JsonExport } from "../components/JsonExport";
import { Helmet } from "react-helmet-async";

const About: FC = () => {
  return (
    <HeaderAndFooter>
      <Helmet prioritizeSeoTags>
        <title>About - Better Intersections</title>
        <meta property="og:title" content="About - Better Intersections" />
        <meta name="description" content="About the Better Intersections project. Better Intersections is a crowdsourced pedestrian traffic light timing map that works all over the world, with a focus on Sydney, Australia.">
        </meta>
      </Helmet>
      <div>
        <h2>About</h2>
        <p>
          Better Intersections is a tool to record and visualise how long people
          walking and on bikes have to wait at traffic lights. You can{" "}
          <Link to={"/contribute-measurement"}>
            contribute timing measurements
          </Link>{" "}
          yourself. It's focused on Sydney, Australia, but you're welcome to
          take measurements for any intersection around Australia or the world.
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
          (AGPL-3.0 license, contributions welcome!), and you can download the
          data under an open license ({" "}
          <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a>) under
          the heading below.
        </p>

        <p>
          Read more about about Sydney's traffic signals on Jake Coppinger's
          blog post,{" "}
          <Link
            target="_blank"
            to={
              "https://jakecoppinger.com/2023/07/shining-a-light-on-the-traffic-signals-of-sydney/"
            }
          >
            Shining a Light on the Traffic Signals of Sydney
          </Link>{" "}
          (July 2023).
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
            href="https://mastodon.social/@jakecoppinger"
          >
            Mastodon
          </a>.
        </p>
        <h2>Why does the timing of pedestrian signals matter?</h2>
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
        <h2>
          <a id="contributing">How to contribute measurements</a>
        </h2>
        <p>
          <a href="/contribute-measurement">Open the form</a> and follow the
          steps!
        </p>
        <h2>How to download the data</h2>

        <p>You can download a CSV or JSON file of all measurements below.</p>
        <CsvExport></CsvExport>
        <JsonExport></JsonExport>
        <p>
          The data was previously hosted on a Google Form / Google Sheets
          backend. View data up to the transition on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM/edit?usp=sharing"
          >
            Google Sheets
          </a>{" "}
          (the above CSV export includes all data).
        </p>
        <h2>Further reading</h2>
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

import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./styles/countryinfo.css";

const API_BASE = "https://api.restcountries.com/countries/v5";
const API_KEY = process.env.REACT_APP_REST_COUNTRIES_API_KEY;

const CountryInfo = () => {
  const [country, setCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const { countryName } = useParams();

  useEffect(() => {
    const getCountryByName = async () => {
      try {
        setIsLoading(true);
        setError("");

        if (!API_KEY) {
          throw new Error(
            "REST Countries API key is missing. Check your .env file."
          );
        }

        const url =
          `${API_BASE}/names.common/` +
          `${encodeURIComponent(countryName)}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${API_KEY}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          console.error(
            "REST Countries API error:",
            errorData
          );

          throw new Error(
            `Country could not be found (${response.status})`
          );
        }

        const result = await response.json();

        console.log(
          "REST Countries v5 country:",
          result
        );

        const countries =
          result?.data?.objects || [];

        if (countries.length === 0) {
          throw new Error(
            "Country could not be found."
          );
        }

        const searchName =
          decodeURIComponent(countryName).toLowerCase();

        const exactCountry =
          countries.find(
            (c) =>
              c?.names?.common?.toLowerCase() ===
              searchName
          ) || countries[0];

        setCountry(exactCountry);
      } catch (err) {
        console.error(
          "Country API error:",
          err
        );

        setError(
          err.message ||
            "Failed to load country information."
        );
      } finally {
        setIsLoading(false);
      }
    };

    getCountryByName();
  }, [countryName]);

  /*
   * LOADING
   */

  if (isLoading) {
    return (
      <div className="country_info_wrap">
        <button className="back_btn">
          <Link to="/">← Back</Link>
        </button>

        <h4>Loading...</h4>
      </div>
    );
  }

  /*
   * ERROR
   */

  if (error) {
    return (
      <div className="country_info_wrap">
        <button className="back_btn">
          <Link to="/">← Back</Link>
        </button>

        <h4>{error}</h4>
      </div>
    );
  }

  /*
   * NO COUNTRY
   */

  if (!country) {
    return (
      <div className="country_info_wrap">
        <button className="back_btn">
          <Link to="/">← Back</Link>
        </button>

        <h4>
          Country information is not available.
        </h4>
      </div>
    );
  }

  /*
   * BASIC INFORMATION
   */

  const commonName =
    country.names?.common || "N/A";

  const officialName =
    country.names?.official || "N/A";

  const population =
    country.population ?? null;

  const region =
    country.region || "N/A";

  const subregion =
    country.subregion || "N/A";

  /*
   * CAPITAL
   *
   * REST Countries v5:
   * capitals: [{ name: "Helsinki" }]
   */

  const capitals = Array.isArray(
    country.capitals
  )
    ? country.capitals
        .map(
          (capital) =>
            capital?.name
        )
        .filter(Boolean)
    : [];

  /*
   * AREA
   *
   * REST Countries v5:
   * area.kilometers
   */

  const areaKm =
    country.area?.kilometers;

  /*
   * TIMEZONES
   */

  const timezones =
    Array.isArray(country.timezones) &&
    country.timezones.length > 0
      ? country.timezones.join(", ")
      : "N/A";

  /*
   * LANDLOCKED
   */

  const landlocked =
    typeof country.landlocked === "boolean"
      ? country.landlocked
      : null;

  /*
   * START OF WEEK
   */

  const startOfWeek =
    country.start_of_week ||
    country.startOfWeek ||
    "N/A";

  /*
   * LANGUAGES
   */

  const languages = Array.isArray(
    country.languages
  )
    ? country.languages
        .map(
          (language) =>
            language?.name ||
            language?.english_name ||
            language?.native_name
        )
        .filter(Boolean)
        .join(", ")
    : "N/A";

  /*
   * CURRENCIES
   */

  const currencies =
    country.currencies &&
    typeof country.currencies === "object"
      ? Object.entries(
          country.currencies
        )
          .map(
            ([code, currency]) => {
              const name =
                currency?.name || code;

              const symbol =
                currency?.symbol;

              return symbol
                ? `${name} (${symbol})`
                : name;
            }
          )
          .join(", ")
      : "N/A";

  /*
   * TOP LEVEL DOMAIN
   */

  const topLevelDomains =
    Array.isArray(country.tld) &&
    country.tld.length > 0
      ? country.tld.join(", ")
      : "N/A";

  /*
   * FIFA
   */

  const fifaCode =
    country.codes?.fifa ||
    country.fifa ||
    "N/A";

  /*
   * INDEPENDENT
   */

  const independent =
    typeof country.independent === "boolean"
      ? country.independent
      : null;

  /*
   * UN MEMBER
   */

  const unMember =
    typeof country.unMember === "boolean"
      ? country.unMember
      : typeof country.memberships?.un ===
        "boolean"
      ? country.memberships.un
      : null;

  /*
   * DRIVING SIDE
   */

  const drivingSide =
    country.car?.side ||
    country.driving_side ||
    "N/A";

  /*
   * GINI
   */

  const giniObject =
    country.economy?.gini_coefficient ||
    country.gini;

  const gini =
    giniObject &&
    typeof giniObject === "object"
      ? Object.entries(giniObject)
          .map(
            ([year, value]) =>
              `${year}: ${value}`
          )
          .join(", ")
      : "N/A";

  /*
   * NATIVE NAMES
   */

  const nativeNames =
    country.names?.native &&
    typeof country.names.native === "object"
      ? Object.values(
          country.names.native
        )
          .map(
            (name) =>
              name?.common ||
              name?.official
          )
          .filter(Boolean)
          .join(", ")
      : "N/A";

  /*
   * BORDERS
   */

  const borders =
    Array.isArray(country.borders) &&
    country.borders.length > 0
      ? country.borders.join(", ")
      : "None";

  /*
   * COORDINATES
   *
   * REST Countries v5:
   * coordinates.lat
   * coordinates.lng
   */

  let coordinates = "N/A";

  if (
    country.coordinates &&
    typeof country.coordinates === "object"
  ) {
    const lat =
      country.coordinates.lat;

    const lng =
      country.coordinates.lng;

    if (
      lat !== undefined &&
      lat !== null &&
      lng !== undefined &&
      lng !== null
    ) {
      coordinates = `${lat}, ${lng}`;
    }
  }

  /*
   * MAPS
   *
   * REST Countries v5:
   * links.google_maps
   * links.open_street_maps
   */

  const googleMaps =
    country.links?.google_maps || "";

  const openStreetMaps =
    country.links?.open_street_maps || "";

  /*
   * FLAG
   *
   * Priority:
   * 1. API PNG
   * 2. API SVG
   * 3. REST Countries CDN
   * 4. Emoji
   * 5. Generic flag
   */

  const alpha2 =
    country.codes?.alpha_2
      ?.toLowerCase();

  const apiFlagPng =
    country.flag?.url_png || "";

  const apiFlagSvg =
    country.flag?.url_svg || "";

  const flagEmoji =
    country.flag?.emoji || "";

  const cdnFlag =
    alpha2
      ? `https://flags.restcountries.com/v5/w320/${alpha2}.png`
      : "";

  const flagUrl =
    apiFlagPng ||
    apiFlagSvg ||
    cdnFlag ||
    "";

  /*
   * COAT OF ARMS
   */

  const coatOfArmsUrl =
    country.coat_of_arms?.url_png ||
    country.coat_of_arms?.url_svg ||
    country.coatOfArms?.png ||
    country.coatOfArms?.svg ||
    "";

  /*
   * FLAG ALT TEXT
   */

  const flagAlt =
    country.flag?.description ||
    `${commonName} flag`;

  return (
    <div className="country_info_wrap">

      {/* BACK BUTTON */}

      <button className="back_btn">
        <Link to="/">← Back</Link>
      </button>

      <div className="country_info_container">

        {/* FLAG */}

        <div className="country_info-img">

          {flagUrl ? (
            <img
              src={flagUrl}
              alt={flagAlt}
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";

                const fallback =
                  event.currentTarget
                    .nextElementSibling;

                if (fallback) {
                  fallback.style.display =
                    "block";
                }
              }}
            />
          ) : null}

          <div
            className="flag_fallback"
            style={{
              display: flagUrl
                ? "none"
                : "block",
              fontSize: "80px",
              textAlign: "center",
            }}
          >
            {flagEmoji || "🏳️"}
          </div>

        </div>

        {/* COUNTRY INFORMATION */}

        <div className="country_info">

          {/* NAMES */}

          <h2>
            Common Name: {commonName}
          </h2>

          <p className="official_name">
            Official Name: {officialName}
          </p>

          <div className="country_info-columns">

            {/* LEFT COLUMN */}

            <div className="country_info-left">

              <h5>
                Population:{" "}
                {population !== null
                  ? new Intl.NumberFormat().format(
                      population
                    )
                  : "N/A"}
              </h5>

              <h5>
                Region: {region}
              </h5>

              <h5>
                Subregion: {subregion}
              </h5>

              <h5>
                Capital:{" "}
                {capitals.length > 0
                  ? capitals.join(", ")
                  : "N/A"}
              </h5>

              <h5>
                Area:{" "}
                {areaKm !== undefined &&
                areaKm !== null &&
                !Number.isNaN(areaKm)
                  ? `${new Intl.NumberFormat().format(
                      areaKm
                    )} km²`
                  : "N/A"}
              </h5>

              <h5>
                Timezones: {timezones}
              </h5>

              <h5>
                Landlocked:{" "}
                {landlocked === true
                  ? "Yes"
                  : landlocked === false
                  ? "No"
                  : "N/A"}
              </h5>

              <h5>
                Start of Week:{" "}
                {startOfWeek}
              </h5>

            </div>

            {/* RIGHT COLUMN */}

            <div className="country_info-right">

              <h5>
                Languages: {languages}
              </h5>

              <h5>
                Currencies: {currencies}
              </h5>

              <h5>
                Top-Level Domain:{" "}
                {topLevelDomains}
              </h5>

              <h5>
                FIFA Code: {fifaCode}
              </h5>

              <h5>
                Independent:{" "}
                {independent === true
                  ? "Yes"
                  : independent === false
                  ? "No"
                  : "N/A"}
              </h5>

              <h5>
                UN Member:{" "}
                {unMember === true
                  ? "Yes"
                  : unMember === false
                  ? "No"
                  : "N/A"}
              </h5>

              <h5>
                Driving Side:{" "}
                {drivingSide}
              </h5>

              <h5>
                Gini Index: {gini}
              </h5>

            </div>

          </div>

          {/* ADDITIONAL INFORMATION */}

          <div className="country_info-extra">

            <h5>
              Native Names:{" "}
              {nativeNames}
            </h5>

            <h5>
              Borders: {borders}
            </h5>

            <h5>
              Coordinates: {coordinates}
            </h5>

            {/* MAPS */}

            <h5>
              Maps:{" "}

              {googleMaps && (
                <a
                  href={googleMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Maps
                </a>
              )}

              {googleMaps &&
                openStreetMaps &&
                " | "}

              {openStreetMaps && (
                <a
                  href={openStreetMaps}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  OpenStreetMap
                </a>
              )}

              {!googleMaps &&
                !openStreetMaps &&
                "N/A"}

            </h5>

            {/* OFFICIAL WEBSITE */}

            {country.links?.official && (
              <h5>
                Official Website:{" "}

                <a
                  href={
                    country.links.official
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Official Website
                </a>
              </h5>
            )}

            {/* WIKIPEDIA */}

            {country.links?.wikipedia && (
              <h5>
                Wikipedia:{" "}

                <a
                  href={
                    country.links.wikipedia
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Wikipedia
                </a>
              </h5>
            )}

          </div>

          {/* COAT OF ARMS */}

          {coatOfArmsUrl && (
            <div className="coat_of_arms">

              <h4>
                Coat of Arms
              </h4>

              <img
                src={coatOfArmsUrl}
                alt={`${commonName} Coat of Arms`}
              />

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default CountryInfo;
import React, { useState, useEffect, useCallback } from "react";
import SearchInput from "./SearchInput";
import FilterRegional from "./FilterRegional";
import ChatBox from "./ChatBox";
import { Link, useNavigate } from "react-router-dom";
import "./styles/country.css";
import "./styles/pagination.css";

const API_BASE =
  "https://api.restcountries.com/countries/v5";

const API_KEY =
  process.env.REACT_APP_REST_COUNTRIES_API_KEY;

const Countries = () => {
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [countriesPerPage, setCountriesPerPage] =
    useState(10);

  const [currentPage, setCurrentPage] =
    useState(1);

  const navigate = useNavigate();

  const numOfTotalPages = Math.max(
    1,
    Math.ceil(
      countries.length / countriesPerPage
    )
  );

  const pages = Array.from(
    {
      length: numOfTotalPages,
    },
    (_, index) => index + 1
  );

  const indexOfLastCountry =
    currentPage * countriesPerPage;

  const indexOfFirstCountry =
    indexOfLastCountry -
    countriesPerPage;

  const visibleCountries =
    countries.slice(
      indexOfFirstCountry,
      indexOfLastCountry
    );

  /*
   * --------------------------------------------------
   * NORMALIZE COUNTRY
   * --------------------------------------------------
   *
   * Converts REST Countries v5 data into
   * a simple structure for the Home page.
   */

  const normalizeCountry = (country) => {
    /*
     * FLAG
     *
     * Priority:
     * 1. API PNG
     * 2. API SVG
     * 3. REST Countries Flag CDN
     * 4. Emoji
     */

    const alpha2 =
      country.codes?.alpha_2?.toLowerCase();

    const apiFlagPng =
      country.flag?.url_png || "";

    const apiFlagSvg =
      country.flag?.url_svg || "";

    const cdnFlag = alpha2
      ? `https://flags.restcountries.com/v5/w320/${alpha2}.png`
      : "";

    const flagUrl =
      apiFlagPng ||
      apiFlagSvg ||
      cdnFlag ||
      "";

    /*
     * CAPITAL
     *
     * v5:
     * capitals: [{ name: "Helsinki" }]
     */

    const capitals =
      Array.isArray(country.capitals)
        ? country.capitals
          .map(
            (capital) =>
              capital?.name
          )
          .filter(Boolean)
        : [];

    /*
     * CURRENCIES
     */

    const currencyNames =
      country.currencies &&
        typeof country.currencies ===
        "object"
        ? Object.entries(
          country.currencies
        )
          .map(
            ([code, currency]) =>
              currency?.name || code
          )
          .filter(Boolean)
          .join(", ")
        : "N/A";

    /*
     * AREA
     *
     * v5:
     * area.kilometers
     */

    const areaKm =
      country.area?.kilometers;

    return {
      name: {
        common:
          country.names?.common ||
          "Unknown",

        official:
          country.names?.official ||
          "",
      },

      population:
        country.population ?? 0,

      region:
        country.region ||
        "Unknown",

      subregion:
        country.subregion ||
        "N/A",

      capital:
        capitals,

      area:
        areaKm !== undefined &&
          areaKm !== null &&
          !Number.isNaN(areaKm)
          ? areaKm
          : null,

      currencies:
        currencyNames || "N/A",

      flags: {
        url: flagUrl,

        emoji:
          country.flag?.emoji ||
          "🏳️",

        alt:
          country.flag?.description ||
          `${country.names?.common ||
          "Country"
          } flag`,
      },

      /*
       * v5 country codes
       */

      cca2:
        country.codes?.alpha_2 ||
        "",

      cca3:
        country.codes?.alpha_3 ||
        "",

      /*
       * v5 links
       */

      links: {
        googleMaps:
          country.links?.google_maps || `https://www.google.com/maps/search/${encodeURIComponent(
          country.names?.common || ""
        )}`,

        openStreetMaps:
          country.links?.open_street_maps ||
           `https://www.openstreetmap.org/search?query=${encodeURIComponent(
           country.names?.common || ""
         )}`,

        official:
          country.links?.official ||
          "",

        wikipedia:
          country.links?.wikipedia ||
          "",
      },
    };
  };

  /*
   * --------------------------------------------------
   * EXTRACT COUNTRIES
   * --------------------------------------------------
   */

  const extractCountries = (result) => {
    return (
      result?.data?.objects || []
    );
  };

  const getCountries = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!API_KEY) {
        throw new Error(
          "REST Countries API key is missing. Check your .env file."
        );
      }

      /*
       * v5 free plan:
       * maximum limit = 100
       */

      const url =
        `${API_BASE}?limit=100`;

      const response = await fetch(
        url,
        {
          method: "GET",

          headers: {
            Authorization:
              `Bearer ${API_KEY}`,
          },
        }
      );

      if (!response.ok) {
        const errorData =
          await response
            .json()
            .catch(() => null);

        console.error(
          "REST Countries API error:",
          errorData
        );

        throw new Error(
          `REST Countries API error: ${response.status}`
        );
      }

      const result =
        await response.json();

      console.log(
        "REST Countries response:",
        result
      );

      const data =
        extractCountries(result);

      const normalizedCountries =
        data.map(
          normalizeCountry
        );

      setCountries(
        normalizedCountries
      );

      setCurrentPage(1);
    } catch (error) {
      console.error(
        "Countries API error:",
        error
      );

      setError(
        error.message ||
        "Failed to load countries."
      );
    } finally {
      setIsLoading(false);
    }
  	}, []);

  /*
   * --------------------------------------------------
   * GET COUNTRIES BY REGION
   * --------------------------------------------------
   */

  const getCountryByRegion =
    async (regionName) => {
      try {
        setIsLoading(true);
        setError("");

        if (!API_KEY) {
          throw new Error(
            "REST Countries API key is missing. Check your .env file."
          );
        }

        const url =
          `${API_BASE}?limit=100&` +
          `region=${encodeURIComponent(
            regionName
          )}`;

        const response = await fetch(
          url,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${API_KEY}`,
            },
          }
        );

        if (!response.ok) {
          const errorData =
            await response
              .json()
              .catch(() => null);

          console.error(
            "REST Countries region error:",
            errorData
          );

          throw new Error(
            `Failed to load countries by region: ${response.status}`
          );
        }

        const result =
          await response.json();

        console.log(
          "REST Countries region response:",
          result
        );

        const data =
          extractCountries(result);

        const normalizedCountries =
          data.map(
            normalizeCountry
          );

        setCountries(
          normalizedCountries
        );

        setCurrentPage(1);
      } catch (error) {
        console.error(
          "Region API error:",
          error
        );

        setError(
          error.message ||
          "Failed to load countries by region."
        );
      } finally {
        setIsLoading(false);
      }
    };

  /*
   * --------------------------------------------------
   * SEARCH
   * --------------------------------------------------
   */

  const handleSearch = (
    countryName
  ) => {
    navigate(
      `/country/${countryName}`
    );
  };

  /*
   * --------------------------------------------------
   * PAGINATION HANDLERS
   * --------------------------------------------------
   */

  const prevPageHandler = () => {
    if (currentPage > 1) {
      setCurrentPage(
        currentPage - 1
      );
    }
  };

  const nextPageHandler = () => {
    if (
      currentPage <
      numOfTotalPages
    ) {
      setCurrentPage(
        currentPage + 1
      );
    }
  };

  /*
   * --------------------------------------------------
   * INITIAL LOAD
   * --------------------------------------------------
   */

  useEffect(() => {
    getCountries();
  },[getCountries]);


  return (
    <div className="country_wrap">

      {/* SEARCH / FILTER */}

      <div className="country__info">

        <div className="search">
          <SearchInput
            onSearch={
              handleSearch
            }
          />
        </div>

        <select
          value={
            countriesPerPage
          }
          onChange={(e) => {
            setCountriesPerPage(
              Number(
                e.target.value
              )
            );

            setCurrentPage(1);
          }}
        >
          <option value="10">
            10
          </option>

          <option value="20">
            20
          </option>

          <option value="30">
            30
          </option>

          <option value="40">
            40
          </option>

          <option value="50">
            50
          </option>
        </select>

        <div className="filter">
          <FilterRegional
            onSelect={
              getCountryByRegion
            }
          />
        </div>

      </div>

      {/* COUNTRY LIST */}

      <div className="country__list">

        {isLoading &&
          !error && (
            <h4>
              Loading........
            </h4>
          )}

        {error &&
          !isLoading && (
            <h4>
              {error}
            </h4>
          )}

        {!isLoading &&
          !error &&
          visibleCountries.map(
            (country) => {

              return (
                <Link
                  key={
                    country.cca3 ||
                    country.cca2 ||
                    country.name.common
                  }
                  to={`/country/${encodeURIComponent(
                    country.name.common
                  )}`}
                >

                  <div className="country__card">

                    {/* FLAG */}

                    <div className="country__img">

                      {country.flags.url ? (
                        <img
                          src={
                            country.flags.url
                          }
                          alt={
                            country.flags.alt
                          }
                          onError={(
                            event
                          ) => {
                            /*
                             * If API/CDN flag
                             * fails, hide it
                             * and show emoji.
                             */

                            event
                              .currentTarget
                              .style
                              .display =
                              "none";

                            const fallback =
                              event
                                .currentTarget
                                .nextElementSibling;

                            if (
                              fallback
                            ) {
                              fallback.style.display =
                                "block";
                            }
                          }}
                        />
                      ) : null}

                      <div
                        className="flag_fallback"
                        style={{
                          display:
                            country
                              .flags
                              .url
                              ? "none"
                              : "block",

                          fontSize:
                            "60px",

                          textAlign:
                            "center",
                        }}
                      >
                        {
                          country
                            .flags
                            .emoji
                        }
                      </div>

                    </div>

                    {/* COUNTRY DATA */}

                    <div className="country__data">

                      <h3>
                        {
                          country
                            .name
                            .common
                        }
                      </h3>

                      <h6>
                        Population:{" "}
                        {new Intl.NumberFormat().format(
                          country.population
                        )}
                      </h6>

                      <h6>
                        Region:{" "}
                        {
                          country.region
                        }
                      </h6>

                      <h6>
                        Currency:{" "}
                        {
                          country
                            .currencies
                        }
                      </h6>

                      <h6>
                        Capital:{" "}
                        {country.capital
                          .length >
                          0
                          ? country.capital.join(
                            ", "
                          )
                          : "N/A"}
                      </h6>

                      {/* AREA */}

                      <h6>
                        Area:{" "}
                        {country.area !==
                          null
                          ? `${new Intl.NumberFormat().format(
                            country.area
                          )} km²`
                          : "N/A"}
                      </h6>

                      {/* LINKS */}

                      <div
                        className="country__links"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >

                        {country.links
                          .googleMaps && (
                            <a
                              href={
                                country
                                  .links
                                  .googleMaps
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) =>
                                e.stopPropagation()
                              }
                            >
                              Google Map
                            </a>
                          )}

                      </div>

                    </div>

                  </div>

                </Link>
              );
            }
          )}

      </div>

      {/* PAGINATION */}

      <div className="country_pages">

        <span
          onClick={
            prevPageHandler
          }
          style={{
            cursor:
              currentPage === 1
                ? "default"
                : "pointer",
          }}
        >
          Previous
        </span>

        {pages.map(
          (page) => (
            <span
              key={page}
              onClick={() =>
                setCurrentPage(
                  page
                )
              }
              className={
                currentPage === page
                  ? "active"
                  : ""
              }
            >
              {page}{" "}
              {page !==
                numOfTotalPages &&
                "| "}
            </span>
          )
        )}

        <span
          onClick={
            nextPageHandler
          }
          style={{
            cursor:
              currentPage ===
                numOfTotalPages
                ? "default"
                : "pointer",
          }}
        >
          Next
        </span>

      </div>

      {/* CHAT */}

      <ChatBox />

    </div>
  );
};

export default Countries;
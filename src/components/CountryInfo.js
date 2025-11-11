import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const CountryInfo = () => {
  const [country, setCountry] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { countryName } = useParams();

  useEffect(() => {
    const getCountryByName = async () => {
      try {
        const res = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        if (!res.ok) throw new Error("Country could not be found");
        const data = await res.json();
        setCountry(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    getCountryByName();
  }, [countryName]); // ✅ no warning now

  return (
    <div className="country_info_wrap">
      <button>
        <Link to="/">Back</Link>
      </button>

      {isLoading && !error && <h4>Loading........</h4>}
      {error && !isLoading && <h4>{error}</h4>}

      {country?.map((c, index) => (
        <div className="country_info_container" key={index}>
          <div className="country_info-img">
            <img src={c.flags?.png} alt={c.name?.common} />
          </div>
          <div className="country_info">
            <div className="country_info-left">
              <h5>Name: {c.name?.common}</h5>
              <h5>Population: {new Intl.NumberFormat().format(c.population)}</h5>
              <h5>Region: {c.region}</h5>
              <h5>Subregion: {c.subregion}</h5>
              <h5>Capital: {c.capital?.join(", ")}</h5>
              <h5>Area: {new Intl.NumberFormat().format(c.area)} km²</h5>
              <h5>Timezone: {c.timezones?.join(", ")}</h5>
              <h5>Languages: {Object.values(c.languages || {}).join(", ")}</h5>
              <h5>
                Currencies:{" "}
                {Object.values(c.currencies || {})
                  .map(({ name }) => name)
                  .join(", ")}
              </h5>
              <h5>Borders: {c.borders?.join(", ") || "None"}</h5>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountryInfo;
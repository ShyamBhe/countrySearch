import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "./styles/countryinfo.css"; 

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
  }, [countryName]);

  return (
    <div className="country_info_wrap">
      <button className="back_btn">
        <Link to="/">← Back</Link>
      </button>

      {isLoading && !error && <h4>Loading...</h4>}
      {error && !isLoading && <h4>{error}</h4>}

      {country?.map((c, index) => (
        <div className="country_info_container" key={index}>
          <div className="country_info-img">
            <img src={c.flags?.png} alt={c.flags?.alt || c.name?.common} />
          </div>

          <div className="country_info">
            <h2>Common Name:{c.name?.common}</h2>
            <p className="official_name">Official Name: {c.name?.official}</p>

            <div className="country_info-columns">
              <div className="country_info-left">
                <h5>Population: {new Intl.NumberFormat().format(c.population)}</h5>
                <h5>Region: {c.region}</h5>
                <h5>Subregion: {c.subregion}</h5>
                <h5>Capital: {c.capital?.join(", ")}</h5>
                <h5>Area: {new Intl.NumberFormat().format(c.area)} km²</h5>
                <h5>Timezones: {c.timezones?.join(", ")}</h5>
                <h5>Landlocked: {c.landlocked ? "Yes" : "No"}</h5>
                <h5>Start of Week: {c.startOfWeek}</h5>
              </div>

              {/* Right Column */}
              <div className="country_info-right">
                <h5>
                  Languages: {Object.values(c.languages || {}).join(", ")}
                </h5>
                <h5>
                  Currencies:{" "}
                  {Object.values(c.currencies || {})
                    .map(({ name, symbol }) => `${name} (${symbol})`)
                    .join(", ")}
                </h5>
                <h5>Top-Level Domain: {c.tld?.join(", ")}</h5>
                <h5>FIFA Code: {c.fifa || "N/A"}</h5>
                <h5>Independent: {c.independent ? "Yes" : "No"}</h5>
                <h5>UN Member: {c.unMember ? "Yes" : "No"}</h5>
                <h5>Driving Side: {c.car?.side}</h5>
                <h5>Gini Index (2010): {c.gini?.[2010] || "N/A"}</h5>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="country_info-extra">
              <h5>Native Names: {Object.values(c.name?.nativeName || {}).map(n => n.common).join(", ")}</h5>
              <h5>Borders: {c.borders?.join(", ") || "None"}</h5>
              <h5>Coordinates: {c.latlng?.join(", ")}</h5>
              <h5>
                Maps:{" "}
                <a href={c.maps?.googleMaps} target="_blank" rel="noopener noreferrer">
                  Google Maps
                </a>{" "}
                |{" "}
                <a href={c.maps?.openStreetMaps} target="_blank" rel="noopener noreferrer">
                  OpenStreetMap
                </a>
              </h5>
            </div>

            {/* Coat of Arms */}
            {c.coatOfArms?.png && (
              <div className="coat_of_arms">
                <h4>Coat of Arms</h4>
                <img
                  src={c.coatOfArms.png}
                  alt={`${c.name?.common} Coat of Arms`}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountryInfo;

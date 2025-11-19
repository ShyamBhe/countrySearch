import React from "react";

const FilterRegional = ({ onSelect }) => {
  const selectHandler = (e) => {
    onSelect(e.target.value);
  };

  return (
    <select onChange={selectHandler}>
      <option key="default" value="">
        Filter Countries by Region
      </option>

      <option key="Africa" value="Africa">Africa</option>
      <option key="America" value="America">America</option>
      <option key="Asia" value="Asia">Asia</option>
      <option key="Europe" value="Europe">Europe</option>
      <option key="Oceania" value="Oceania">Oceania</option>
    </select>
  );
};

export default FilterRegional;

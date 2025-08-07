import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const LocationSearchBar = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  const debouncedSearch = useRef(
    debounce(async (value) => {
      if (!value.trim()) {
        setSuggestions([]);
        return;
      }

      setIsFetching(true);

      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            value
          )}.json?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}&country=IN&limit=5`
        );

        if (!res.ok) {
          throw new Error('Error fetching data from Mapbox');
        }

        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsFetching(false);
      }
    }, 500)
  ).current;

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.place_name);
    setSuggestions([]);

    // Extract only place name and coordinates
    const locationData = {
      name: suggestion.place_name,
      lat: suggestion.geometry.coordinates[1],
      lon: suggestion.geometry.coordinates[0],
    };

    onSelectLocation(locationData); // Send simplified location data to parent
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  return (
    <div className="relative max-w-lg mx-auto">
    <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-md">

        <FaSearch className="text-gray-400 ml-3" />
     <input
  type="text"
  className="w-full p-3 pl-3 pr-10 rounded-lg focus:outline-none focus:ring-0 placeholder-black"
  placeholder="Search for a location"
  value={query}
  onChange={handleInputChange}
/>

        {query && (
          <button
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-black-400"
            onClick={clearSearch}
          >
            ✕
          </button>
        )}
      </div>

      {isFetching && (
        <div className="absolute top-0 right-0 p-3 text-gray-500">
          <span>Loading...</span>
        </div>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute w-full mt-1 bg-white shadow-lg max-h-64 overflow-y-auto z-10 border border-gray-300 rounded-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="flex items-center p-3 cursor-pointer hover:bg-gray-100"
            >
              <FaMapMarkerAlt className="text-green-400 mr-3" />
              <div>
                <div className="text-sm font-medium text-gray-800">{suggestion.text}</div>
                <div className="text-xs text-gray-600">{suggestion.place_name}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationSearchBar;

import { useState, useEffect } from 'react';

const useMapboxSearch = (MAPBOX_TOKEN, isSavingLoading) => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    if (search.length <= 2) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const fetchSuggestions = async () => {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(search)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&country=in&limit=5`,
          { signal }
        );

        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        setSuggestions(data.features || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch error:', error);
          setSuggestions([]);
        }
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, MAPBOX_TOKEN]);

  return {
    search,
    suggestions,
    handleSearchChange
  };
};

export default useMapboxSearch;
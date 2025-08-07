import React from 'react';
import { FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

const SearchAddress = ({
  search,
  suggestions,
  isSavingLoading,
  onSearchChange,
  onSuggestionClick
}) => (
  <>
    <div className="relative mt-2">
      <FaSearch
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${
          isSavingLoading ? 'opacity-50' : ''
        }`}
      />
      <input
        type="text"
        value={search}
        placeholder="Search for an address..."
        onChange={onSearchChange}
        className={`w-full py-3 pl-12 pr-4 text-base text-gray-800 placeholder-gray-400 bg-white border border-gray-300 rounded-lg shadow-sm
          focus:outline-none transition-all duration-200
          ${isSavingLoading ? 'opacity-70 cursor-not-allowed bg-gray-100' : ''}`}
        aria-label="Search for an address"
        disabled={isSavingLoading}
      />
    </div>

    {suggestions.length > 0 && (
      <ul className="mt-3 list-none p-0 rounded-lg border border-gray-200 bg-white shadow-md max-h-56 overflow-y-auto" role="listbox">
        {suggestions.map((feature) => (
          <li
            key={feature.id}
            onClick={!isSavingLoading ? () => onSuggestionClick(feature) : undefined}
            className={`flex items-center p-4 cursor-pointer transition-colors duration-200 border-b border-gray-100 last:border-b-0
              ${isSavingLoading ? 'opacity-60 pointer-events-none' : 'hover:bg-gray-100'}`}
            role="option"
            aria-disabled={isSavingLoading}
          >
            <FaMapMarkerAlt className="text-gray-400 mr-3 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700">{feature.place_name}</span>
          </li>
        ))}
      </ul>
    )}

    <div className="flex items-center my-6">
      <div className="flex-grow border-t border-gray-200"></div>
      <span className="mx-4 text-xs text-gray-400 font-medium uppercase">or</span>
      <div className="flex-grow border-t border-gray-200"></div>
    </div>
  </>
);

export default SearchAddress;
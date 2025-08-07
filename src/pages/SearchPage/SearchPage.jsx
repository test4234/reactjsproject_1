import React, { useState, useEffect, useMemo } from 'react';
import { useProductData } from '../../context/ProductContext';
import autocompleteData from './keywords.json';
import ProductsFetch from '../../components/ProductsFetch/ProductsFetch';
import AdContainer from '../../components/AdContainer/AdContainer';

// Updated ad configuration using your provided JSON object
const searchAdData = {
  "id": "ad_full_width_top_promo",
  "component": "AdDisplay",
  "adData": {
    "id": "ad_full_width_new_restaurants",
    "type": "FullWidthStaticBanner",
    "imageUrl": "https://images.pexels.com/photos/33019973/pexels-photo-33019973.jpeg",
    "altText": "Craving Something New? Discover Top Restaurants!",
    "linkUrl": "#restaurants/new",
    "size": { "width": "full", "height": "120px" },
    "styles": {
      "container": { "borderRadius": "0px", "overflow": "hidden", "boxShadow": "0 8px 16px rgba(0,0,0,0.2)" },
      "image": { "objectFit": "cover", "filter": "brightness(0.9)" }
    }
  }
};

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [loadingKeywords, setLoadingKeywords] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const storedSearches = localStorage.getItem('recentSearches');
      return storedSearches ? JSON.parse(storedSearches) : [];
    } catch (error) {
      console.error("Failed to load recent searches from local storage", error);
      return [];
    }
  });

  const { products, loading: loadingProducts } = useProductData();

  // Debounced keyword matching logic
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2 && autocompleteData && !isSearchActive) {
        try {
          setLoadingKeywords(true);
          const keywordProductMap = {};
          autocompleteData.forEach((item) => {
            item.keywords.forEach((keyword) => {
              if (keyword.toLowerCase().includes(searchQuery.toLowerCase())) {
                if (!keywordProductMap[keyword]) {
                  keywordProductMap[keyword] = new Set();
                }
                keywordProductMap[keyword].add(item.product_id);
              }
            });
          });
          const uniqueKeywords = Object.keys(keywordProductMap).map((keyword) => ({
            keyword,
            productIds: Array.from(keywordProductMap[keyword]),
          }));
          setFilteredData(uniqueKeywords.slice(0, 5));
          setErrorMessage('');
        } catch (error) {
          console.error("Error during keyword processing:", error);
          setErrorMessage('Error processing keywords.');
        } finally {
          setLoadingKeywords(false);
        }
      } else {
        setFilteredData([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isSearchActive]);

  // Save recent searches to local storage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (error) {
      console.error("Failed to save recent searches to local storage", error);
    }
  }, [recentSearches]);

  const handleKeywordClick = (keyword) => {
    setSearchQuery(keyword);
    const productIds = filteredData.find((item) => item.keyword === keyword)?.productIds || [];
    setSelectedProductIds(productIds);
    setIsSearchActive(true);
    setRecentSearches(prevSearches => {
      const newSearches = [keyword, ...prevSearches.filter(s => s !== keyword)];
      return newSearches.slice(0, 5);
    });
  };

  const handleRecentSearchClick = (keyword) => {
    setSearchQuery(keyword);
    const productIds = (autocompleteData || [])
      .filter(item => item.keywords.some(k => k.toLowerCase() === keyword.toLowerCase()))
      .map(item => item.product_id);
    setSelectedProductIds(productIds);
    setIsSearchActive(true);
  };

  const handleClearClick = () => {
    setSearchQuery('');
    setSelectedProductIds([]);
    setIsSearchActive(false);
    setFilteredData([]);
  };
  
  const handleClearRecentSearches = () => {
    setRecentSearches([]);
  };
  
  const handleBackClick = () => {
    window.history.back();
  };

  const filteredProducts = useMemo(() => {
    if (!products || selectedProductIds.length === 0) return [];
    return products.filter((product) => selectedProductIds.includes(product._id));
  }, [products, selectedProductIds]);

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="relative mb-4 flex items-center bg-white rounded-lg shadow-sm">
        <button
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
          onClick={handleBackClick}
          aria-label="Back"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        
        <input
          className="w-full p-2 pl-0 pr-10 bg-transparent rounded-md focus:outline-none"
          placeholder="Search for products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsSearchActive(false);
          }}
        />

        {searchQuery && (
          <button
            className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            onClick={handleClearClick}
            aria-label="Clear search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {!isSearchActive && searchQuery.length >= 2 ? (
        <div className="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
          {loadingKeywords ? (
            <p className="p-4 text-gray-500 text-sm">Searching keywords...</p>
          ) : errorMessage ? (
            <p className="p-4 text-red-500 text-sm">{errorMessage}</p>
          ) : (
            filteredData.map((item, index) => (
              <div
                key={index}
                className="flex items-center p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0 transition-colors duration-150"
                onClick={() => handleKeywordClick(item.keyword)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 mr-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-sm font-medium text-gray-800">{item.keyword}</p>
              </div>
            ))
          )}
        </div>
      ) : (
        searchQuery.length === 0 && (
          <>
            {recentSearches.length > 0 && (
              <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-md mt-6">
                <div className="flex justify-between items-center pb-3">
                  <div className="text-base font-bold text-gray-900">Recent searches</div>
                  <button
                    className="text-sm font-semibold text-green-700 hover:text-green-800"
                    onClick={handleClearRecentSearches}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {recentSearches.map((term, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 shadow-sm cursor-pointer hover:bg-gray-200 transition-colors duration-150"
                      onClick={() => handleRecentSearchClick(term)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
              <div className="mt-6">
              <AdContainer adData={searchAdData.adData} />
            </div>
          </>
        )
      )}

      {isSearchActive && !loadingProducts && filteredProducts.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">
            Showing results for "<span className="text-green-700">{searchQuery}</span>"
          </h2>
          <ProductsFetch
            category=""
            allProducts={filteredProducts}
            showHeading={false}
            viewmore={undefined}
            isOverallAllProducts={false}
            layout_style="type_4"
            add_button_color="#28a745"
            card_border_radius="6px"
            layout_type="vertical"
            products_per_row={2}
            card_style="type_1"
          />
        </div>
      )}

      {isSearchActive && !loadingProducts && selectedProductIds.length > 0 && filteredProducts.length === 0 && (
        <div className="mt-6">
          <p className="text-gray-500 text-sm mb-4 text-center">No matching products found.</p>
          <AdContainer adData={searchAdData.adData} />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
// context/ProductContext.js
import { createContext, useContext, useState, useEffect, useMemo  } from 'react';
import axios from 'axios';
import { LocationContext } from './LocationContext';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { location} = useContext(LocationContext);
  const PRODUCTSFETCH_PINCODE = import.meta.env.VITE_PRODUCTSAPI_PINCODE_URL;
  const productsapiquery = import.meta.env.VITE_PRODUCTSAPI_PINCODE_QUERY
 const selectedPincode = useMemo(() => location?.pincode, [location?.pincode]);


 console.log(products)

useEffect(() => {
  if (!selectedPincode) return; // wait until we have a valid pincode

  setLoading(true); // optionally show loading every time pincode changes

  let isMounted = true;

  axios
    .get(`${PRODUCTSFETCH_PINCODE}${selectedPincode}${productsapiquery}`)
    .then((res) => {
      if (!isMounted) return;
      const data = res.data?.products || res.data || [];
      setProducts(data);
    })
    .catch(() => {
      if (isMounted) setProducts([]);
    })
    .finally(() => {
      if (isMounted) setLoading(false);
    });

  return () => {
    isMounted = false;
  };
}, [selectedPincode]); // <- ✅ re-run when pincode updates


  return (
    <ProductContext.Provider value={{ products, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProductData = () => useContext(ProductContext);

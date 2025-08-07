import React, { useMemo, useState, useCallback, memo, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useCart } from "../../context/CartContext";
import QuantitySelector from "../QuantitySelector/QuantitySelector";
import Productcard from "../ProductItem/Productcard";
import { fbTrack } from '../../utils/facebookPixel';

const cardSizeMap = {
  sm: { width: '130px', height: 'auto' },
  md: { width: '160px', height: 'auto' },
  lg: { width: '190px', height: 'auto' },
  xl: { width: '220px', height: 'auto' },
  xxl: { width: '250px', height: 'auto' },
};

const gridClasses = {
  horizontal: "flex flex-row items-start overflow-x-auto gap-2 rounded-lg w-full box-border no-scrollbar",
  vertical: "grid auto-rows-fr gap-[6px] rounded-lg",
};

const gridColsClass = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

const ProductsFetch = ({
  category,
  viewmore,
  viewmore_style,
  limit,
  showHeading = true,
  heading,
  onProductsCount,
  allProducts = [],
  isOverallAllProducts,
  add_button_color,
  card_height,
  card_width,
  card_border_radius,
  badge_color,
  badge_text_color,
  badge_text,
  products_per_row,
  card_size = 'md',
  card_style,
  skipCategoryFilter = false,
  layout_type,
  layout_theme,
  ad_image_url,
  product_container_style,
  product_container_background_color,
  ad_image_style
}) => {
  const {
    handleAddToCart,
    handleRemoveFromCart,
    cart,
    changeItemQuantityInCart,
  } = useCart();

  const [showPopup, setShowPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const navigate = useNavigate();

  const filteredProducts = useMemo(() => {
    if (skipCategoryFilter || !category || category.type === "all") {
      return limit ? allProducts.slice(0, limit) : allProducts;
    }

    const { type, categories: subCategories, category: subCategory, nutrition, season } = category;
    let filtered = allProducts;
    
    if (type) {
      filtered = filtered.filter(product => product.type && product.type.toLowerCase() === type.toLowerCase());
    }

    // --- UPDATED LOGIC ---
    if (subCategories && Array.isArray(subCategories)) {
      const lowerCaseCategories = subCategories.map(cat => cat.toLowerCase());
      filtered = filtered.filter(product => 
        product.category && lowerCaseCategories.includes(product.category.toLowerCase())
      );
    } else if (subCategory && subCategory.toLowerCase() !== "none") {
      filtered = filtered.filter(product => product.category && product.category.toLowerCase() === subCategory.toLowerCase());
    }
    // --- END OF UPDATED LOGIC ---
    
    if (nutrition) {
      filtered = filtered.filter(product => {
        const nutritionValue = product.nutrition?.[nutrition];
        return nutritionValue !== undefined && nutritionValue !== null && nutritionValue !== "";
      });
      filtered.sort((a, b) => {
        const valA = parseFloat(a.nutrition[nutrition] || 0); // Handle empty strings and parse
        const valB = parseFloat(b.nutrition[nutrition] || 0); // Handle empty strings and parse
        return valA - valB; // Corrected for ascending order
      });
    }

    if (season === true) {
      filtered = filtered.filter(product => product.season === true);
    }

    return limit ? filtered.slice(0, limit) : filtered;
  }, [allProducts, category, limit, skipCategoryFilter]);

  useEffect(() => {
    if (onProductsCount) {
      onProductsCount(filteredProducts.length);
    }
  }, [filteredProducts.length, onProductsCount]);

  const cartLookup = useMemo(() => {
    return cart.reduce((acc, item) => {
      acc[item.id] = item.quantity;
      return acc;
    }, {});
  }, [cart]);

  const onProductClick = useCallback(product => {
    navigate(`/ProductDetail/${product._id}`);
  }, [navigate]);

  const handleAddClick = useCallback(product => {
    setSelectedProduct(product);
    setQuantity(null);
    setShowPopup(true);
  }, []);

  const handleIncrement = useCallback(productId => {
    const product = allProducts.find(p => p._id === productId);
    if (product) {
      changeItemQuantityInCart(productId, "increment", product.quantity_format?.type);
    }
  }, [allProducts, changeItemQuantityInCart]);

  const handleDecrement = useCallback(productId => {
    const productInCart = cart.find(item => item.id === productId);
    if (!productInCart) return;

    const actualProduct = allProducts.find(p => p._id === productId);
    if (!actualProduct) return;

    const format = actualProduct.quantity_format?.type;
    const baseQty = Number(actualProduct.quantity_format?.qty || 0);
    const minQuantity = format === "unit" ? 1 : 250 + baseQty;

    if (productInCart.quantity <= minQuantity) {
      handleRemoveFromCart(productId);
    } else {
      changeItemQuantityInCart(productId, 'decrement', format);
    }
  }, [cart, handleRemoveFromCart, allProducts, changeItemQuantityInCart]);

  const getCartQuantity = useCallback(productId => cartLookup[productId] ?? null, [cartLookup]);

  const confirmAddToCart = useCallback(() => {
    if (!quantity) return alert("Please select a quantity option");

    if (selectedProduct) {
      const isWeight = selectedProduct.quantity_format?.type === 'weight';
      const baseQty = Number(selectedProduct.quantity_format?.qty || 0);
      const finalQty = isWeight ? quantity + baseQty : quantity;

      handleAddToCart(selectedProduct, finalQty);

      fbTrack('AddToCart', {
        content_ids: [selectedProduct._id],
        content_type: 'product',
        value: selectedProduct.price,
        currency: 'INR',
        contents: [{
          id: selectedProduct._id,
          quantity: finalQty,
          item_price: selectedProduct.discounted_price
        }]
      });
    }

    setShowPopup(false);
    setQuantity(null);
    setSelectedProduct(null);
  }, [quantity, selectedProduct, handleAddToCart]);

  const handleClosePopup = useCallback(() => {
    setShowPopup(false);
    setQuantity(null);
    setSelectedProduct(null);
  }, []);

  const handleViewMoreClick = useCallback(() => {
    const typeParam = category?.type ? `&type=${encodeURIComponent(category.type)}` : '';
    const categoryParam = category?.categories ? 
      category.categories.map(cat => `&category=${encodeURIComponent(cat)}`).join('') :
      (category?.category ? `&category=${encodeURIComponent(category.category)}` : '');
    
    const nutritionParam = category?.nutrition ? `&nutrition=${encodeURIComponent(category.nutrition)}` : '';
    const seasonParam = category?.season ? `&season=${encodeURIComponent(category.season)}` : '';
    navigate(`/productpage?${typeParam}${categoryParam}${nutritionParam}${seasonParam}`);
  }, [navigate, category]);

  const headerContent = useMemo(() => {
    if (!showHeading || !heading) return null;
    return (
      <div className="flex justify-between items-center px-[8px] py-2 w-full bg-white">
        <h2 className="text-[20px] font-bold text-black font-poppins">{heading}</h2>
        {viewmore === "enable" && viewmore_style === "top" && (
          <button onClick={handleViewMoreClick} className="flex items-center gap-1">
            <span className="text-green-600 font-semibold text-sm transition-colors hover:text-green-700 hover:underline">View More</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    );
  }, [showHeading, heading, viewmore, viewmore_style, handleViewMoreClick]);

  const renderProductCards = useCallback(() => {
    const productGridClass = layout_type === 'vertical' ? 
      `${gridClasses.vertical} ${gridColsClass[products_per_row || 2]}` : 
      gridClasses.horizontal;

    const calculatedCardDimensions = layout_type === 'horizontal' 
      ? (cardSizeMap[card_size] || cardSizeMap.md)
      : { width: 'auto', height: 'auto' };

    return (
      <div className={`${productGridClass} px-[8px] pt-[8px] pb-[10px]`}>
        {filteredProducts.map(item => (
          <Productcard
            key={item._id}
            item={item}
            onProductClick={onProductClick}
            handleAddClick={handleAddClick}
            handleRemoveClick={handleRemoveFromCart}
            cartQuantity={getCartQuantity(item._id)}
            handleIncrement={handleIncrement}
            handleDecrement={handleDecrement}
            card_height={calculatedCardDimensions.height}
            card_width={calculatedCardDimensions.width}
            card_border_radius={card_border_radius}
            add_button_color={add_button_color}
            badge_color={badge_color}
            badge_text_color={badge_text_color}
            badge_text={badge_text}
            image_object_fit="contain"
            card_style={card_style}
          />
        ))}
      </div>
    );
  }, [filteredProducts, onProductClick, handleAddClick, handleRemoveFromCart, getCartQuantity, handleIncrement, handleDecrement, card_size, card_border_radius, add_button_color, badge_color, badge_text_color, badge_text, card_style, products_per_row, layout_type]);

  const renderViewMore = () => (
    viewmore === "enable" && viewmore_style === "bottom" && (
      <button className="w-[90%] mx-auto mt-2 px-4 py-2 rounded-lg bg-green-50 text-green-600 font-semibold flex justify-center items-center gap-3 transition-colors duration-200 hover:bg-green-100 border-2 border-green-600" onClick={handleViewMoreClick}>
        <div className="flex relative items-center">
          {[0, 1, 2].map(index => {
            const item = filteredProducts[index];
            return item ? (
              <img key={item._id} src={item.images?.[0]} alt={item.name} className={`w-[25px] h-[25px] rounded-full border-2 border-white object-cover relative ${index !== 0 ? '-ml-3' : ''}`} />
            ) : null;
          })}
        </div>
        <span>View More</span>
      </button>
    )
  );

  if (!filteredProducts.length) {
    return (
      <div className="w-full bg-white">
        {headerContent}
        <p className="p-4 text-gray-600">No products found</p>
      </div>
    );
  }

  if (layout_theme === 'highlighted') {
    return (
      <div className="w-full py-2">
        {headerContent}
        {ad_image_url && (
          <div className="relative w-full">
            <img 
              src={ad_image_url} 
              alt="Promotional Offer" 
              className="w-full h-full object-cover"
              style={ad_image_style}
            />
          </div>
        )}
        <div className={product_container_style} style={{ backgroundColor: product_container_background_color }}>
          {renderProductCards()}
        </div>
        {renderViewMore()}
        {selectedProduct && (
          <QuantitySelector
            isVisible={showPopup}
            selectedProduct={selectedProduct}
            quantity={quantity}
            handleSelectQuantity={setQuantity}
            handleConfirm={confirmAddToCart}
            handleClosePopup={handleClosePopup}
          />
        )}
      </div>
    );
  }
  
  return (
    <div className="w-full py-2">
      {headerContent}
      {renderProductCards()}
      {renderViewMore()}
      {selectedProduct && (
        <QuantitySelector
          isVisible={showPopup}
          selectedProduct={selectedProduct}
          quantity={quantity}
          handleSelectQuantity={setQuantity}
          handleConfirm={confirmAddToCart}
          handleClosePopup={handleClosePopup}
        />
      )}
    </div>
  );
};

export default memo(ProductsFetch);
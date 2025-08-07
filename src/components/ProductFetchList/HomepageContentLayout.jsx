import React, { useMemo, memo, useState, useCallback, useEffect } from "react";
import ProductsFetch from "../ProductsFetch/ProductsFetch";
import { useProductData } from "../../context/ProductContext";
import "./ProductFetchList.css";
import homepageConfig from "./homepageConfig.json";
import AdContainer from "../AdContainer/AdContainer";

const ProductFetchItem = memo(({
  categoryItem,
  heading,
  products,
  isOverallAllProducts,
  viewmore,
  add_button_color,
  card_height,
  card_width,
  card_border_radius,
  badge_color,
  badge_text_color,
  badge_text,
  products_per_row,
  viewmore_style,
  card_style,
  product_limit,
  ad_image_style,
  layout_type,
  layout_theme,
  ad_image_url,
  product_container_style,
  product_container_background_color,
}) => {
  const [hasProducts, setHasProducts] = useState(true);

  const handleProductsStatus = useCallback((productsCount) => {
    setHasProducts(productsCount > 0);
  }, []);

  if (!hasProducts) return null;

  return (
    <div className="productFetchListItem">
      <ProductsFetch
        category={categoryItem}
        showHeading={true}
        heading={heading}
        allProducts={products}
        onProductsCount={handleProductsStatus}
        isOverallAllProducts={isOverallAllProducts}
        viewmore={viewmore}
        viewmore_style={viewmore_style}
        limit={product_limit}
        add_button_color={add_button_color}
        card_height={card_height}
        card_width={card_width}
        card_border_radius={card_border_radius}
        badge_color={badge_color}
        badge_text_color={badge_text_color}
        badge_text={badge_text}
        products_per_row={products_per_row}
        card_style={card_style}
        layout_type={layout_type}
        layout_theme={layout_theme}
        ad_image_url={ad_image_url}
        product_container_style={product_container_style}
        product_container_background_color={product_container_background_color}
        ad_image_style={ad_image_style}
      />
    </div>
  );
});

const HomepageContentLayout = memo(({ selectedFood }) => {
  const { products, loading } = useProductData();
  const [configs, setConfigs] = useState([]);

  useEffect(() => {
    setConfigs(homepageConfig.components);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedFood]);

  const categoriesToDisplay = useMemo(() => {
    if (selectedFood.type === "all") {
      return configs.filter(config =>
        config.component === "ProductsFetch" || config.component === "AdDisplay"
      );
    } else if (Array.isArray(selectedFood.categories)) {
      // Create a single config object for multiple categories
      return [{
        component: "ProductsFetch",
        category: {
          type: selectedFood.type,
          categories: selectedFood.categories, // Pass the array of categories
        },
        heading: selectedFood.name, // Use the main name as the heading
        viewmore: "disable",
        viewmore_style: "bottom",
        add_button_color: "#28a745",
        card_border_radius: "6px",
        products_per_row: 2,
        card_style: "type_1",
        layout_type: "vertical",
        layout_theme: "normal",
      }];
    } else {
      return [];
    }
  }, [selectedFood, configs]);

  const isOverallAllProducts = selectedFood.type === "all";

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-green-500 font-sans p-5 text-center w-full">
        <div className="w-8 h-8 mb-5 border-4 border-t-4 border-t-blue-500 border-gray-300 rounded-full animate-spin"></div>
        <div className="text-xl font-bold text-gray-800 flex items-baseline justify-center">
          Loading
          <span className="inline-block overflow-hidden animate-typing-dots ml-2 text-gray-600"></span>
        </div>
      </div>
    );
  }

  if (!products.length || categoriesToDisplay.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 bg-transparent rounded-xl mt-10 animate-fadeInSlideUp">
        <p className="text-2xl font-bold text-green-500 mb-5">
          Looks like there are no products available in this section right now.
        </p>
      </div>
    );
  }

  return (
    <div className="productFetchListContainer">
      {categoriesToDisplay.map((config, index) => {
        if (config.component === "ProductsFetch") {
          // Use a single key for the combined component
          const key = `${config.category?.type || "unknown"}-${index}`;
          return (
            <ProductFetchItem
              key={key}
              categoryItem={config.category}
              heading={config.heading}
              products={products}
              isOverallAllProducts={isOverallAllProducts}
              viewmore={config.viewmore}
              viewmore_style={config.viewmore_style}
              product_limit={config.product_limit}
              add_button_color={config.add_button_color}
              card_height={config.card_height}
              card_width={config.card_width}
              card_border_radius={config.card_border_radius}
              badge_color={config.badge_color}
              badge_text_color={config.badge_text_color}
              badge_text={config.badge_text}
              products_per_row={config.products_per_row}
              card_style={config.card_style}
              layout_type={config.layout_type}
              layout_theme={config.layout_theme}
              ad_image_url={config.ad_image_url}
              ad_image_style={config.ad_image_style}
              product_container_style={config.product_container_style}
              product_container_background_color={config.product_container_background_color}
            />
          );
        } else if (config.component === "AdDisplay") {
          return (
            <AdContainer
              key={config.adData?.id || `ad-${index}`}
              adData={config.adData}
            />
          );
        }
        return null;
      })}
    </div>
  );
});

HomepageContentLayout.displayName = "ProductFetchList";
export default HomepageContentLayout;
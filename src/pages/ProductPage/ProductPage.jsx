import React, { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useProductData } from "../../context/ProductContext";
import ProductsFetch from "../../components/ProductsFetch/ProductsFetch";

const ProductPage = () => {
    const [searchParams] = useSearchParams();
    const { products, loading } = useProductData();

    // Read all relevant filter parameters from the URL
    const categoryType = searchParams.get("type");
    const subCategory = searchParams.get("category");
    const nutrition = searchParams.get("nutrition");
    const season = searchParams.get("season") === "true"; // Convert string to boolean

    // Create a filter object to pass to ProductsFetch
    const filterParams = useMemo(() => ({
        type: categoryType,
        category: subCategory,
        nutrition: nutrition,
        season: season,
    }), [categoryType, subCategory, nutrition, season]);

    // Dynamically generate the heading based on the active filters
    const pageHeading = useMemo(() => {
        if (subCategory) return `${subCategory} ${categoryType}`;
        if (nutrition) return `High in ${nutrition}`;
        if (season) return `Seasonal Products`;
        if (categoryType) return `All ${categoryType}`;
        return "All Products";
    }, [categoryType, subCategory, nutrition, season]);

    // Memoize the filtered products based on all search parameters
    const filteredProducts = useMemo(() => {
        if (!products) return [];

        let result = products;

        if (categoryType) {
            result = result.filter(product => product.type?.toLowerCase() === categoryType.toLowerCase());
        }
        if (subCategory) {
            result = result.filter(product => product.category?.toLowerCase() === subCategory.toLowerCase());
        }
        if (nutrition) {
            result = result.filter(product => product.nutrition?.[nutrition]);
        }
        if (season) {
            result = result.filter(product => product.season === true);
        }

        return result;
    }, [products, categoryType, subCategory, nutrition, season]);

    if (loading) {
        return <div style={{ padding: "2rem" }}>Loading products...</div>;
    }

    return (
        <div style={{ padding: "1rem" }}>
            <ProductsFetch
                category={filterParams} // Pass the entire filter object
                allProducts={filteredProducts}
                showHeading={true}
                heading={pageHeading} // Use the dynamic heading
                viewmore={undefined} // Ensures no "view more" button
                isOverallAllProducts={false}
                // Apply default styles for individual category view
                add_button_color="#28a745"
                card_border_radius="6px"
                layout_type="vertical" // Default to vertical list view
                products_per_row={2}
                card_style="type_1"
            />
        </div>
    );
};

export default ProductPage;
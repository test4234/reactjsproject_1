import { useMemo } from 'react';

const useProductLayoutClass = ({ isOverallAllProducts, filteredProductsLength, style_card }) => {
    return useMemo(() => {
        if (isOverallAllProducts) {
            return filteredProductsLength >= 6 ? "horizontal-list" : "vertical-list";
        }
        return style_card === "all" ? "horizontal-list" : "vertical-list";
    }, [isOverallAllProducts, filteredProductsLength, style_card]);
};

export default useProductLayoutClass;

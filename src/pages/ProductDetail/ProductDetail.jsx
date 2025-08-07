import React, { useEffect, useState, useRef, useContext, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useProductData } from '../../context/ProductContext';
import { fbTrack } from '../../utils/facebookPixel';
import { LocationContext } from '../../context/LocationContext';

// Memoized UI components for performance
const FreshnessImage = memo(() => (
    <img src="https://ik.imagekit.io/odbeydnbj/icons/image6.png?updatedAt=1754116433458" alt="Freshness Icon" className="w-6 h-6 flex-shrink-0" />
));
const NatureImage = memo(() => (
    <img src="https://ik.imagekit.io/odbeydnbj/icons/image2.png?updatedAt=1754116125588" alt="Naturally Imperfect Icon" className="w-6 h-6 flex-shrink-0" />
));
const HygieneImage = memo(() => (
    <img src="https://ik.imagekit.io/odbeydnbj/icons/image.png?updatedAt=1754115923477" alt="Hygiene Icon" className="w-6 h-6 flex-shrink-0" />
));
const LowPesticideImage = memo(() => (
    <img src="https://ik.imagekit.io/odbeydnbj/icons/image3.png?updatedAt=1754116201388" alt="Low Pesticide Icon" className="w-6 h-6 flex-shrink-0" />
));
const GuaranteeImage = memo(() => (
    <img src="https://ik.imagekit.io/odbeydnbj/icons/image4.png?updatedAt=1754116268407" alt="Freshness Guarantee Icon" className="w-6 h-6 flex-shrink-0" />
));
const ReturnImage = memo(() => (
    <img src="https://ik.imagekit.io/odbeydnbj/icons/image5.png?updatedAt=1754116320534" alt="Return Policy Icon" className="w-6 h-6 flex-shrink-0" />
));


// Helper component for quantity selectors
const QuantitySelector = memo(({ quantity, onIncrement, onDecrement, unitLabel, isCustomSelector = false, minQty }) => {
    const isDecrementDisabled = isCustomSelector && quantity === minQty;
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onDecrement}
                disabled={isDecrementDisabled}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${
                    isDecrementDisabled ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
            >
                -
            </button>
            <span className="text-md font-bold text-gray-900 w-8 text-center">
                {quantity}{unitLabel}
            </span>
            <button
                onClick={onIncrement}
                className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-lg font-semibold hover:bg-green-200 transition-colors"
            >
                +
            </button>
        </div>
    );
});


const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { products } = useProductData();
    const { cart, handleAddToCart, changeItemQuantityInCart, handleRemoveFromCart } = useCart();
    
    const [product, setProduct] = useState(null);
    const [showGoToHomepageButton, setShowGoToHomepageButton] = useState(false);
    
    const hasTrackedView = useRef({});
    const BASE_WEIGHT_QTY = 250;
    const WEIGHT_STEP = 250;

    useEffect(() => {
        window.scrollTo(0, 0);

        const found = products.find((p) => p._id === productId);
        if (found) {
            setProduct(found);
        } else {
            setProduct(null);
        }

        setShowGoToHomepageButton(!window.history.state || window.history.state.idx === 0);
    }, [productId, products]);

    useEffect(() => {
        if (product && !hasTrackedView.current[product._id]) {
            fbTrack('ViewContent', {
                content_ids: [product._id],
                content_name: product.name,
                content_type: 'product',
                value: product.discounted_price,
                currency: 'INR'
            });
            hasTrackedView.current[product._id] = true;
        }
    }, [product]);

    const calculateDiscountPercentage = () => {
        if (!product || !product.actual_price || !product.discounted_price) return 0;
        const actualPrice = product.actual_price;
        const discountedPrice = product.discounted_price;
        if (actualPrice === 0) return 0;
        return Math.round(((actualPrice - discountedPrice) / actualPrice) * 100);
    };

    const handleBackClick = () => {
        if (window.history.state && window.history.state.idx > 0) {
            navigate(-1);
        } else {
            navigate('/', { replace: true });
        }
    };

    const handleGoToHomepageClick = () => {
        navigate('/');
    };

    const getMinQuantity = () => {
        if (!product) return 0;
        const isWeightBased = product.quantity_format?.type === 'weight';
        const baseQty = Number(product.quantity_format?.qty) || 0;
        return isWeightBased ? BASE_WEIGHT_QTY + baseQty : 1;
    };
    
    const inCartItem = cart.find((item) => item.id === productId);
    const minQty = getMinQuantity();
    
    const initialSelectedQty = product ? (product.quantity_format?.type === 'weight' ? (BASE_WEIGHT_QTY + (Number(product.quantity_format?.qty) || 0)) : 1) : null;
    const [selectedQty, setSelectedQty] = useState(initialSelectedQty);
    
    useEffect(() => {
        if (inCartItem) {
            setSelectedQty(inCartItem.quantity);
        } else {
            setSelectedQty(initialSelectedQty);
        }
    }, [inCartItem, initialSelectedQty]);

    const handleCustomIncrement = () => {
        if (!product) return;
        const isUnitBased = product.quantity_format?.type === 'unit';
        const incrementStep = isUnitBased ? 1 : WEIGHT_STEP;
        setSelectedQty(prev => prev + incrementStep);
    };

    const handleCustomDecrement = () => {
        if (!product) return;
        const isUnitBased = product.quantity_format?.type === 'unit';
        const decrementStep = isUnitBased ? 1 : WEIGHT_STEP;

        if (selectedQty > minQty) {
            setSelectedQty(prev => prev - decrementStep);
        }
    };

    const handleAddToCartClick = () => {
        if (!product || selectedQty === null) return;
        
        handleAddToCart(product, selectedQty);

        fbTrack('AddToCart', {
            content_ids: [product._id],
            content_type: 'product',
            value: product.discounted_price,
            currency: 'INR',
            contents: [{
                id: product._id,
                quantity: selectedQty,
                item_price: product.discounted_price
            }]
        });
    };

    const handleUpdateCartIncrement = () => {
        if (!product) return;
        changeItemQuantityInCart(productId, "increment", product.quantity_format?.type);
    };

    const handleUpdateCartDecrement = () => {
        if (!product || !inCartItem) return;
        if (inCartItem.quantity === minQty) {
            handleRemoveFromCart(productId);
        } else {
            changeItemQuantityInCart(productId, "decrement", product.quantity_format?.type);
        }
    };
    
    const calculatePrice = (priceType, quantity) => {
        if (!product) return 0;
        const basePrice = product[priceType];
        
        const isWeightBased = product.quantity_format?.type === 'weight';
        
        if (isWeightBased) {
            return (basePrice / 1000) * quantity;
        } else {
            return basePrice * quantity;
        }
    };
    
    const getQuantityLabel = (currentQty) => {
        if (!product) return '';
        const { type, qty } = product.quantity_format || {};
        const baseQty = Number(qty) || 0;
    
        if (type === 'weight') {
            if (baseQty > 0) {
                const lowRange = currentQty - baseQty;
                return `Expected Quantity: ${lowRange}-${currentQty}g`;
            } else {
                return 'Expected quantity';
            }
        } else if (type === 'unit') {
            return baseQty > 1 ? `${baseQty} pieces per unit` : 'Per piece';
        }
        return '';
    };

    if (!product) {
        return (
            <div className="flex items-center justify-center h-screen text-lg text-gray-600">
                Loading product details...
            </div>
        );
    }
    
    const currentSelectedQty = inCartItem ? inCartItem.quantity : selectedQty;
    const discountedPrice = calculatePrice("discounted_price", currentSelectedQty);
    const actualPrice = calculatePrice("actual_price", currentSelectedQty);
    const discountPercentage = calculateDiscountPercentage();

    const unitLabel = product.quantity_format?.type === 'unit' ? 'piece' : 'g';
    const footerQty = `${currentSelectedQty} ${unitLabel}${((currentSelectedQty > 1) && (unitLabel === 'piece')) ? "s" : ""}`;
    const quantitySelectorUnitLabel = product.quantity_format?.type === 'unit' ? '' : 'g';

    return (
        <div className="bg-white min-h-screen pb-20 font-sans antialiased text-gray-800">
            <header className="sticky top-0 z-50 flex items-center p-4 bg-white shadow-sm border-b border-gray-200">
                <button onClick={handleBackClick} className="p-2 -ml-2 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <span className="flex-grow text-center text-lg font-bold text-gray-900">Rythuri</span>
                <div className="w-10"></div>
            </header>

            <main className="relative">
                <div className="w-full h-80 overflow-hidden bg-gray-100">
                    <img
                        src={product.images?.[1] || '/fallback.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="relative bg-white p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h1 className="text-xl font-extrabold text-gray-900 leading-tight mb-1 sm:mb-0">
                            {product.name}
                        </h1>
                    </div>
                    <p className="text-gray-500 mb-4 font-medium text-sm">{product.brand}</p>

                    <div className="flex items-baseline gap-3 mb-4">
                        <span className="text-2xl font-extrabold text-green-700">₹{discountedPrice.toFixed(2)}</span>
                        <span className="text-md text-gray-400 line-through">₹{actualPrice.toFixed(2)}</span>
                        {discountPercentage > 0 && (
                            <span className="text-sm font-semibold text-white bg-green-500 px-2 py-1 rounded-full">
                                {discountPercentage}% OFF
                            </span>
                        )}
                    </div>

                    <div className="mb-4">
                        <h5 className="text-xs font-semibold text-gray-600 mb-1">Select quantity</h5>
                        <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl">
                            <span className="text-sm font-medium text-gray-700">
                                {getQuantityLabel(currentSelectedQty)}
                            </span>
                            <QuantitySelector
                                quantity={currentSelectedQty}
                                onIncrement={handleCustomIncrement}
                                onDecrement={handleCustomDecrement}
                                unitLabel={quantitySelectorUnitLabel}
                                isCustomSelector={true}
                                minQty={minQty}
                            />
                        </div>
                    </div>
                    
                    {inCartItem && selectedQty !== inCartItem.quantity && (
                        <div className="my-4">
                            <button onClick={handleAddToCartClick} className="w-full py-2.5 bg-green-500 text-white text-sm font-bold rounded-xl shadow-lg hover:bg-green-600 transition-colors">
                                Update Cart
                            </button>
                        </div>
                    )}

                    <div className="py-4 border-y border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Why Buy from Rythuri?</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4"><FreshnessImage /><div><h4 className="text-sm font-semibold text-gray-800">Sourced Fresh Daily</h4><p className="text-sm text-gray-600">We bring you the freshest produce by sourcing directly from farmers every single day.</p></div></div>
                            <div className="flex items-start gap-4"><NatureImage /><div><h4 className="text-sm font-semibold text-gray-800">Naturally Imperfect, Perfectly Fresh</h4><p className="text-sm text-gray-600">Just like nature intended, our fruits and vegetables may not always be perfectly shaped. This is a sign of their natural, non-commercial origin.</p></div></div>
                            <div className="flex items-start gap-4"><HygieneImage /><div><h4 className="text-sm font-semibold text-gray-800">High Hygiene & Packaging Standards</h4><p className="text-sm text-gray-600">Every item is carefully handled, packed, and stored under strict hygiene protocols to ensure it reaches you in the best condition.</p></div></div>
                            <div className="flex items-start gap-4"><LowPesticideImage /><div><h4 className="text-sm font-semibold text-gray-800">Low Pesticide Preference</h4><p className="text-sm text-gray-600">We actively seek out and partner with farmers who use minimal pesticides, providing you with a safer and healthier choice.</p></div></div>
                            <div className="flex items-start gap-4"><GuaranteeImage /><div><h4 className="text-sm font-semibold text-gray-800">99% Freshness Guarantee</h4><p className="text-sm text-gray-600">We guarantee that 99% of the products you receive will be fresh and of high quality. We're committed to delivering excellence.</p></div></div>
                            <div className="flex items-start gap-4"><ReturnImage /><div><h4 className="text-sm font-semibold text-gray-800">Return & Refund Policy</h4><p className="text-sm text-gray-600">We have a strict no-return policy for fresh produce. However, if you receive a damaged item, please contact us with a photo within 1 hour of delivery. We will verify the issue and can issue a refund if applicable.</p></div></div>
                        </div>
                    </div>

                    {showGoToHomepageButton && (
                        <div className="mt-4">
                            <button onClick={handleGoToHomepageClick} className="w-full py-2.5 text-green-600 text-sm font-bold border-2 border-green-600 rounded-xl hover:bg-green-50 transition-colors">
                                Go to Homepage
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-2xl z-50">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">{footerQty}</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-gray-900">₹{discountedPrice.toFixed(2)}</span>
                            <span className="text-xs text-gray-400 line-through">₹{actualPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {inCartItem ? (
                        <QuantitySelector
                            quantity={inCartItem.quantity}
                            onIncrement={handleUpdateCartIncrement}
                            onDecrement={handleUpdateCartDecrement}
                            unitLabel={quantitySelectorUnitLabel}
                            minQty={minQty}
                        />
                    ) : (
                        <button onClick={handleAddToCartClick} className="py-2.5 px-6 bg-green-600 text-white font-bold rounded-xl shadow-lg hover:bg-green-700 transition-colors text-sm">
                            Add to Cart
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default ProductDetail;
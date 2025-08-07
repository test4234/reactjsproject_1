import React from 'react';
// import './CartSkeleton.css'; // Remove this line!

const CartSkeleton = React.memo(() => (
    <div className="p-5 bg-gray-50 rounded-lg shadow-sm min-h-[80vh] box-border">
        {/* Header Skeleton */}
        <div className="h-10 w-3/5 mx-auto mb-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>

        {/* Address Skeleton */}
        <div className="h-15 w-full mt-4 mb-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>

        {/* Delivery Heading Skeleton */}
        <div className="h-[30px] w-4/5 mb-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>

        {/* Item Skeletons (repeated) */}
        {[...Array(2)].map((_, index) => (
            <div key={index} className="flex items-center p-3 mb-4 bg-white rounded-lg shadow-sm">
                <div className="w-[70px] h-[70px] rounded-lg mr-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
                <div className="flex-grow flex flex-col gap-2">
                    <div className="h-4 w-7/10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>
                    <div className="h-4 w-9/10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>
                </div>
            </div>
        ))}

        {/* Bill Details Skeleton */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-lg flex flex-col gap-3 mt-7">
            <div className="h-5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>
            <div className="h-5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>
            <div className="h-5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>
            <div className="h-5 w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse rounded-md"></div>
        </div>

        {/* Footer Skeleton */}
        <div className="h-20 w-full fixed bottom-0 left-0 border-t border-gray-200 shadow-[0_-1px_6px_rgba(0,0,0,0.05)] bg-white"></div>
    </div>
));

export default CartSkeleton;
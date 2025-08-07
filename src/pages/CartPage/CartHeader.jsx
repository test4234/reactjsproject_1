import React from 'react';

const CartHeader = () => {
    return (
        <header className="w-full shadow-md bg-white overflow-hidden flex flex-col sticky top-0 z-50">
            <div className="flex items-center py-3 px-4 min-h-[56px] relative">
                <button
                    aria-label="Go back"
                    onClick={() => window.history.back()}
                    className="bg-none border-none cursor-pointer p-0 flex items-center justify-center mr-3 flex-shrink-0 absolute left-4 top-1/2 -translate-y-1/2"
                >
                    <svg
                        fill="none"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-[22px] w-[22px] text-black stroke-black stroke-[2.5]"
                    >
                        <path d="M15.5 19L8.5 12L15.5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
                <div className="flex-grow flex justify-center items-center">
                    <p className="text-lg font-semibold text-[#262a33] whitespace-nowrap overflow-hidden text-ellipsis">Your Cart</p>
                </div>
            </div>
        </header>
    );
};

export default CartHeader;
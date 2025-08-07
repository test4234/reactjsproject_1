import React from 'react';
import { useNavigate } from 'react-router-dom';

const ActiveOrdersFloatButton = ({ count }) => {
    const navigate = useNavigate();

    return (
        <div
            className="
                fixed bottom-[90px] right-[25px]
                w-[80px] h-[80px] rounded-full
                bg-gradient-to-br from-[#4CAF50] to-[#8BC34A] /* Green gradient */
                text-white
                flex flex-col items-center justify-center text-center
                shadow-[0_6px_15px_rgba(0,0,0,0.2),_0_0_0_0px_rgba(76,175,80,0.4)]
                z-[1000] cursor-pointer
                transition-all duration-300 ease-in-out
                hover:translate-y-[-5px] hover:scale-105
                hover:shadow-[0_10px_25px_rgba(0,0,0,0.3),_0_0_0_10px_rgba(76,175,80,0.5)]

                /* Responsive adjustments for screens <= 768px */
                md:w-[70px] md:h-[70px]
                md:bottom-[80px] md:right-[15px]
                md:shadow-[0_4px_10px_rgba(0,0,0,0.2),_0_0_0_0px_rgba(76,175,80,0.3)]
                md:hover:translate-y-[-3px] md:hover:scale-103
                md:hover:shadow-[0_6px_15px_rgba(0,0,0,0.25),_0_0_0_8px_rgba(76,175,80,0.4)]
            "
            onClick={() => navigate("/ordershistory")}
            title="View your active orders"
        >
            <span
                className="
                    text-[0.9rem] font-semibold leading-[1.2]
                    px-[5px]
                    text-shadow-[0_1px_2px_rgba(0,0,0,0.3)]
                    whitespace-normal break-words
                    md:text-[0.8rem]
                "
            >
                Active Orders
            </span>
            {count > 0 && (
                <span
                    className="
                        absolute top-0 right-0
                        bg-[#FFC107] /* Amber */
                        text-[#333]
                        text-[0.9rem] font-bold
                        min-w-[28px] h-[28px] rounded-full
                        flex items-center justify-center
                        p-[2px]
                        border-2 border-white
                        shadow-[0_2px_5px_rgba(0,0,0,0.2)]
                        transform translate-x-1/2 -translate-y-1/2
                        animate-bounce-custom /* Custom animation */

                        /* Responsive adjustments for screens <= 768px */
                        md:text-[0.8rem]
                        md:min-w-[22px] md:h-[22px]
                        md:transform md:translate-x-[10%] md:-translate-y-[10%]
                    "
                >
                    {count}
                </span>
            )}
        </div>
    );
};

export default ActiveOrdersFloatButton;
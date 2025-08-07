import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';
// No need to import './LocationSelectionModal.css' anymore

const LocationSelectionModal = ({ show, onContinue, onSelectLocation }) => {
    if (!show) {
        return null; // Don't render anything if the modal is not shown
    }

    return (
        <>
            {/* Custom keyframes for the modal entry animation */}
            <style>
                {`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fadeInScale {
                    animation: fadeInScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
                }
                `}
            </style>

            <div
                className="
                    fixed inset-0 /* top: 0; left: 0; right: 0; bottom: 0; */
                    bg-black bg-opacity-75 /* background-color: rgba(0, 0, 0, 0.75); */
                    flex justify-center items-center /* display: flex; justify-content: center; align-items: center; */
                    z-[1000] /* z-index: 1000; */
                    backdrop-blur-md /* backdrop-filter: blur(8px); (Tailwind equivalent for '8px' blur) */
                "
                aria-modal="true"
                role="dialog"
            >
                <div
                    className="
                        bg-[#f7f7f7] /* background-color: #f7f7f7; */
                        p-[30px] px-[40px] /* padding: 30px 40px; */
                        rounded-[18px] /* border-radius: 18px; */
                        shadow-[0_15px_40px_rgba(0,0,0,0.35)] /* box-shadow */
                        w-[90%] max-w-[400px] /* width, max-width */
                        text-center /* text-align */
                        opacity-0 /* opacity: 0; (starting point for animation) */
                        animate-fadeInScale /* animation: fadeInScale... */
                        flex flex-col gap-[25px] /* display: flex; flex-direction: column; gap: 25px; */
                        border border-[rgba(255,255,255,0.3)] /* border: 1px solid rgba(255, 255, 255, 0.3); */
                        /* Responsive adjustments for very small screens */
                        max-md:p-[20px] max-md:px-[25px] /* @media (max-width: 380px) */
                    "
                >
                    <h3
                        className="
                            text-[#2c3e50] /* color: #2c3e50; */
                            text-[2.1em] /* font-size: 2.1em; */
                            mb-[8px] /* margin-bottom: 8px; */
                            font-bold /* font-weight: 700; */
                            tracking-tight /* letter-spacing: -0.02em; */
                            flex items-center justify-center /* To center icon and text together */
                            /* Responsive adjustments for very small screens */
                            max-md:text-[1.9em] /* @media (max-width: 380px) */
                        "
                    >
                        <FaMapMarkerAlt
                            className="
                                mr-[8px] /* margin-right: 8px; */
                                text-[#3498db] /* color: #3498db; */
                                text-[1.5rem] /* font-size: 1.5rem; */
                                flex-shrink-0 /* Prevent icon from shrinking on small screens */
                            "
                        />
                        Confirm Your Location
                    </h3>
                    <p
                        className="
                            text-[#616161] /* color: #616161; */
                            text-[1.05em] /* font-size: 1.05em; */
                            leading-relaxed /* line-height: 1.6; (Tailwind equivalent) */
                            mb-[20px] /* margin-bottom: 20px; */
                            /* Responsive adjustments for very small screens */
                            max-md:text-[0.9em] /* @media (max-width: 380px) */
                        "
                    >
                        To provide you with the best products and offers, please select your location.
                        If you're happy with the default location, you can continue without selecting.
                    </p>
                    <div
                        className="
                            flex flex-col gap-[15px] /* display: flex; flex-direction: column; gap: 15px; */
                            md:flex-row md:justify-center /* @media (min-width: 480px) flex-direction: row; justify-content: center; */
                        "
                    >
                        <button
                            className="
                                p-[14px] px-[28px] /* padding: 14px 28px; */
                                border-none rounded-[10px] /* border: none; border-radius: 10px; */
                                text-[1.05em] font-semibold /* font-size: 1.05em; font-weight: 600; */
                                cursor-pointer w-full /* cursor: pointer; width: 100%; */
                                tracking-wide /* letter-spacing: 0.02em; (Tailwind equivalent) */
                                transition-all duration-300 ease-in-out /* transition: background-color 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease; (Tailwind equivalent) */
                                bg-[#007bff] text-white /* background-color: #007bff; color: white; (secondary styles) */
                                shadow-[0_3px_10px_rgba(0,123,255,0.2)] /* box-shadow */
                                hover:bg-[#0056b3] hover:-translate-y-[3px] hover:shadow-[0_6px_15px_rgba(0,123,255,0.3)] /* hover effects */
                                md:w-auto md:min-w-[160px] md:flex-grow /* @media (min-width: 480px) width: auto; min-width: 160px; flex-grow: 1; */
                            "
                            onClick={onContinue}
                        >
                            Continue with Default Location
                        </button>
                        <button
                            className="
                                p-[14px] px-[28px] /* padding: 14px 28px; */
                                border-none rounded-[10px] /* border: none; border-radius: 10px; */
                                text-[1.05em] font-semibold /* font-size: 1.05em; font-weight: 600; */
                                cursor-pointer w-full /* cursor: pointer; width: 100%; */
                                tracking-wide /* letter-spacing: 0.02em; (Tailwind equivalent) */
                                transition-all duration-300 ease-in-out /* transition: background-color 0.3s ease, transform 0.15s ease, box-shadow 0.2s ease; (Tailwind equivalent) */
                                bg-[#4CAF50] text-white /* background-color: #4CAF50; color: white; (primary styles) */
                                shadow-[0_5px_15px_rgba(76,175,80,0.4)] /* box-shadow */
                                hover:bg-[#43A047] hover:-translate-y-[3px] hover:shadow-[0_8px_20px_rgba(76,175,80,0.5)] /* hover effects */
                                md:w-auto md:min-w-[160px] md:flex-grow /* @media (min-width: 480px) width: auto; min-width: 160px; flex-grow: 1; */
                            "
                            onClick={onSelectLocation}
                        >
                            Select Your Location
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LocationSelectionModal;
import React, { useEffect } from 'react';

const Addressselectormodal = ({ isOpen, onClose, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            <style>
                {`
                body.modal-open {
                    overflow: hidden;
                }
                `}
            </style>

            <div
                className="
                    fixed inset-0 
                    flex justify-center items-end 
                    z-[1000]
                    backdrop-blur-md

                    transition-all duration-300 ease-in-out
                    lg:items-center
                "
                onClick={onClose}
                aria-modal="true"
                role="dialog"
            >
                <button
                    className="
                        absolute
                        bottom-[calc(80vh_+_50px)]
                        left-1/2
                        -translate-x-1/2
                        bg-[rgba(255,255,255,0.9)]
                        border-none rounded-full
                        w-[40px] h-[40px]
                        flex justify-center items-center
                        text-[1.8rem]
                        cursor-pointer text-[#333]
                        shadow-[0_4px_12px_rgba(0,0,0,0.2)]
                        transition-all duration-200 ease-in-out
                        z-[1010]
                        hover:bg-white
                        hover:scale-108 hover:shadow-[0_6px_16px_rgba(0,0,0,0.25)]
                        lg:bottom-auto lg:top-[20px]
                    "
                    onClick={onClose}
                    aria-label="Close modal"
                >
                    &times;
                </button>

                <div
                    className="
                        bg-white
                        rounded-[16px]
                        shadow-[0_-8px_20px_rgba(0,0,0,0.15)]
                        relative
                        w-[90%] max-w-[500px]
                        flex flex-col
                        mb-[20px]
                        transform translate-y-0
                        transition-transform duration-300 ease-out

                        max-lg:w-full
                        max-lg:h-[80vh]
                        max-lg:rounded-t-[16px] max-lg:rounded-b-none
                        max-lg:pb-[env(safe-area-inset-bottom)]
                        max-lg:overflow-y-hidden

                        lg:mb-0
                    "
                    onClick={e => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </>
    );
};

export default Addressselectormodal;

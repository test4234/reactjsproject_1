import React, { useState, useEffect } from 'react';
import LeafyIcon from '../../assets/Leafy.svg';
import FruityIcon from '../../assets/Fruity.svg';
import TuberIcon from '../../assets/Tuber.svg';
import FlowerIcon from '../../assets/Flower.svg';
import SpicyIcon from '../../assets/Spicy.svg';
import ChiliIcon from '../../assets/Chili.svg';
import './PageSkeleton.css';

const ICONS = [LeafyIcon, FruityIcon, TuberIcon, FlowerIcon, SpicyIcon, ChiliIcon];
const ICON_CHANGE_INTERVAL = 500; // milliseconds

const PageSkeleton = () => {
    const [currentIconIndex, setCurrentIconIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIconIndex((prevIndex) => (prevIndex + 1) % ICONS.length);
        }, ICON_CHANGE_INTERVAL);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="page-skeleton-container">
            <img
                src={ICONS[currentIconIndex]}
                alt="Loading icon, cycling through vegetables"
                className="loading-icon"
                key={currentIconIndex} // Key prop to force re-render and restart CSS animation
            />
            <div className="loading-message-text">
                Farm Fresh Vegetables
            </div>
        </div>
    );
};

export default PageSkeleton;
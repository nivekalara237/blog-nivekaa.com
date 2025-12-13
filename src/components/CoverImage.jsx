import React, { useState, useEffect, useRef } from 'react';

/**
 * CoverImage - Component for article cover with elegant error handling
 * Displays gradient fallback when image fails to load
 */
export default function CoverImage({ cover, title, category }) {
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);

    // Check image validity on mount (handles cached broken images)
    useEffect(() => {
        if (!cover) {
            setImageError(true);
            return;
        }

        const img = imgRef.current;
        if (img && img.complete) {
            // Image already loaded (from cache)
            if (img.naturalHeight === 0) {
                // Image failed to load
                setImageError(true);
            }
        }
    }, [cover]);

    const handleImageError = (e) => {
        setImageError(true);
    };

    const showGradient = !cover || imageError;

    if (showGradient) {
        // Gradient fallback
        return (
            <div className="mb-6 rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 h-64 md:h-80 flex items-center justify-center relative">
                {/* Decorative circles */}
                <div className="absolute top-8 right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-8 left-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

                <div className="text-center text-white p-8 relative z-10">
                    <div className="text-sm font-semibold uppercase tracking-wider mb-2 opacity-90">
                        {category}
                    </div>
                    <div className="text-3xl md:text-4xl font-bold">
                        {title}
                    </div>
                </div>
            </div>
        );
    }

    // Image loaded successfully
    return (
        <div className="mb-6 rounded-2xl overflow-hidden shadow-lg">
            <img
                ref={imgRef}
                src={cover}
                alt={title}
                className="w-full h-64 md:h-80 object-cover"
                onError={handleImageError}
                loading="eager"
            />
        </div>
    );
}

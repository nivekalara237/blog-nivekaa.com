import React, { useState, useEffect, useRef } from 'react';

/**
 * CoverImage - Article cover image.
 * Only rendered when the API actually returned a cover URL. If that URL
 * fails to load (error, 404...), nothing is shown — no category SVG
 * fallback on the article page (that fallback is only used on cards).
 */
export default function CoverImage({ cover, title }) {
    const [imageError, setImageError] = useState(false);
    const imgRef = useRef(null);

    // Check image validity on mount (handles cached broken images)
    useEffect(() => {
        if (!cover) return;

        const img = imgRef.current;
        if (img && img.complete && img.naturalHeight === 0) {
            setImageError(true);
        }
    }, [cover]);

    if (!cover || imageError) {
        return null;
    }

    return (
        <div className="mb-8 pixel-box overflow-hidden h-64 md:h-[400px]">
            <img
                ref={imgRef}
                src={cover}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                loading="eager"
            />
        </div>
    );
}

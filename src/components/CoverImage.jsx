import React, { useState, useEffect, useRef } from 'react';

/**
 * CoverImage - Component for article cover with elegant error handling
 * Displays gradient fallback when image fails to load
 */
export default function CoverImage({ cover, title, category, slug }) {
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

    const getCategorySvg = (cat) => {
        if (!cat) return 'default';
        const clean = cat.toLowerCase().replace(/[^a-z0-9/]/g, '');
        if (clean.includes('cloud') || clean.includes('aws')) return 'cloud';
        if (clean.includes('terraform') || clean.includes('iac')) return 'terraform';
        if (clean.includes('docker')) return 'docker';
        if (clean.includes('kubernetes') || clean.includes('k8s')) return 'kubernetes';
        if (clean.includes('cicd') || clean.includes('devops')) return 'cicd';
        if (clean.includes('backend') || clean.includes('java')) return 'backend';
        if (clean.includes('securite') || clean.includes('security')) return 'securite';
        if (clean.includes('frontend') || clean.includes('react')) return 'frontend';
        if (clean.includes('linux')) return 'linux';
        return 'default';
    };

    if (showGradient) {
        // Fallback: render generated SVG
        return (
            <div className="mb-8 pixel-box overflow-hidden h-64 md:h-[400px]">
                <img
                    src={`/api/cover/${slug}.svg`}
                    alt={`Default ${category || 'Article'} cover`}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    // Image loaded successfully
    return (
        <div className="mb-8 pixel-box overflow-hidden h-64 md:h-[400px]">
            <img
                ref={imgRef}
                src={cover}
                alt={title}
                className="w-full h-full object-cover"
                onError={handleImageError}
                loading="eager"
            />
        </div>
    );
}

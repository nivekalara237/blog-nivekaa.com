/**
 * Maps Kinde user data to our custom Author model.
 * @param {Object} kindeUser - The user object from useKindeAuth()
 * @returns {Object}
 */
export function mapKindeUserToAuthor(kindeUser) {
    if (!kindeUser) return null;

    // Kinde user object usually has given_name, family_name, and picture
    // Custom properties might be in a separate properties object if fetched via Management API
    const properties = kindeUser.properties || {};

    // Helper to get value from either top-level or nested properties
    // Handles given_name/first_name and family_name/last_name variations
    const getVal = (key, fallback = "") => {
        if (key === "given_name" || key === "first_name") {
            return kindeUser.given_name || kindeUser.first_name || properties.given_name || properties.first_name || fallback;
        }
        if (key === "family_name" || key === "last_name") {
            return kindeUser.family_name || kindeUser.last_name || properties.family_name || properties.last_name || fallback;
        }
        return kindeUser[key] || properties[key] || fallback;
    };

    return {
        first_name: getVal("first_name"),
        last_name: getVal("last_name"),
        name: `${getVal("first_name")} ${getVal("last_name")}`.trim() || kindeUser.preferred_email || kindeUser.email || "Anonyme",
        avatar: getVal("custom_picture_url") || kindeUser.picture,
        role: getVal("role", "writer"),
        bio: getVal("bio"),
        hideName: getVal("hidename") === 'true' || getVal("hidename") === true,
        jobPositions: (getVal("kp_usr_job_title", "")).split(',').map(s => s.trim()).filter(Boolean),
        medias: (() => {
            try {
                const m = getVal("medias");
                return m ? JSON.parse(m) : [];
            } catch (e) {
                console.warn("Failed to parse medias", e);
                return [];
            }
        })()
    };
}

// For backward compatibility or if we still need the name
export function mapClerkUserToAuthor(user) {
    return mapKindeUserToAuthor(user);
}

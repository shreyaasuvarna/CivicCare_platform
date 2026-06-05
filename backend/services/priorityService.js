

const criticalKeywords = [
    "fire", "accident", "gas leak", "explosion",
    "landslide", "collapse", "death", "electric shock",
    "emergency", "flood",
    "electric shock", "danger",
    "immediate action", "crucial", "vital", "fast", "ASAP",
     "explosion", "earthquake","structural collapse","wildfire"
];

const mediumKeywords = [
    "water leakage", "pipe burst", "sewage", "power cut",
    "street light","pot holes","broken"
];

function calculatePriority(complaint) {
    let score = 0;

    const text = (complaint.title + " " + complaint.description).toLowerCase();

    let isCritical = false;
    let isMedium = false;

    // CRITICAL
    criticalKeywords.forEach(word => {
        if (text.includes(word)) {
            isCritical = true;
        }
    });

    // MEDIUM
    mediumKeywords.forEach(word => {
        if (text.includes(word)) {
            isMedium = true;
        }
    });

    // CRITICAL LOGIC
    if (isCritical) {
        score += 200; 
    }

    // MEDIUM LOGIC
    else if (isMedium) {
        score += 50;

        // support 
        score += (complaint.supportCount || 0) * 10;
    }

    // NORMAL LOGIC
    else {
        // support is main factor
        score += (complaint.supportCount || 0) * 15;
    }

    // TIME FACTOR 
    const hoursOld = (Date.now() - new Date(complaint.createdAt)) / (1000 * 60 * 60);
    score += Math.min(hoursOld, 24);

    // return score;
    return {
    score,
    isCritical
};

}

module.exports = { calculatePriority };

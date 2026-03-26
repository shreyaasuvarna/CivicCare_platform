// const urgentKeywords = [
//     "fire", "accident", "emergency", "death", "flood",
//     "electric shock", "collapse", "gas leak", "danger",
//     "immediate action", "crucial", "vital", "fast", "ASAP",
//      "explosion", "earthquake","structural collapse","wildfire"
// ];

// function calculatePriority(complaint) {
//     let score = 0;

//     const text = (complaint.title + " " + complaint.description).toLowerCase();

//     // Keyword-based scoring
//     urgentKeywords.forEach(word => {
//         if (text.includes(word)) {
//             score += 30;
//         }
//     });

//     // Support-based scoring
//     score += (complaint.supportCount || 0) * 5;

//     // Time-based scoring
//     const hoursOld = (Date.now() - new Date(complaint.createdAt)) / (1000 * 60 * 60);
//     score += Math.min(hoursOld, 24);

//     return score;
// }

// module.exports = { calculatePriority };

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

    // 🚨 CRITICAL
    criticalKeywords.forEach(word => {
        if (text.includes(word)) {
            isCritical = true;
        }
    });

    // ⚠️ MEDIUM
    mediumKeywords.forEach(word => {
        if (text.includes(word)) {
            isMedium = true;
        }
    });

    // 🚨 CRITICAL LOGIC
    if (isCritical) {
        score += 200; // 🔥 dominates everything
    }

    // ⚠️ MEDIUM LOGIC
    else if (isMedium) {
        score += 50;

        // 👍 support matters more here
        score += (complaint.supportCount || 0) * 10;
    }

    // 🟢 NORMAL LOGIC
    else {
        // 👍 support is main factor
        score += (complaint.supportCount || 0) * 15;
    }

    // ⏱ TIME FACTOR (common for all)
    const hoursOld = (Date.now() - new Date(complaint.createdAt)) / (1000 * 60 * 60);
    score += Math.min(hoursOld, 24);

    // return score;
    return {
    score,
    isCritical
};

}

module.exports = { calculatePriority };

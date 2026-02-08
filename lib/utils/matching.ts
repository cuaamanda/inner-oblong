export interface MemberProfile {
    user_id: string;
    name: string;
    industry: string | null;
    expertise_areas: string[];
    looking_for: string | null;
    tier: 'basic' | 'prestige';
}

export interface MatchResult {
    memberA: MemberProfile;
    memberB: MemberProfile;
    score: number;
    reasoning: string[];
}

/**
 * Calculates a match score between two members.
 * Higher scores indicate better matches.
 */
export function calculateMatchScore(
    a: MemberProfile,
    b: MemberProfile,
    previousMatches: Set<string>
): MatchResult | null {
    // Never match a member with themselves
    if (a.user_id === b.user_id) return null;

    // Never suggest a pair that has already been introduced
    const matchKey = [a.user_id, b.user_id].sort().join(':');
    if (previousMatches.has(matchKey)) return null;

    let score = 0;
    const reasoning: string[] = [];

    // 1. Complementary Expertise (Highest weight: 40 points)
    // Check if A's expertise matches what B is looking for
    const aExpertiseInBLookingFor = a.expertise_areas.some(exp =>
        b.looking_for?.toLowerCase().includes(exp.toLowerCase())
    );
    if (aExpertiseInBLookingFor) {
        score += 40;
        reasoning.push(`${a.name} has expertise in areas ${b.name} is looking for.`);
    }

    // Check if B's expertise matches what A is looking for
    const bExpertiseInALookingFor = b.expertise_areas.some(exp =>
        a.looking_for?.toLowerCase().includes(exp.toLowerCase())
    );
    if (bExpertiseInALookingFor) {
        score += 40;
        reasoning.push(`${b.name} has expertise in areas ${a.name} is looking for.`);
    }

    // 2. Industry Alignment (20 points)
    if (a.industry && b.industry && a.industry.toLowerCase() === b.industry.toLowerCase()) {
        score += 20;
        reasoning.push(`Both are in the ${a.industry} industry.`);
    }

    // 3. Prestige Priority (Up to 20 points)
    if (a.tier === 'prestige' && b.tier === 'prestige') {
        score += 20;
        reasoning.push("Both are Prestige members.");
    } else if (a.tier === 'prestige' || b.tier === 'prestige') {
        score += 10;
        const prestigeMember = a.tier === 'prestige' ? a.name : b.name;
        reasoning.push(`Includes Prestige member ${prestigeMember}.`);
    }

    // If no specific reasoning was found, they might just be a standard match
    if (reasoning.length === 0) {
        score = 5; // Base score for "just because" matches if needed
        reasoning.push("Potential networking match based on general profiles.");
    }

    return {
        memberA: a,
        memberB: b,
        score,
        reasoning
    };
}

/**
 * Generates all possible unique pairs and ranks them.
 */
export function generateRankedSuggestions(
    members: MemberProfile[],
    previousMatches: Set<string>
): MatchResult[] {
    const results: MatchResult[] = [];

    for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
            const match = calculateMatchScore(members[i], members[j], previousMatches);
            if (match) {
                results.push(match);
            }
        }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
}

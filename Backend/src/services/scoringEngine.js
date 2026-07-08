// Kompon — Scoring Engine (§6.1.1, §6.1.2, §6.1.3)
// Rule-based structural vulnerability, crack evidence derivation,
// weighted score combination with proportional redistribution,
// and the non-negotiable escalation override.

// ─── Tier thresholds ───
const TIER_THRESHOLDS = [
  { max: 20, label: "Very Low" },
  { max: 40, label: "Low" },
  { max: 60, label: "Moderate" },
  { max: 80, label: "High" },
  { max: 100, label: "Very High" },
];

/**
 * Convert a numeric score (0–100) to a tier label.
 */
export function scoreToTier(score) {
  for (const { max, label } of TIER_THRESHOLDS) {
    if (score <= max) return label;
  }
  return "Very High";
}

// ─── §6.1.1 — Structural Vulnerability (FEMA P-154-lite) ───

const BUILDING_AGE_POINTS = {
  "<10y": 0,
  "10-30y": 15,
  ">30y": 30,
  unknown: 15,
};

const STORIES_POINTS = {
  "1-2": 5,
  "3-5": 15,
  "6+": 25,
};

const SOFT_STORY_POINTS = {
  yes: 25,
  no: 0,
  unsure: 10,
};

const MATERIAL_POINTS = {
  "rc_frame": 5,
  "load_bearing_masonry": 20,
  "informal_other": 30,
};

const SETTLEMENT_POINTS = {
  yes: 20,
  no: 0,
  unsure: 8,
};

const PRIOR_DAMAGE_POINTS = {
  yes: 15,
  no: 0,
  unsure: 5,
};

const CRACK_LOCATION_POINTS = {
  "column_beam_joint": 30,
  "load_bearing_wall": 20,
  "plaster_partition": 5,
  unsure: 15,
};

/**
 * Compute StructuralVulnerability score from questionnaire answers.
 * Sum of points, clipped to [0, 100].
 *
 * @param {Object} q — questionnaire fields
 * @returns {number} score 0–100
 */
export function computeStructuralVulnerability(q) {
  let score = 0;

  score += BUILDING_AGE_POINTS[q.building_age] ?? 15; // default to "unknown"
  score += STORIES_POINTS[q.stories] ?? 5;
  score += SOFT_STORY_POINTS[q.soft_story] ?? 10;
  score += MATERIAL_POINTS[q.structural_material] ?? 20;
  score += SETTLEMENT_POINTS[q.foundation_settlement] ?? 8;
  score += PRIOR_DAMAGE_POINTS[q.prior_damage] ?? 5;
  score += CRACK_LOCATION_POINTS[q.crack_location] ?? 15;

  return Math.max(0, Math.min(100, score));
}

// ─── §6.1.2 — CrackEvidence derivation ───

const SEVERITY_TIER_BASE = {
  "Very Low": 10,
  Low: 25,
  Moderate: 50,
  High: 75,
  "Very High": 95,
};

const SEVERITY_TIER_RANK = {
  "Very Low": 0,
  Low: 1,
  Moderate: 2,
  High: 3,
  "Very High": 4,
};

const RANK_TO_SEVERITY_TIER = ["Very Low", "Low", "Moderate", "High", "Very High"];

function normalizeSeverityTier(value) {
  const token = String(value ?? "").trim().toLowerCase().replace(/\s+/g, "_");
  if (token === "very_low") return "Very Low";
  if (token === "low") return "Low";
  if (token === "moderate") return "Moderate";
  if (token === "high") return "High";
  if (token === "very_high") return "Very High";
  return null;
}

function readCoveragePct(detection) {
  if (detection?.coverage_pct !== undefined) {
    const pct = Number(detection.coverage_pct);
    return Number.isFinite(pct) && pct > 0 ? pct : 0;
  }

  const raw = Number(detection?.coverage ?? 0);
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  return raw <= 1 ? raw * 100 : raw;
}

function normalizeDetectionClass(detection) {
  return String(detection?.class ?? detection?.label ?? detection?.name ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

function readConfidence(detection) {
  const raw = Number(detection?.confidence ?? detection?.conf ?? detection?.score ?? 0);
  return Number.isFinite(raw) && raw > 0 ? raw : 0;
}

function maxTier(a, b) {
  return (SEVERITY_TIER_RANK[a] ?? 0) >= (SEVERITY_TIER_RANK[b] ?? 0) ? a : b;
}

function tierForDetection(detection) {
  const cls = normalizeDetectionClass(detection);
  const confidence = readConfidence(detection);
  const coverage = readCoveragePct(detection);

  if (cls === "rebar_corrosion" || cls === "severe_distress" || cls === "crushing") {
    return "Very High";
  }

  if (cls === "spalling") {
    if (coverage >= 15) return "Very High";
    if (coverage >= 5 || confidence >= 0.75) return "High";
    return "Moderate";
  }

  if (cls === "structural_crack") {
    if (coverage >= 10) return "Very High";
    if (coverage >= 2 || (coverage >= 0.5 && confidence >= 0.75)) return "High";
    if (coverage >= 0.15 || confidence >= 0.5) return "Moderate";
    return "Low";
  }

  if (cls === "microcrack" || cls === "non_structural_crack" || cls === "hairline_crack") {
    if (coverage >= 5 && confidence >= 0.65) return "Moderate";
    return "Low";
  }

  if (/rebar|exposed|corrosion|severe|crushing/.test(cls)) return "Very High";
  if (/spall/.test(cls)) return coverage >= 5 ? "High" : "Moderate";
  if (/crack|fracture/.test(cls)) {
    if (coverage >= 2 || confidence >= 0.75) return "High";
    return "Moderate";
  }

  return null;
}

export function deriveEffectiveCrackSeverity(crackAnalysis) {
  const reportedTier = normalizeSeverityTier(crackAnalysis?.severity_tier ?? crackAnalysis?.concern);
  const detections = Array.isArray(crackAnalysis?.detections)
    ? crackAnalysis.detections
    : [];

  if (detections.length === 0) return reportedTier;

  let effectiveTier = "Very Low";
  let sawKnownDamage = false;

  for (const detection of detections) {
    const tier = tierForDetection(detection);
    if (!tier) continue;
    sawKnownDamage = true;
    effectiveTier = maxTier(effectiveTier, tier);
  }

  if (!sawKnownDamage) return reportedTier;
  if (!reportedTier) return effectiveTier;

  const reportedRank = SEVERITY_TIER_RANK[reportedTier] ?? 0;
  const effectiveRank = SEVERITY_TIER_RANK[effectiveTier] ?? 0;
  return RANK_TO_SEVERITY_TIER[Math.min(reportedRank, effectiveRank)];
}

/**
 * Derive a CrackEvidence score from Model A's crack_analysis output.
 *
 * @param {Object} crackAnalysis — { severity_tier, detections: [{ coverage_pct }] }
 * @returns {number} score 0–100
 */
export function deriveCrackEvidence(crackAnalysis) {
  const effectiveTier = deriveEffectiveCrackSeverity(crackAnalysis);

  if (!effectiveTier) {
    return 0; // no crack data — will be excluded from weighting
  }

  let score = SEVERITY_TIER_BASE[effectiveTier] ?? 50;

  // Optional ±10 nudge by coverage_pct within tier
  if (
    crackAnalysis.detections &&
    crackAnalysis.detections.length > 0
  ) {
    const maxCoverage = Math.max(
      ...crackAnalysis.detections.map((d) => readCoveragePct(d))
    );
    // Nudge: high coverage within tier pushes score up, low pushes down
    // coverage_pct is typically 0–100 as a percentage
    const nudge = ((maxCoverage - 50) / 50) * 10; // maps 0→-10, 50→0, 100→+10
    score = Math.max(0, Math.min(100, score + nudge));
  }

  return Math.round(score * 10) / 10; // one decimal place
}

// ─── §6.1.3 — Weighted score combination ───

const BASE_WEIGHTS = {
  structural: 0.35,
  crack: 0.3,
  siteHazard: 0.2,
  scenario: 0.15,
};

/**
 * Combine component scores into a final risk score and tier.
 * Missing components have their weight redistributed proportionally.
 *
 * @param {Object} params
 * @param {number} params.structuralScore — 0–100
 * @param {number} params.crackScore — 0–100
 * @param {number|null} params.siteHazardScore — 0–100 or null if not computed
 * @param {number|null} params.scenarioScore — 0–100 or null if not computed
 * @param {Object} params.crackAnalysis — raw crack_analysis from ML Space
 * @param {Object} params.gate — raw gate result from ML Space
 * @returns {Object} { final_score, final_tier, breakdown, escalation_applied, engineer_referral_recommended }
 */
export function combineScores({
  structuralScore,
  crackScore,
  siteHazardScore,
  scenarioScore,
  crackAnalysis,
  gate,
}) {
  const hasScenarioScore = scenarioScore !== null && scenarioScore !== undefined;
  const hasSiteHazardScore = siteHazardScore !== null && siteHazardScore !== undefined;
  const locationWeight = BASE_WEIGHTS.siteHazard + BASE_WEIGHTS.scenario;

  // Determine which components are included
  const components = {
    structural: { score: structuralScore, weight: BASE_WEIGHTS.structural, included: true },
    crack: { score: crackScore, weight: BASE_WEIGHTS.crack, included: true },
    siteHazard: {
      score: siteHazardScore,
      weight: hasScenarioScore ? 0 : BASE_WEIGHTS.siteHazard,
      included: !hasScenarioScore && hasSiteHazardScore,
    },
    scenario: {
      score: scenarioScore,
      weight: locationWeight,
      included: hasScenarioScore,
    },
  };

  // Redistribute weights proportionally for missing components
  const includedEntries = Object.values(components).filter((c) => c.included);
  const includedWeightSum = includedEntries.reduce((sum, c) => sum + c.weight, 0);

  let finalScore = 0;
  for (const comp of includedEntries) {
    const adjustedWeight = comp.weight / includedWeightSum; // proportional redistribution
    comp.adjustedWeight = Math.round(adjustedWeight * 1000) / 1000;
    finalScore += comp.score * adjustedWeight;
  }

  finalScore = Math.round(finalScore * 10) / 10; // one decimal place
  let finalTier = scoreToTier(finalScore);

  // ─── Escalation override (non-negotiable) ───
  // If crack severity is High/Very High,
  // floor final_tier at "High" and recommend engineer referral.
  let escalationApplied = false;
  let engineerReferralRecommended = false;

  const severityTier = deriveEffectiveCrackSeverity(crackAnalysis);

  if (
    severityTier === "High" ||
    severityTier === "Very High"
  ) {
    escalationApplied = true;
    engineerReferralRecommended = true;

    // Floor at High — only upgrade, never downgrade
    const tierRank = { "Very Low": 0, Low: 1, Moderate: 2, High: 3, "Very High": 4 };
    if ((tierRank[finalTier] ?? 0) < tierRank["High"]) {
      finalTier = "High";
    }
  }

  // Also recommend engineer referral for High or Very High regardless
  if (finalTier === "High" || finalTier === "Very High") {
    engineerReferralRecommended = true;
  }

  return {
    final_score: finalScore,
    final_tier: finalTier,
    breakdown: {
      structural_vulnerability: {
        score: structuralScore,
        weight: components.structural.adjustedWeight ?? BASE_WEIGHTS.structural,
      },
      crack_evidence: {
        score: crackScore,
        weight: components.crack.adjustedWeight ?? BASE_WEIGHTS.crack,
        effective_tier: severityTier,
      },
      site_hazard: {
        score: siteHazardScore ?? null,
        weight: components.siteHazard.adjustedWeight ?? components.siteHazard.weight,
        included: components.siteHazard.included,
        replaced_by_scenario: hasScenarioScore,
      },
      scenario_shaking: {
        score: scenarioScore ?? null,
        weight: components.scenario.adjustedWeight ?? components.scenario.weight,
        included: components.scenario.included,
      },
    },
    escalation_applied: escalationApplied,
    engineer_referral_recommended: engineerReferralRecommended,
  };
}

/**
 * Generate a context-sensitive preparedness checklist based on the assessment.
 *
 * @param {string} finalTier
 * @param {Object} breakdown
 * @returns {string[]}
 */
export function generateChecklist(finalTier, breakdown) {
  const checklist = [
    "Keep emergency supplies (water, food, first-aid kit) accessible.",
    "Identify safe spots in each room (under sturdy furniture, away from windows).",
    "Know your nearest open space or evacuation point.",
  ];

  if (
    finalTier === "Moderate" ||
    finalTier === "High" ||
    finalTier === "Very High"
  ) {
    checklist.push(
      "Have a structural assessment performed by a licensed engineer.",
      "Prepare a family emergency communication plan.",
      "Secure heavy furniture and appliances to walls."
    );
  }

  if (finalTier === "High" || finalTier === "Very High") {
    checklist.push(
      "Consider temporary relocation if structural cracks are worsening.",
      "Contact local disaster management authorities for guidance.",
      "Do not ignore visible structural damage — evacuate if in doubt."
    );
  }

  if (breakdown?.site_hazard?.included && breakdown.site_hazard.score > 60) {
    checklist.push(
      "Your location has elevated ground hazard — avoid basements during shaking.",
      "Be aware of potential soil liquefaction in your area."
    );
  }

  return checklist;
}

export default {
  scoreToTier,
  computeStructuralVulnerability,
  deriveEffectiveCrackSeverity,
  deriveCrackEvidence,
  combineScores,
  generateChecklist,
};

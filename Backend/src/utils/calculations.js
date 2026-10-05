/**
 * SAARTH Calculation Utilities
 * Core business rules for Vehicle Intelligence V0
 */

/**
 * Calculate estimated fuel volume
 * @param {number} amount - Total money spent (e.g. ₹2500)
 * @param {number} fuelPrice - Price per unit volume (e.g. ₹100/L)
 * @returns {number} Estimated Fuel Volume in Litres
 */
export function calculateEstimatedFuelVolume(amount, fuelPrice) {
  const amt = Number(amount);
  const price = Number(fuelPrice);
  if (!amt || !price || price <= 0 || amt <= 0) return 0;
  return Number((amt / price).toFixed(2));
}

/**
 * Calculate distance, mileage and cost/km between two consecutive fuel events
 * @param {number} currentOdo - Current refill odometer
 * @param {number} prevOdo - Previous refill odometer
 * @param {number} estimatedVolume - Estimated volume of current refill in Litres
 * @param {number} amount - Amount paid in INR
 * @returns {object} { distance, mileage, costPerKm }
 */
export function calculateMileageAndCost(currentOdo, prevOdo, estimatedVolume, amount) {
  const curr = Number(currentOdo);
  const prev = prevOdo !== null && prevOdo !== undefined ? Number(prevOdo) : null;
  const vol = Number(estimatedVolume);
  const amt = Number(amount);

  if (prev === null || isNaN(prev) || curr <= prev || vol <= 0 || isNaN(vol)) {
    return {
      distance: null,
      mileage: null,
      costPerKm: null,
    };
  }

  const distance = Number((curr - prev).toFixed(2));
  const mileage = Number((distance / vol).toFixed(2));
  const costPerKm = distance > 0 && amt > 0 ? Number((amt / distance).toFixed(2)) : null;

  return {
    distance,
    mileage,
    costPerKm,
  };
}

/**
 * Process an ordered list of fuel events (sorted chronological ascending)
 * to compute delta distance, mileage, costPerKm for each event.
 * @param {Array} events - Chronologically sorted fuel events (oldest first)
 * @returns {Array} Events enriched with mileage, distance, costPerKm
 */
export function enrichFuelEventsWithMetrics(events) {
  if (!Array.isArray(events) || events.length === 0) return [];

  const enriched = [];
  for (let i = 0; i < events.length; i++) {
    const current = events[i];
    const prev = i > 0 ? events[i - 1] : null;

    const currentOdo = Number(current.odometer);
    const prevOdo = prev ? Number(prev.odometer) : null;
    const vol = Number(current.estimated_volume || current.estimatedVolume || 0);
    const amt = Number(current.amount || 0);

    const metrics = calculateMileageAndCost(currentOdo, prevOdo, vol, amt);

    enriched.push({
      ...current,
      distance: metrics.distance,
      mileage: metrics.mileage,
      cost_per_km: metrics.costPerKm,
      costPerKm: metrics.costPerKm,
    });
  }

  return enriched;
}

/**
 * Generate rule-based SAARTH insights based on vehicle metrics
 * @param {Array} enrichedEvents - Chronologically sorted events with metrics
 * @param {number} avgMileage - Overall average mileage
 * @param {number} monthlySpend - Monthly fuel spend
 * @param {number} prevMonthSpend - Previous month fuel spend
 * @returns {object} Primary insight object
 */
export function generateVehicleInsight(enrichedEvents, avgMileage, monthlySpend, prevMonthSpend = 0) {
  const validMileageEvents = (enrichedEvents || []).filter(e => e.mileage !== null && e.mileage > 0);

  if (validMileageEvents.length === 0) {
    return {
      title: "SAARTH Insight",
      headline: "Start tracking to uncover your vehicle's efficiency",
      message: "Add at least two consecutive fuel refills with odometer readings to calculate your real-world mileage and cost per km.",
      tip: "Remember to enter the exact odometer reading at the fuel pump.",
      type: "info",
      badge: "Getting Started",
    };
  }

  if (validMileageEvents.length === 1) {
    const firstMileage = validMileageEvents[0].mileage;
    return {
      title: "SAARTH Insight",
      headline: `Baseline mileage recorded at ${firstMileage} km/L`,
      message: `Your initial calculated mileage is ${firstMileage} km/L. Add more fuel events to establish your running trends.`,
      tip: "Consistent tire pressure and steady acceleration help maintain optimal fuel economy.",
      type: "positive",
      badge: "Baseline Established",
    };
  }

  // Compare the latest event's mileage to the running average of previous events
  const latestEvent = validMileageEvents[validMileageEvents.length - 1];
  const previousEvents = validMileageEvents.slice(0, validMileageEvents.length - 1);
  const prevAvgMileage =
    previousEvents.reduce((sum, e) => sum + Number(e.mileage), 0) / previousEvents.length;

  const diffPercent = prevAvgMileage > 0 ? ((latestEvent.mileage - prevAvgMileage) / prevAvgMileage) * 100 : 0;
  const absDiff = Math.abs(diffPercent).toFixed(1);

  if (diffPercent <= -5.0) {
    return {
      title: "SAARTH Insight",
      headline: `Mileage is ${absDiff}% lower than your recent average`,
      message: `Your latest refill returned ${latestEvent.mileage} km/L compared to your recent average of ${prevAvgMileage.toFixed(1)} km/L.`,
      tip: "Consider checking tyre pressure, engine air filter, or recent heavy traffic/AC usage if this trend continues.",
      type: "warning",
      badge: "Efficiency Alert",
    };
  } else if (diffPercent >= 5.0) {
    return {
      title: "SAARTH Insight",
      headline: `Great efficiency! Mileage is up ${absDiff}%`,
      message: `Your latest refill reached ${latestEvent.mileage} km/L, beating your historical average of ${prevAvgMileage.toFixed(1)} km/L.`,
      tip: "Smooth highway cruising and timely gear shifts help maximize every litre.",
      type: "positive",
      badge: "Optimal Range",
    };
  } else {
    return {
      title: "SAARTH Insight",
      headline: `Stable efficiency around ${Number(avgMileage || latestEvent.mileage).toFixed(1)} km/L`,
      message: `Your vehicle is running consistently with healthy fuel economy and predictable running costs.`,
      tip: "Keep up regular periodic servicing to preserve fuel injector performance.",
      type: "positive",
      badge: "Consistent Performance",
    };
  }
}

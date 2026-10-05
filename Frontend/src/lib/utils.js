/**
 * Utility helpers for SAARTH
 */

export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDecimal(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(num, decimals = 1) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Number(num).toFixed(decimals);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function formatOdometer(value) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  return `${Number(value).toLocaleString('en-IN')} km`;
}

export function calculateMileage(distanceKm, fuelLitres) {
  if (!distanceKm || !fuelLitres || fuelLitres === 0) return null;
  return distanceKm / fuelLitres;
}

export function calculateCostPerKm(amount, distanceKm) {
  if (!amount || !distanceKm || distanceKm === 0) return null;
  return amount / distanceKm;
}

export function calculateFuelVolume(amount, pricePerLitre) {
  if (!amount || !pricePerLitre || pricePerLitre === 0) return null;
  return amount / pricePerLitre;
}

export function getInitials(name) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

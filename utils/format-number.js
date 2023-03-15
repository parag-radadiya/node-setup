export function formatUSD(stripeAmount) {
  return `$${(stripeAmount / 100).toFixed(2)}`;
}

export function formatStripeAmount(USDString) {
  return parseFloat(USDString) * 100;
}

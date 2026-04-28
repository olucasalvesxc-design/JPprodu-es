/**
 * Calcula o preço de uma locução baseado em caracteres + extras.
 * Fórmula: valor = (caracteres / chars_base) * price_base
 * Sempre aplica o preço mínimo.
 */
function calculatePrice(characters, extras = {}, settings = {}) {
  const priceBase = parseFloat(settings.price_base || 35);
  const charsBase = parseFloat(settings.price_chars_base || 70);
  const minPrice = parseFloat(settings.min_price || 35);

  const extraSoundtrack = parseFloat(settings.extra_soundtrack || 15);
  const extraUrgency = parseFloat(settings.extra_urgency || 20);
  const extraRevision = parseFloat(settings.extra_revision || 10);

  const rawBasePrice = (characters / charsBase) * priceBase;
  const basePrice = Math.max(rawBasePrice, minPrice);

  let extrasTotal = 0;
  const breakdown = {
    base: parseFloat(basePrice.toFixed(2)),
    extras: {},
    total: 0,
  };

  if (extras.soundtrack) {
    extrasTotal += extraSoundtrack;
    breakdown.extras.soundtrack = extraSoundtrack;
  }
  if (extras.urgency) {
    extrasTotal += extraUrgency;
    breakdown.extras.urgency = extraUrgency;
  }
  if (extras.revision) {
    extrasTotal += extraRevision;
    breakdown.extras.revision = extraRevision;
  }

  breakdown.extrasTotal = parseFloat(extrasTotal.toFixed(2));
  breakdown.total = parseFloat((basePrice + extrasTotal).toFixed(2));

  return breakdown;
}

module.exports = { calculatePrice };

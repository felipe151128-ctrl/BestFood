/* Integración BestFood: carga este archivo en landing.html y checkout.html
   DESPUÉS de js/script.js. No reemplaza el script principal existente. */
(() => {
  const formatCOP = value => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(value);

  // Intercepta "Continuar con este plan" y lleva al selector con los datos elegidos.
  if (document.getElementById('calc-continue-btn')) {
    const button = document.getElementById('calc-continue-btn');
    button.addEventListener('click', event => {
      const selectedCard = document.querySelector('.plan-card.selected') ||
        [...document.querySelectorAll('.plan-card')].find(card =>
          card.querySelector('.plan-select-btn')?.classList.contains('active'));
      if (!selectedCard) {
        // Si el script original no añade la clase selected, toma el nombre mostrado en la calculadora.
        const displayedName = document.getElementById('calc-plan-name')?.textContent?.trim();
        const matchingCard = [...document.querySelectorAll('.plan-card')].find(card =>
          card.dataset.name === displayedName);
        if (matchingCard) return navigate(matchingCard, event);
        return;
      }
      navigate(selectedCard, event);
    }, true);
  }

  function navigate(card, event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    const meals = Number(document.getElementById('calc-meals')?.value || 10);
    const delivery = document.querySelector('.calc-toggle-btn.active')?.dataset.delivery || 'semanal';
    const url = new URL('seleccionar-platos.html', window.location.href);
    url.searchParams.set('plan', card.dataset.plan || 'plus');
    url.searchParams.set('name', card.dataset.name || 'Plus');
    url.searchParams.set('price', card.dataset.price || 18000);
    url.searchParams.set('meals', meals);
    url.searchParams.set('delivery', delivery);
    url.searchParams.set('festival', card.dataset.festival || '');
    window.location.href = url.toString();
  }

  // Inserta los platos elegidos en el resumen de checkout sin alterar el HTML original.
  if (location.pathname.endsWith('checkout.html')) {
    let order;
    try { order = JSON.parse(localStorage.getItem('bestfood_subscription_order') || 'null'); }
    catch (_) { order = null; }
    if (!order || !Array.isArray(order.dishes)) return;

    const summary = document.querySelector('.checkout-summary');
    if (summary && !document.getElementById('checkout-dishes')) {
      const detail = document.createElement('div');
      detail.className = 'checkout-dishes';
      detail.id = 'checkout-dishes';
      const list = order.dishes.map(d => `<li>${escapeHtml(d.name)} × ${d.quantity}</li>`).join('');
      detail.innerHTML = `<h3>Platos de esta semana</h3><ul>${list}</ul><p>${order.totalMeals} comidas seleccionadas</p>`;
      summary.insertBefore(detail, summary.querySelector('.summary-line'));
    }

    const planEl = document.getElementById('summary-plan');
    const mealsEl = document.getElementById('summary-meals');
    const deliveryEl = document.getElementById('summary-delivery');
    const subtotalEl = document.getElementById('summary-subtotal');
    const totalEl = document.getElementById('summary-total');
    if (planEl) planEl.textContent = order.planName;
    if (mealsEl) mealsEl.textContent = `${order.meals} comidas/semana`;
    if (deliveryEl) deliveryEl.textContent = order.delivery === 'diario' ? 'Entrega día a día' : 'Entrega semanal';
    if (subtotalEl) subtotalEl.textContent = formatCOP(order.estimatedTotal);
    if (totalEl) totalEl.textContent = formatCOP(order.estimatedTotal);

    // No guardar ni solicitar datos reales de tarjeta en este prototipo.
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
    }[char]));
  }
})();

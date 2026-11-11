/* Integra la calculadora, la planificación flexible, el selector y el resumen. */
(() => {
  const money = value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
  const calculator = document.getElementById('price-calculator');

  if (calculator) {
    const modeInputs = [...document.querySelectorAll('input[name="planning-mode"]')];
    const regularRow = document.getElementById('regular-meals-row');
    const flexiblePanel = document.getElementById('flexible-schedule');
    const mealsSelect = document.getElementById('calc-meals');
    const deliveryButtons = [...document.querySelectorAll('.calc-toggle-btn')];
    const totalEl = document.getElementById('calc-total-price');
    const countEl = document.getElementById('flexible-count');
    const continueBtn = document.getElementById('calc-continue-btn');
    const extraPerDelivery = 2000;

    const getMode = () => modeInputs.find(input => input.checked)?.value || 'regular';
    const getSlots = () => [...document.querySelectorAll('.flexible-day')].flatMap(day =>
      [...day.querySelectorAll('input[data-meal]:checked')].map(input => ({ day: day.dataset.day, meal: input.dataset.meal }))
    );
    const getDelivery = () => document.querySelector('.calc-toggle-btn.active')?.dataset.delivery || 'semanal';
    const getSelectedPlan = () => document.querySelector('.plan-card.selected') || [...document.querySelectorAll('.plan-card')].find(card => card.dataset.name === document.getElementById('calc-plan-name')?.textContent.trim());

    function updateFlexibleState() {
      const flexible = getMode() === 'flexible';
      if (regularRow) regularRow.hidden = flexible;
      if (flexiblePanel) flexiblePanel.hidden = !flexible;
      const slots = getSlots();
      if (countEl) countEl.textContent = slots.length ? `${slots.length} ${slots.length === 1 ? 'comida seleccionada' : 'comidas seleccionadas'} en ${new Set(slots.map(s => s.day)).size} días.` : 'Selecciona al menos una comida.';
      recalcFlexible();
    }

    function recalcFlexible() {
      if (getMode() !== 'flexible') return;
      const card = getSelectedPlan();
      const slots = getSlots();
      if (!card) return;
      const price = Number(card.dataset.price) || 0;
      const deliveryDays = new Set(slots.map(s => s.day)).size;
      let total = price * slots.length;
      if (getDelivery() === 'diario' && deliveryDays > 1) total += (deliveryDays - 1) * extraPerDelivery;
      if (totalEl) totalEl.textContent = money(total);
    }

    modeInputs.forEach(input => input.addEventListener('change', updateFlexibleState));
    document.querySelectorAll('.flexible-day input').forEach(input => input.addEventListener('change', updateFlexibleState));
    deliveryButtons.forEach(button => button.addEventListener('click', () => setTimeout(recalcFlexible, 0)));
    mealsSelect?.addEventListener('change', () => { if (getMode() === 'regular') return; recalcFlexible(); });
    document.querySelectorAll('.plan-select-btn').forEach(button => button.addEventListener('click', () => setTimeout(recalcFlexible, 0)));

    // Intercepta el botón antes de que la navegación antigua mande al login.
    continueBtn?.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const card = getSelectedPlan();
      if (!card) { alert('Primero elige un plan: Básico, Plus o Premium.'); return; }
      const mode = getMode();
      const slots = mode === 'flexible' ? getSlots() : [];
      const meals = mode === 'flexible' ? slots.length : Number(mealsSelect.value);
      if (mode === 'flexible' && meals === 0) { alert('Selecciona al menos un almuerzo o una cena para continuar.'); return; }
      const days = mode === 'flexible' ? new Set(slots.map(s => s.day)).size : ({5:5,7:7,10:5,14:7}[meals] || 1);
      const total = (Number(card.dataset.price) || 0) * meals + (getDelivery() === 'diario' && days > 1 ? (days - 1) * extraPerDelivery : 0);
      const url = new URL('seleccionar-platos.html', window.location.href);
      url.searchParams.set('plan', card.dataset.plan);
      url.searchParams.set('name', card.dataset.name);
      url.searchParams.set('price', card.dataset.price);
      url.searchParams.set('meals', String(meals));
      url.searchParams.set('delivery', getDelivery());
      url.searchParams.set('festival', card.dataset.festival || '');
      url.searchParams.set('mode', mode);
      if (mode === 'flexible') url.searchParams.set('schedule', JSON.stringify(slots));
      url.searchParams.set('total', String(total));
      window.location.href = url.toString();
    }, true);
    updateFlexibleState();
  }

  // En checkout, muestra los platos y los días programados si se usó el modo flexible.
  if (location.pathname.endsWith('checkout.html')) {
    let order;
    try { order = JSON.parse(localStorage.getItem('bestfood_subscription_order') || 'null'); } catch (_) { order = null; }
    if (!order) return;
    const summary = document.querySelector('.checkout-summary');
    if (summary && !document.getElementById('checkout-dishes')) {
      const detail = document.createElement('div');
      detail.className = 'checkout-dishes'; detail.id = 'checkout-dishes';
      const list = (order.dishes || []).map(d => `<li>${escapeHtml(d.name)} × ${d.quantity}</li>`).join('');
      const schedule = Array.isArray(order.schedule) && order.schedule.length
        ? `<h4>Planificación por día</h4><ul>${order.schedule.map(s => `<li>${escapeHtml(s.day)} — ${escapeHtml(s.meal)}: ${escapeHtml(s.dishName)}</li>`).join('')}</ul>` : '';
      detail.innerHTML = `<h3>Platos de tu pedido</h3><ul>${list}</ul><p>${order.totalMeals} comidas seleccionadas</p>${schedule}`;
      summary.insertBefore(detail, summary.querySelector('.summary-line'));
    }
    const put = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    put('summary-plan', order.planName || '—');
    put('summary-meals', `${order.meals || order.totalMeals} comidas`);
    put('summary-delivery', order.delivery === 'diario' ? 'Día a día' : 'Semanal');
    put('summary-subtotal', money(order.estimatedTotal || 0)); put('summary-total', money(order.estimatedTotal || 0)); put('pay-btn-total', money(order.estimatedTotal || 0));
  }

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
})();

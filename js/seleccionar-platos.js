(() => {
  const money = value => new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', maximumFractionDigits: 0
  }).format(value);

  const params = new URLSearchParams(window.location.search);
  const plan = {
    key: params.get('plan') || 'plus',
    name: params.get('name') || 'Plus',
    price: Number(params.get('price')) || 18000,
    meals: Number(params.get('meals')) || 10,
    delivery: params.get('delivery') || 'semanal',
    festival: params.get('festival') || '2 días de festival al mes'
  };

  const grid = document.getElementById('picker-grid');
  if (!grid) return;

  document.getElementById('picker-plan').textContent = plan.name;
  document.getElementById('picker-limit').textContent = `${plan.meals} comidas`;
  document.getElementById('picker-delivery').textContent = plan.delivery === 'diario' ? 'Día a día' : 'Semanal';
  document.getElementById('picker-count').textContent = `0 / ${plan.meals}`;
  document.getElementById('picker-bottom-count').textContent = `0 de ${plan.meals} comidas`;

  const cards = [...grid.querySelectorAll('.picker-card')];
  const quantities = Object.fromEntries(cards.map(card => [card.dataset.id, 0]));
  const countEl = document.getElementById('picker-count');
  const bottomCount = document.getElementById('picker-bottom-count');
  const feedback = document.getElementById('picker-feedback');
  const progress = document.getElementById('picker-progress-bar');
  const continueBtn = document.getElementById('picker-continue');

  function totalSelected() {
    return Object.values(quantities).reduce((sum, n) => sum + n, 0);
  }

  function render() {
    const total = totalSelected();
    countEl.textContent = `${total} / ${plan.meals}`;
    bottomCount.textContent = `${total} de ${plan.meals} comidas`;
    progress.style.width = `${Math.min(100, total / plan.meals * 100)}%`;
    continueBtn.disabled = total !== plan.meals;
    document.getElementById('picker-bottom-message').textContent =
      total === plan.meals ? '¡Semana completa! Ya puedes continuar.' :
      `Te ${plan.meals-total === 1 ? 'falta' : 'faltan'} ${plan.meals-total} ${plan.meals-total === 1 ? 'comida' : 'comidas'} por elegir.`;
    feedback.classList.toggle('complete', total === plan.meals);
    feedback.textContent = total === plan.meals
      ? '¡Perfecto! Completaste todas las comidas de tu plan.'
      : `Llevas ${total} de ${plan.meals}. Puedes repetir platos o combinar diferentes opciones.`;

    cards.forEach(card => {
      const qty = quantities[card.dataset.id];
      card.querySelector('.qty-value').textContent = qty;
      card.classList.toggle('has-quantity', qty > 0);
      card.querySelector('[data-change="-1"]').disabled = qty === 0;
      card.querySelector('[data-change="1"]').disabled = total >= plan.meals;
    });
  }

  grid.addEventListener('click', event => {
    const button = event.target.closest('.qty-btn');
    if (!button) return;
    const card = button.closest('.picker-card');
    const id = card.dataset.id;
    const change = Number(button.dataset.change);
    if (change > 0 && totalSelected() >= plan.meals) return;
    quantities[id] = Math.max(0, quantities[id] + change);
    render();
  });

  continueBtn.addEventListener('click', () => {
    if (totalSelected() !== plan.meals) return;
    const dishes = cards
      .filter(card => quantities[card.dataset.id] > 0)
      .map(card => ({
        id: card.dataset.id,
        name: card.dataset.name,
        quantity: quantities[card.dataset.id],
        unitPrice: Number(card.dataset.price),
        image: card.dataset.image,
        tag: card.dataset.tag
      }));
    const order = {
      plan: plan.key, planName: plan.name, pricePerMeal: plan.price,
      meals: plan.meals, delivery: plan.delivery, festival: plan.festival,
      dishes, totalMeals: totalSelected(),
      estimatedTotal: plan.price * plan.meals,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('bestfood_subscription_order', JSON.stringify(order));
    window.location.href = 'programar-entrega.html';
  });

  // Si se abre el checkout con esta selección, agrega el detalle al resumen existente.
  render();
})();

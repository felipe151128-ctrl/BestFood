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
    window.location.href = 'checkout.html';
  });

  // Perfil nutricional compartido con menu.html: misma clave y mismos campos.
  const nutritionKey = 'bestfood_nutrition_preferences';
  const nutritionForm = document.getElementById('plan-nutrition-form');
  const nutritionControls = document.getElementById('nutrition-controls');
  const nutritionToggle = document.getElementById('nutrition-toggle');
  const nutritionReset = document.getElementById('plan-nutrition-reset');
  const nutritionFeedback = document.getElementById('plan-nutrition-feedback');
  const nutritionSummary = document.getElementById('nutrition-live-summary');
  const goalFields = ['calories', 'protein', 'carbs', 'fats', 'fiber', 'sugars', 'saturatedFat', 'sodium'];
  const dietFields = ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree'];

  // Fichas de referencia: ingredientes propuestos y valores aproximados por porción.
  // Deben validarse con las recetas reales de cocina antes de publicarse como información oficial.
  const dishNutrition = {
    quinoa: { ingredients: ['Quinoa cocida', 'Pepino', 'Tomate cherry', 'Espinaca', 'Aguacate', 'Limón y aceite de oliva'], allergens: 'Alérgenos posibles: depende del aderezo y de la contaminación cruzada en cocina.', kcal: 420, protein: 12, carbs: 54, fats: 18, fiber: 11, flags: ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree'] },
    salmon: { ingredients: ['Filete de salmón', 'Arroz integral', 'Brócoli', 'Limón', 'Aceite de oliva', 'Hierbas'], allergens: 'Contiene pescado. Revisar posibles trazas y los ingredientes de los aderezos.', kcal: 560, protein: 38, carbs: 42, fats: 25, fiber: 7, flags: ['glutenFree', 'lactoseFree'] },
    ramen: { ingredients: ['Fideos de trigo', 'Caldo', 'Huevo', 'Champiñones', 'Cebolla larga', 'Salsa de soya'], allergens: 'Contiene trigo/gluten, huevo y soya; el caldo puede contener otros alérgenos.', kcal: 610, protein: 25, carbs: 76, fats: 21, fiber: 5, flags: [] },
    italiana: { ingredients: ['Pasta de trigo', 'Salsa de tomate', 'Queso parmesano', 'Albahaca', 'Aceite de oliva'], allergens: 'Contiene trigo/gluten y lácteos. Puede variar según la receta y la salsa.', kcal: 590, protein: 22, carbs: 78, fats: 19, fiber: 6, flags: ['vegetarian'] },
    vegano: { ingredients: ['Garbanzos', 'Quinoa', 'Espinaca', 'Tomate', 'Pepino', 'Tahini o aderezo de limón'], allergens: 'El tahini contiene sésamo; confirmar si se usa y revisar contaminación cruzada.', kcal: 520, protein: 20, carbs: 68, fats: 17, fiber: 15, flags: ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree'] },
    ensalada: { ingredients: ['Lechuga mixta', 'Tomate', 'Pepino', 'Zanahoria', 'Semillas', 'Vinagreta'], allergens: 'Las semillas y la vinagreta pueden variar; confirmar ingredientes y trazas.', kcal: 300, protein: 8, carbs: 28, fats: 18, fiber: 8, flags: ['vegetarian', 'vegan', 'glutenFree', 'lactoseFree'] }
  };
  function safePercent(value, goal) {
    if (!goal || goal <= 0) return null;
    return Math.min(100, Math.round(value / goal * 100));
  }

  function openDishNutrition(card, trigger) {
    const dish = dishNutrition[card.dataset.id];
    if (!dish) return;
    let panel = card.querySelector('.nutrition-inline-panel');
    if (panel) {
      const willOpen = panel.hidden;
      panel.hidden = !willOpen;
      trigger.setAttribute('aria-expanded', String(willOpen));
      const symbol = trigger.querySelector('span');
      if (symbol) symbol.textContent = willOpen ? '−' : '＋';
      return;
    }

    const profile = readNutrition();
    const macros = [
      ['Energía', `${dish.kcal} kcal`], ['Proteína', `${dish.protein} g`],
      ['Carbohidratos', `${dish.carbs} g`], ['Grasas', `${dish.fats} g`], ['Fibra', `${dish.fiber} g`]
    ];
    const macroHtml = macros.map(([label, value]) => `<div class="nutrition-macro"><strong>${value}</strong><span>${label} aprox.</span></div>`).join('');
    const selectedDiets = dietFields.filter(field => profile[field]);
    const mismatches = selectedDiets.filter(field => !dish.flags.includes(field));
    const hasSavedProfile = selectedDiets.length > 0 || goalFields.some(field => Number(profile[field]) > 0);
    let personalHtml = hasSavedProfile ? '' : '<p>Aún no has guardado preferencias alimentarias. Puedes definirlas en “Personaliza tus comidas”.</p>';
    if (selectedDiets.length) {
      personalHtml = `<p><strong>Preferencias guardadas:</strong> ${selectedDiets.map(x => ({vegetarian:'vegetariana',vegan:'vegana',glutenFree:'sin gluten',lactoseFree:'sin lactosa'})[x]).join(', ')}.</p>`;
      if (mismatches.length) personalHtml += `<p class="nutrition-warning">⚠️ Este plato <strong>no está marcado como compatible</strong> con: ${mismatches.map(x => ({vegetarian:'vegetariana',vegan:'vegana',glutenFree:'sin gluten',lactoseFree:'sin lactosa'})[x]).join(', ')}. Confirma la receta antes de elegirlo.</p>`;
      else personalHtml += '<p>✓ La receta propuesta coincide con las preferencias registradas; confirma siempre ingredientes y contaminación cruzada.</p>';
    }
    const goalComparisons = [['calories', dish.kcal, 'kcal', 'Calorías'], ['protein', dish.protein, 'g', 'Proteína'], ['carbs', dish.carbs, 'g', 'Carbohidratos'], ['fats', dish.fats, 'g', 'Grasas']];
    const comparisons = goalComparisons.filter(([key]) => Number(profile[key]) > 0).map(([key, value, unit, label]) => {
      const pct = safePercent(value, Number(profile[key]));
      return `<div class="nutrition-goal-row"><p><strong>${label}:</strong> ${value} ${unit} aprox. por porción · ${pct}% de tu meta diaria</p><div class="nutrition-meter"><span style="width:${pct}%"></span></div></div>`;
    }).join('');

    panel = document.createElement('div');
    panel.className = 'nutrition-inline-panel';
    panel.id = `nutrition-details-${card.dataset.id}`;
    panel.innerHTML = `<h3>Ingredientes propuestos</h3><ul class="nutrition-ingredient-list">${dish.ingredients.map(item => `<li>${item}</li>`).join('')}</ul><p class="nutrition-allergens"><strong>Alérgenos y advertencias:</strong> ${dish.allergens}</p><h3>Información nutricional estimada por porción</h3><div class="nutrition-macros">${macroHtml}</div><section class="nutrition-personal"><h3>Cómo encaja con tu perfil</h3>${personalHtml}${comparisons ? `<div class="nutrition-goal-comparison"><h3>Frente a tus metas diarias</h3>${comparisons}</div>` : '<p>Guarda tus metas diarias para ver la comparación de este plato con tu objetivo.</p>'}</section>`;
    panel.hidden = false;
    trigger.insertAdjacentElement('afterend', panel);
    trigger.setAttribute('aria-expanded', 'true');
    trigger.setAttribute('aria-controls', panel.id);
    const symbol = trigger.querySelector('span');
    if (symbol) symbol.textContent = '−';
    card.classList.add('nutrition-highlight');
  }

  grid.addEventListener('click', event => {
    const trigger = event.target.closest('[data-open-nutrition]');
    if (!trigger) return;
    event.preventDefault();
    openDishNutrition(trigger.closest('.picker-card'), trigger);
  });

  function readNutrition() {
    try { return JSON.parse(localStorage.getItem(nutritionKey) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function updateNutritionUI(profile) {
    if (!nutritionForm) return;
    goalFields.forEach(field => {
      const input = nutritionForm.elements.namedItem(field);
      if (input && profile[field] !== undefined && profile[field] !== null) input.value = profile[field];
    });
    dietFields.forEach(field => {
      const input = nutritionForm.elements.namedItem(field);
      if (input) input.checked = Boolean(profile[field]);
    });
    const goals = [];
    if (profile.calories) goals.push(`${profile.calories} kcal/día`);
    if (profile.protein) goals.push(`${profile.protein} g proteína`);
    if (profile.carbs) goals.push(`${profile.carbs} g carbohidratos`);
    if (profile.fats) goals.push(`${profile.fats} g grasas`);
    const diets = [];
    if (profile.vegan) diets.push('vegana');
    else if (profile.vegetarian) diets.push('vegetariana');
    if (profile.glutenFree) diets.push('sin gluten');
    if (profile.lactoseFree) diets.push('sin lactosa');
    if (nutritionSummary) {
      const summaryText = [...goals, ...diets].join(' · ');
      nutritionSummary.lastElementChild.textContent = summaryText
        ? `Tu perfil guardado: ${summaryText}. Los platos sin información completa se mantienen visibles para que puedas revisar sus ingredientes.`
        : 'Configura tus metas para personalizar la selección. Puedes guardar solo los campos que te interesan.';
    }
    // No se inventan datos de macros ni ingredientes. Solo se identifica como plant-based
    // el plato que ya está explícitamente etiquetado así en el catálogo.
    cards.forEach(card => {
      const note = card.querySelector('[data-nutrition-note]');
      if (!note) return;
      if (profile.vegan || profile.vegetarian || profile.glutenFree || profile.lactoseFree) {
        if (card.dataset.id === 'vegano' && (profile.vegan || profile.vegetarian)) {
          note.innerHTML = '✓ Coincide con la preferencia vegetal indicada <span aria-hidden="true">↗</span>'; 
          note.classList.add('verified-vegan');
        } else {
          note.innerHTML = 'Revisa ingredientes y alérgenos <span aria-hidden="true">↗</span>'; 
          note.classList.remove('verified-vegan');
        }
      } else if (card.dataset.id === 'vegano') {
        note.innerHTML = '✓ Opción plant-based · Ver detalles <span aria-hidden="true">↗</span>'; 
        note.classList.add('verified-vegan');
      } else {
        note.innerHTML = 'Consultar ingredientes y alérgenos <span aria-hidden="true">↗</span>'; 
        note.classList.remove('verified-vegan');
      }
    });
  }

  if (nutritionForm) {
    updateNutritionUI(readNutrition());
    nutritionForm.addEventListener('submit', event => {
      event.preventDefault();
      const old = readNutrition();
      const profile = { ...old };
      goalFields.forEach(field => {
        const input = nutritionForm.elements.namedItem(field);
        if (input && input.value.trim() !== '') profile[field] = Number(input.value);
        else delete profile[field];
      });
      dietFields.forEach(field => { profile[field] = Boolean(nutritionForm.elements.namedItem(field)?.checked); });
      if (profile.vegan) profile.vegetarian = true;
      try {
        localStorage.setItem(nutritionKey, JSON.stringify(profile));
        updateNutritionUI(profile);
        if (nutritionFeedback) nutritionFeedback.textContent = 'Perfil guardado. También estará disponible en la sección de nutrición del menú.';
      } catch (_) {
        if (nutritionFeedback) nutritionFeedback.textContent = 'No se pudo guardar. Revisa la configuración de almacenamiento del navegador.';
      }
    });
    nutritionReset?.addEventListener('click', () => {
      nutritionForm.reset();
      try { localStorage.removeItem(nutritionKey); } catch (_) {}
      updateNutritionUI({});
      if (nutritionFeedback) nutritionFeedback.textContent = 'Se restablecieron los objetivos nutricionales.';
    });
    nutritionToggle?.addEventListener('click', () => {
      const collapsed = nutritionControls.classList.toggle('is-collapsed');
      nutritionToggle.setAttribute('aria-expanded', String(!collapsed));
      nutritionToggle.innerHTML = collapsed ? 'Editar objetivos <span aria-hidden="true">⌄</span>' : 'Ocultar objetivos <span aria-hidden="true">⌃</span>';
    });
  }

  // Si se abre el checkout con esta selección, agrega el detalle al resumen existente.
  render();
})();

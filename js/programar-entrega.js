(() => {
  const STORAGE_KEY = 'bestfood_subscription_order';
  const form = document.getElementById('delivery-form');
  const error = document.getElementById('delivery-error');
  let order;

  try { order = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
  catch (_) { order = null; }

  if (!order || !Array.isArray(order.dishes) || !order.totalMeals) {
    error.hidden = false;
    error.textContent = 'No encontramos una selección de platos. Vuelve al selector, elige tus comidas y continúa desde allí.';
    form.querySelector('button[type="submit"]').disabled = true;
  } else {
    document.getElementById('delivery-plan').textContent = order.planName || 'BestFood';
    document.getElementById('delivery-meals').textContent = `${order.totalMeals} comidas`;
    document.getElementById('delivery-dishes').textContent = order.dishes.length;
  }

  const dateInput = document.getElementById('delivery-date');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const localISO = date => {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  };
  dateInput.min = localISO(tomorrow);
  const maxDate = new Date(tomorrow);
  maxDate.setDate(maxDate.getDate() + 20);
  dateInput.max = localISO(maxDate);
  dateInput.value = localISO(tomorrow);

  form.addEventListener('submit', event => {
    event.preventDefault();
    error.hidden = true;
    if (!order || !Array.isArray(order.dishes) || !order.totalMeals) {
      error.hidden = false;
      error.textContent = 'Primero debes completar la selección de platos.';
      return;
    }
    const formData = new FormData(form);
    const delivery = {
      frequency: formData.get('frequency'),
      date: formData.get('deliveryDate'),
      timeSlot: formData.get('timeSlot')
    };
    if (!delivery.date || !delivery.timeSlot) {
      error.hidden = false;
      error.textContent = 'Selecciona una fecha y una franja horaria para continuar.';
      return;
    }
    order.delivery = delivery.frequency;
    order.deliveryDate = delivery.date;
    order.deliveryTimeSlot = delivery.timeSlot;
    order.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
    window.location.href = 'checkout.html';
  });
})();

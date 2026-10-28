(() => {
  const KEY = 'bestfood_subscription_order';
  const money = n => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let order;
  try { order = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { return; }
  if (!order || !Array.isArray(order.dishes) || !order.dishes.length) return;
  const summary = document.querySelector('.checkout-summary, #checkout-summary, .order-summary');
  if (!summary || document.getElementById('bf-order-details')) return;

  const dishes = order.dishes.map(d => {
    const q = Number(d.quantity)||0, price = Number(d.unitPrice)||0;
    return `<li class="bf-order-dish"><span><strong>${esc(d.name)}</strong><small>${q} × ${money(price)}</small></span><strong>${money(q*price)}</strong></li>`;
  }).join('');
  const date = order.deliveryDate ? formatDate(order.deliveryDate) : 'Sin seleccionar';
  const delivery = order.delivery === 'diario' ? 'Entrega día a día' : 'Entrega semanal';
  const total = Number(order.estimatedTotal)||0;
  const count = Number(order.totalMeals || order.meals)||0;
  const panel = document.createElement('section');
  panel.id = 'bf-order-details';
  panel.className = 'bf-order-details';
  panel.innerHTML = `<div class="bf-order-head"><div><p class="bf-order-eyebrow">RESUMEN DE TU COMPRA</p><h2>Tu pedido, a tu manera</h2></div><span class="bf-order-badge">${count} comidas</span></div>
  <div class="bf-order-plan">
    <div><span>Plan</span><strong>${esc(order.planName||'BestFood')}</strong></div>
    <div><span>Frecuencia</span><strong>${esc(delivery)}</strong></div>
    <div><span>Fecha de entrega</span><strong>${esc(date)}</strong></div>
    <div><span>Horario</span><strong>${esc(order.deliveryTimeSlot||'Sin seleccionar')}</strong></div>
  </div>
  <div class="bf-order-dishes-wrap"><h3>Platos seleccionados</h3><ul class="bf-order-dishes">${dishes}</ul></div>
  <div class="bf-order-totals"><div><span>Comidas seleccionadas</span><strong>${count}</strong></div><div><span>Valor estimado del plan</span><strong>${money(total)}</strong></div></div>
  <p class="bf-order-note">Revisa los platos, la fecha y el horario antes de confirmar. Este resumen es demostrativo y no procesa pagos reales.</p>
  <div class="bf-order-links"><a href="seleccionar-platos.html">Modificar platos</a><a href="programar-entrega.html">Cambiar entrega</a></div>`;
  summary.prepend(panel);
  const subtotal = document.getElementById('summary-subtotal'), grandTotal = document.getElementById('summary-total');
  if (subtotal) subtotal.textContent = money(total);
  if (grandTotal) grandTotal.textContent = money(total);

  function formatDate(iso) {
    const p = String(iso).split('-').map(Number);
    if (p.length !== 3 || p.some(Number.isNaN)) return iso;
    return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(new Date(p[0],p[1]-1,p[2]));
  }
})();
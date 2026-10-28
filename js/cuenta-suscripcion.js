(() => {
  const KEY = 'bestfood_subscription_order';
  const money = n => new Intl.NumberFormat('es-CO', {style:'currency',currency:'COP',maximumFractionDigits:0}).format(Number(n)||0);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let order;
  try { order = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { order = null; }
  const main = document.querySelector('main') || document.body;
  if (!main || document.getElementById('bf-account-subscription')) return;
  const panel = document.createElement('section');
  panel.id = 'bf-account-subscription';
  panel.className = 'bf-account-panel';
  if (!order || !Array.isArray(order.dishes) || !order.dishes.length) {
    panel.innerHTML = `<p class="bf-account-eyebrow">TU SUSCRIPCIÓN</p><h2>Mi cuenta BestFood</h2><p class="bf-account-empty">Todavía no encontramos un pedido guardado en este navegador.</p><a class="bf-account-primary" href="landing.html#planes">Explorar planes</a>`;
    main.prepend(panel); return;
  }
  const dishes = order.dishes.map(d => `<li class="bf-account-dish"><span><strong>${esc(d.name)}</strong><small>Cantidad: ${Number(d.quantity)||0}</small></span><strong>${money((Number(d.quantity)||0)*(Number(d.unitPrice)||0))}</strong></li>`).join('');
  const date = order.deliveryDate ? formatDate(order.deliveryDate) : 'Pendiente de elegir';
  const slot = order.deliveryTimeSlot || 'Pendiente de elegir';
  const frequency = order.delivery === 'diario' ? 'Día a día' : 'Semanal';
  const meals = Number(order.totalMeals || order.meals)||0;
  panel.innerHTML = `<div class="bf-account-head"><div><p class="bf-account-eyebrow">DATOS GUARDADOS EN ESTE NAVEGADOR</p><h2>Mi suscripción</h2></div><span class="bf-account-status">Pedido guardado</span></div>
  <div class="bf-account-stats"><div><span>Plan</span><strong>${esc(order.planName||'BestFood')}</strong></div><div><span>Comidas por semana</span><strong>${meals}</strong></div><div><span>Valor estimado</span><strong>${money(order.estimatedTotal)}</strong></div></div>
  <div class="bf-account-block"><h3>Próxima entrega</h3><div><span>Fecha</span><strong>${esc(date)}</strong></div><div><span>Horario</span><strong>${esc(slot)}</strong></div><div><span>Modalidad</span><strong>${esc(frequency)}</strong></div></div>
  <div class="bf-account-block"><h3>Mis platos</h3><ul>${dishes}</ul></div>
  <div class="bf-account-actions"><a class="bf-account-primary" href="seleccionar-platos.html">Modificar platos</a><a class="bf-account-secondary" href="programar-entrega.html">Cambiar entrega</a><button type="button" class="bf-account-danger" id="bf-clear-order">Borrar pedido guardado</button></div>
  <p class="bf-account-disclaimer">Prototipo académico: esta información se guarda solo en este navegador y no se sincroniza con un servidor.</p>`;
  main.prepend(panel);
  document.getElementById('bf-clear-order')?.addEventListener('click', () => {
    if (window.confirm('¿Seguro que quieres borrar el pedido guardado en este navegador?')) {
      localStorage.removeItem(KEY); window.location.reload();
    }
  });
  function formatDate(iso) {
    const p = String(iso).split('-').map(Number);
    if (p.length !== 3 || p.some(Number.isNaN)) return iso;
    return new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'long',year:'numeric'}).format(new Date(p[0],p[1]-1,p[2]));
  }
})();
/* ============================================
   BESTFOOD — LÓGICA DEL LOGIN
   Por ahora esto es SOLO frontend: no hay servidor real
   detrás. Lo que hacemos es validar los datos en el
   navegador y simular una respuesta, para que entiendas
   el flujo antes de conectar una base de datos.
   ============================================ */

// 1. Agarramos referencias a los elementos del DOM que vamos a usar
const form = document.getElementById('login-form');

// Todo el bloque del login queda protegido: si "form" no existe (porque estamos
// en landing.html o menu.html, no en login.html), este código completo se
// salta y el resto del archivo (carrusel, menú, calculadora) sí se ejecuta.
if (form) {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');
  const feedback = document.getElementById('form-feedback');
  const submitBtn = document.getElementById('submit-btn');
  const togglePasswordBtn = document.getElementById('toggle-password');

  // 2. Mostrar / ocultar la contraseña
  togglePasswordBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.textContent = isHidden ? 'Ocultar' : 'Ver';
  });

  // 3. Función simple para validar formato de correo
  function isValidEmail(value) {
    // Expresión regular básica: algo@algo.algo
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  // 4. Validación en tiempo real: apenas el usuario sale del campo (evento "blur")
  emailInput.addEventListener('blur', () => {
    validateEmail();
  });

  passwordInput.addEventListener('blur', () => {
    validatePassword();
  });

  function validateEmail() {
    const value = emailInput.value.trim();

    if (value === '') {
      showFieldError(emailInput, emailError, 'Escribe tu correo electrónico.');
      return false;
    }
    if (!isValidEmail(value)) {
      showFieldError(emailInput, emailError, 'Ese correo no parece válido.');
      return false;
    }
    clearFieldError(emailInput, emailError);
    return true;
  }

  function validatePassword() {
    const value = passwordInput.value;

    if (value === '') {
      showFieldError(passwordInput, passwordError, 'Escribe tu contraseña.');
      return false;
    }
    if (value.length < 6) {
      showFieldError(passwordInput, passwordError, 'Debe tener al menos 6 caracteres.');
      return false;
    }
    clearFieldError(passwordInput, passwordError);
    return true;
  }

  function showFieldError(input, errorEl, message) {
    input.classList.add('invalid');
    errorEl.textContent = message;
  }

  function clearFieldError(input, errorEl) {
    input.classList.remove('invalid');
    errorEl.textContent = '';
  }

  // 5. Qué pasa cuando el usuario da clic en "Entrar"
  form.addEventListener('submit', (event) => {
    // Evitamos que el formulario recargue la página (comportamiento por defecto de HTML)
    event.preventDefault();

    const emailIsValid = validateEmail();
    const passwordIsValid = validatePassword();

    if (!emailIsValid || !passwordIsValid) {
      showFeedback('Revisa los campos marcados antes de continuar.', 'error');
      return;
    }

    // Simulamos una llamada al servidor con un pequeño retraso.
    // Cuando conectes un backend real, aquí harías un fetch() a tu API:
    //
    // fetch('https://tu-api.com/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     email: emailInput.value,
    //     password: passwordInput.value
    //   })
    // })
    //   .then(res => res.json())
    //   .then(data => { ... })
    //   .catch(err => { ... });

    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando...';
    showFeedback('', '');

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Entrar';
      showFeedback('¡Bienvenido de nuevo! Redirigiendo...', 'success');

      // Si llegamos aquí desde la calculadora de planes, la URL trae
      // ?plan=...&meals=...&total=... — se los pasamos tal cual al checkout.
      // Si no, es un usuario que ya tiene cuenta y solo quiere ver su panel,
      // así que lo mandamos a cuenta.html con su correo para saludarlo.
      const params = window.location.search;

      if (params.includes('plan=')) {
        window.location.href = 'checkout.html' + params;
      } else {
        window.location.href = 'cuenta.html?email=' + encodeURIComponent(emailInput.value);
      }
    }, 1200);
  });

  function showFeedback(message, type) {
    feedback.textContent = message;
    feedback.className = 'form-feedback' + (type ? ' ' + type : '');
  }
}

/* ============================================
   LANDING PAGE — menú móvil
   Este bloque solo actúa si existen esos elementos en la página
   (por eso funciona igual en login.html sin dar error).
   ============================================ */
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

/* ============================================
   LANDING PAGE — carrusel automático de platos (hero)
   Cambia la foto, el nombre y el punto activo cada 3 segundos.
   Solo corre si esos elementos existen (o sea, solo en landing.html).
   ============================================ */
const carouselImg = document.getElementById('dish-carousel-img');
const carouselCaption = document.getElementById('dish-carousel-caption');
const carouselDots = document.getElementById('dish-carousel-dots');

if (carouselImg && carouselCaption && carouselDots) {

  // Cada objeto es una "diapositiva" del carrusel: foto + nombre
  const dishes = [
    { src: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?cs=tinysrgb&w=500', name: 'Salmón a la parrilla' },
    { src: 'https://images.pexels.com/photos/3872370/pexels-photo-3872370.jpeg?cs=tinysrgb&w=500', name: 'Bowl de quinoa' },
    { src: 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?cs=tinysrgb&w=500', name: 'Ramen — día de festival' },
    { src: 'https://images.pexels.com/photos/6223229/pexels-photo-6223229.jpeg?cs=tinysrgb&w=500', name: 'Pasta — día de festival' },
    { src: 'https://images.pexels.com/photos/3794378/pexels-photo-3794378.jpeg?cs=tinysrgb&w=500', name: 'Bowl vegano' }
  ];

  let currentIndex = 0;

  // Creamos un punto (bolita) por cada plato, dinámicamente
  dishes.forEach((dish, index) => {
    const dot = document.createElement('span');
    if (index === 0) dot.classList.add('active');
    carouselDots.appendChild(dot);
  });

  function showDish(index) {
    // Efecto de desvanecido: bajamos la opacidad, cambiamos la foto, la subimos de nuevo
    carouselImg.style.opacity = 0;

    setTimeout(() => {
      carouselImg.src = dishes[index].src;
      carouselImg.alt = dishes[index].name;
      carouselCaption.textContent = dishes[index].name;
      carouselImg.style.opacity = 1;
    }, 300);

    // Actualizamos qué punto está "activo"
    const dots = carouselDots.querySelectorAll('span');
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
    });
  }

  // Cada 3 segundos avanzamos a la siguiente diapositiva.
  // El operador % (módulo) hace que, al llegar al final, vuelva a empezar en 0.
  setInterval(() => {
    currentIndex = (currentIndex + 1) % dishes.length;
    showDish(currentIndex);
  }, 3000);
}

/* ============================================
   LANDING PAGE — calculadora de precio de planes
   Solo corre si existe #price-calculator (o sea, en landing.html).
   ============================================ */
const priceCalculator = document.getElementById('price-calculator');

if (priceCalculator) {

  const planCards = document.querySelectorAll('.plan-card');
  const mealsSelect = document.getElementById('calc-meals');
  const deliveryButtons = document.querySelectorAll('.calc-toggle-btn');
  const calcPlanName = document.getElementById('calc-plan-name');
  const calcTotalPrice = document.getElementById('calc-total-price');
  const calcFestivalNote = document.getElementById('calc-festival-note');
  const calcPlaceholder = document.getElementById('calc-placeholder');
  const calcContent = document.getElementById('calc-content');
  const calcContinueBtn = document.getElementById('calc-continue-btn');

  // Estado actual de la calculadora: qué plan y qué tipo de entrega están elegidos.
  // Empieza en "nada elegido" — por eso el signo de interrogación.
  let selectedPlan = null;
  let selectedDelivery = 'semanal';
  let currentTotal = 0;

  // A cuántos DÍAS distintos corresponden las comidas elegidas.
  // Esto es lo que determina cuántas entregas separadas necesitaría
  // la opción "día a día" (5 y 10 comidas cubren 5 días; 7 y 14 cubren 7).
  const mealsToDays = {
    '5': 5,
    '7': 7,
    '10': 5,
    '14': 7
  };

  const DELIVERY_EXTRA_PER_DAY = 2000; // recargo por cada entrega adicional en "día a día"

  // Formatea un número como precio en pesos: 180000 -> "$180.000"
  function formatPrice(value) {
    return '$' + value.toLocaleString('es-CO');
  }

  function recalculate() {
    const pricePerMeal = parseInt(selectedPlan.dataset.price, 10);
    const mealsCount = parseInt(mealsSelect.value, 10);
    const days = mealsToDays[mealsSelect.value];

    let total = pricePerMeal * mealsCount;

    // Si eligió entrega "día a día", cada día adicional al primero
    // (el primero ya viene incluido, como si fuera el envío base) suma un recargo.
    if (selectedDelivery === 'diario') {
      total += (days - 1) * DELIVERY_EXTRA_PER_DAY;
    }

    currentTotal = total; // lo guardamos para poder usarlo al armar el link de "Continuar"

    calcTotalPrice.textContent = formatPrice(total);
    calcPlanName.textContent = selectedPlan.dataset.name;
    calcFestivalNote.textContent = 'Incluye ' + selectedPlan.dataset.festival.toLowerCase() + '.';
  }

  // Clic en "Elegir [plan]" dentro de cada tarjeta
  planCards.forEach((card) => {
    const button = card.querySelector('.plan-select-btn');
    button.addEventListener('click', () => {
      // Quitamos "selected" de todas las tarjetas y se lo ponemos solo a esta
      planCards.forEach((c) => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPlan = card;

      // La primera vez que se elige un plan, mostramos la calculadora completa
      calcPlaceholder.style.display = 'none';
      calcContent.classList.add('visible');

      recalculate();
    });
  });

  // Cambiar cuántas comidas por semana
  mealsSelect.addEventListener('change', recalculate);

  // Cambiar entre "Semanal" y "Día a día"
  deliveryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      deliveryButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      selectedDelivery = btn.dataset.delivery;
      recalculate();
    });
  });

  // "Continuar con este plan": empaquetamos todo lo elegido como parámetros
  // en la URL (?plan=...&meals=...) para que login.html y luego checkout.html
  // sepan qué mostrar en el resumen del pedido, sin necesitar una base de datos.
  calcContinueBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const params = new URLSearchParams({
      plan: selectedPlan.dataset.plan,
      planName: selectedPlan.dataset.name,
      meals: mealsSelect.value,
      delivery: selectedDelivery,
      total: currentTotal
    });

    window.location.href = 'login.html?' + params.toString();
  });
}

/* ============================================
   PÁGINA DE CHECKOUT
   Lee los datos que vienen en la URL (?plan=...&meals=...) y los muestra.
   Solo corre si existe #checkout-payment (o sea, en checkout.html).
   ============================================ */
const checkoutPayment = document.getElementById('checkout-payment');

if (checkoutPayment) {

  // URLSearchParams lee automáticamente los "?algo=valor&otro=valor2" de la URL
  const urlParams = new URLSearchParams(window.location.search);

  const deliveryLabels = {
    semanal: 'Semanal (1 envío)',
    diario: 'Día a día'
  };

  // Rellenamos el resumen con lo que venía en la URL.
  // El "|| '—'" es un valor de respaldo por si alguien abre esta página sin esos datos.
  document.getElementById('summary-plan').textContent = urlParams.get('planName') || '—';
  document.getElementById('summary-meals').textContent = (urlParams.get('meals') || '—') + ' comidas';
  document.getElementById('summary-delivery').textContent = deliveryLabels[urlParams.get('delivery')] || '—';

  const total = parseInt(urlParams.get('total'), 10) || 0;
  const formattedTotal = '$' + total.toLocaleString('es-CO');
  document.getElementById('summary-subtotal').textContent = formattedTotal;
  document.getElementById('summary-total').textContent = formattedTotal;
  document.getElementById('pay-btn-total').textContent = formattedTotal;

  // Simulamos el envío del formulario de pago
  const paymentForm = document.getElementById('payment-form');
  const checkoutSuccess = document.getElementById('checkout-success');

  paymentForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Aquí, en un proyecto real, este es el punto donde llamarías a una
    // pasarela de pago real (ej. Wompi, PayU, Stripe) con fetch(), en vez
    // de solo mostrar un mensaje de éxito como hacemos aquí.

    checkoutPayment.style.display = 'none';
    checkoutSuccess.classList.add('visible');
  });
}

/* ============================================
   PÁGINA DE CUENTA
   Solo corre si existe #account-greeting (o sea, en cuenta.html).
   ============================================ */
const accountGreeting = document.getElementById('account-greeting');

if (accountGreeting) {

  // 1. Saludo personalizado, si venimos del login con el correo en la URL
  const accountParams = new URLSearchParams(window.location.search);
  const email = accountParams.get('email');

  if (email) {
    // Tomamos solo la parte antes del "@" y la ponemos con mayúscula inicial
    const namePart = email.split('@')[0];
    const displayName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
    accountGreeting.textContent = 'Hola de nuevo, ' + displayName + ' 👋';
  }

  // 2. Preferencias nutricionales con localStorage
  // localStorage es memoria que el navegador guarda para siempre (hasta que
  // se borre), incluso si cierras la pestaña o apagas el computador —
  // por eso es diferente de una variable normal de JavaScript.
  const protein = document.getElementById('pref-protein');
  const carbs = document.getElementById('pref-carbs');
  const fats = document.getElementById('pref-fats');
  const proteinValue = document.getElementById('pref-protein-value');
  const carbsValue = document.getElementById('pref-carbs-value');
  const fatsValue = document.getElementById('pref-fats-value');
  const savedNote = document.getElementById('pref-saved-note');

  // Al cargar la página, revisamos si ya había preferencias guardadas antes
  try {
    const saved = localStorage.getItem('bestfood-nutrient-prefs');
    if (saved) {
      const prefs = JSON.parse(saved);
      protein.value = prefs.protein;
      carbs.value = prefs.carbs;
      fats.value = prefs.fats;
    }
  } catch (error) {
    console.log('No se pudieron leer las preferencias guardadas:', error);
  }

  // Refleja el valor actual de los sliders en el texto ("70%", etc.)
  function updatePrefLabels() {
    proteinValue.textContent = protein.value + '%';
    carbsValue.textContent = carbs.value + '%';
    fatsValue.textContent = fats.value + '%';
  }

  function savePrefs() {
    const prefs = {
      protein: protein.value,
      carbs: carbs.value,
      fats: fats.value
    };

    try {
      localStorage.setItem('bestfood-nutrient-prefs', JSON.stringify(prefs));
      savedNote.textContent = 'Guardado ✓';
      setTimeout(() => { savedNote.textContent = ''; }, 1500);
    } catch (error) {
      console.log('No se pudieron guardar las preferencias:', error);
    }
  }

  // "input" dispara mientras arrastras el control deslizante (en tiempo real)
  [protein, carbs, fats].forEach((slider) => {
    slider.addEventListener('input', () => {
      updatePrefLabels();
      savePrefs();
    });
  });

  updatePrefLabels();
}

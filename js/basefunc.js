// Глобальные переменные
let appData = null;
let pointsData = {};
let totalPoints = 100;
let selectedQualitiesCount = 0;

// Загрузка данных
async function loadData() {
  try {
    const response = await fetch("data/data.json");
    appData = await response.json();
    console.log("Данные загружены:", appData);
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    // Fallback - использовать встроенные данные
    appData = getFallbackData();
  }
}

// Встроенные данные на случай ошибки загрузки
function getFallbackData() {
  return {
    qualities: [
      { name: "Самомнение", id: "ego" },
      { name: "Скудоумие", id: "stupidity" },
      { name: "Хамство", id: "rudeness" },
      { name: "Лень", id: "laziness" },
      { name: "Жадность", id: "greed" },
      { name: "Хитрость", id: "cunning" },
      { name: "Болтливость", id: "talkativeness" },
      { name: "Безответственность", id: "irresponsibility" },
      { name: "Цинизм", id: "cynicism" },
      { name: "Тщеславие", id: "vanity" },
    ],
    professions: [
      {
        name: "Айтишник",
        qualities: [
          { id: "ego", weight: 2.5 },
          { id: "stupidity", weight: 1.5 },
          { id: "rudeness", weight: 2 },
          { id: "laziness", weight: 3 },
        ],
        icon: "💻",
        description:
          "Код пишется сам, баги тоже. Главное - гуглить быстрее коллег!",
      },
      {
        name: "Блогер",
        qualities: [
          { id: "ego", weight: 3 },
          { id: "stupidity", weight: 2 },
          { id: "vanity", weight: 3.5 },
          { id: "talkativeness", weight: 2.5 },
        ],
        icon: "📹",
        description:
          "Снимайте завтрак и получайте миллионы. Или не получайте, но снимайте!",
      },
    ],
  };
}

// Инициализация приложения
async function init() {
  await loadData();

  const grid = document.getElementById("qualitiesGrid");
  grid.innerHTML = "";

  pointsData = {};
  totalPoints = 100;
  selectedQualitiesCount = 0;

  appData.qualities.forEach((quality) => {
    pointsData[quality.id] = 0;

    const item = document.createElement("div");
    item.className = "quality-item";
    item.innerHTML = `
      <span class="quality-name">${quality.name}</span>
      <div class="quality-controls">
        <button class="control-btn minus-btn" data-id="${quality.id}">−</button>
        <span class="quality-value" id="value-${quality.id}">0</span>
        <button class="control-btn plus-btn" data-id="${quality.id}">+</button>
      </div>
    `;
    grid.appendChild(item);
  });

  attachEventListeners();
  updateUI();
}

// Подключение обработчиков событий
function attachEventListeners() {
  document.querySelectorAll(".plus-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (totalPoints > 0) {
        if (pointsData[id] === 0) selectedQualitiesCount++;
        pointsData[id] += 5;
        totalPoints -= 5;
        updateUI();
        animateButton(e.target);
      }
    });
  });

  document.querySelectorAll(".minus-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      if (pointsData[id] > 0) {
        pointsData[id] -= 5;
        totalPoints += 5;
        if (pointsData[id] === 0) selectedQualitiesCount--;
        updateUI();
        animateButton(e.target);
      }
    });
  });

  const submitBtn = document.getElementById("submitBtn");
  const newSubmitBtn = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
  newSubmitBtn.addEventListener("click", submitQuiz);

  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    const newRestartBtn = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newRestartBtn, restartBtn);
    newRestartBtn.addEventListener("click", restart);
  }
}

// Анимация кнопки
function animateButton(btn) {
  gsap.to(btn, {
    scale: 1.2,
    duration: 0.1,
    yoyo: true,
    repeat: 1,
  });
}

// Обновление интерфейса
function updateUI() {
  document.getElementById("pointsRemaining").textContent = totalPoints;
  document.getElementById("selectedNumber").textContent =
    selectedQualitiesCount;

  appData.qualities.forEach((quality) => {
    const valueEl = document.getElementById(`value-${quality.id}`);
    if (valueEl) {
      valueEl.textContent = pointsData[quality.id];

      const item = valueEl.closest(".quality-item");
      if (pointsData[quality.id] > 0) {
        item.classList.add("has-points");
      } else {
        item.classList.remove("has-points");
      }

      const minusBtn = item.querySelector(".minus-btn");
      const plusBtn = item.querySelector(".plus-btn");

      minusBtn.disabled = pointsData[quality.id] === 0;
      plusBtn.disabled = totalPoints === 0;
    }
  });

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) {
    // Проверяем: все 100 баллов распределены И выбрано минимум 5 качеств
    submitBtn.disabled = !(totalPoints === 0 && selectedQualitiesCount >= 5);
  }
}

// Создание частиц при анимации
function createParticles(item) {
  const rect = item.getBoundingClientRect();
  const particlesContainer = document.getElementById("particles");

  for (let i = 0; i < 15; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.left = rect.left + rect.width / 2 + "px";
    particle.style.top = rect.top + rect.height / 2 + "px";
    particlesContainer.appendChild(particle);

    const angle = (Math.PI * 2 * i) / 15;
    const distance = 100 + Math.random() * 100;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    gsap.to(particle, {
      x: x,
      y: y,
      opacity: 0,
      scale: 0,
      duration: 0.8,
      ease: "power2.out",
      onComplete: () => particle.remove(),
    });
  }
}

// Отправка теста
function submitQuiz() {
  const quizSection = document.getElementById("quizSection");
  const progressSection = document.getElementById("progressSection");
  const qualityItems = document.querySelectorAll(".quality-item");

  qualityItems.forEach((item, index) => {
    const hasPoints = pointsData[appData.qualities[index].id] > 0;

    if (!hasPoints) {
      createParticles(item);

      const angle = Math.random() * Math.PI * 2;
      const distance = 1500 + Math.random() * 500;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      gsap.to(item, {
        x: x,
        y: y,
        rotation: Math.random() * 1080 - 540,
        opacity: 0,
        scale: 0.3,
        duration: 1.2,
        delay: index * 0.03,
        ease: "power3.in",
        filter: "blur(10px)",
      });
    } else {
      gsap.to(item, {
        scale: 0.8,
        opacity: 0.3,
        duration: 0.6,
        delay: index * 0.03,
      });
    }
  });

  gsap.to(
    [
      ".points-display",
      "#submitBtn",
      "h1",
      ".subtitle",
      "#quizSection .footer",
    ],
    {
      opacity: 0,
      y: -30,
      duration: 0.8,
      delay: 0.6,
      ease: "power2.in",
    }
  );

  setTimeout(() => {
    quizSection.style.display = "none";
    progressSection.style.display = "block";

    gsap.from(progressSection, {
      opacity: 0,
      scale: 0.9,
      duration: 0.6,
      ease: "back.out(1.7)",
    });

    animateCalculation();
  }, 2500);
}

// Анимация расчета с визуализацией
async function animateCalculation() {
  const calcSteps = document.getElementById("calcSteps");
  const progressFill = document.getElementById("progressFill");

  calcSteps.innerHTML =
    '<p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Анализируем ваши качества...</p>';

  // Показываем выбранные качества
  const selectedQualities = appData.qualities.filter(
    (q) => pointsData[q.id] > 0
  );
  let qualitiesHTML = '<div style="margin-bottom: 20px;">';

  for (let i = 0; i < selectedQualities.length; i++) {
    const quality = selectedQualities[i];
    await new Promise((resolve) => setTimeout(resolve, 200));

    qualitiesHTML += `<span class="calc-quality">${quality.name} (${
      pointsData[quality.id]
    } баллов)</span>`;
    calcSteps.innerHTML =
      '<p style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Анализируем ваши качества...</p>' +
      qualitiesHTML +
      "</div>";

    progressFill.style.width =
      ((i + 1) / (selectedQualities.length + 5)) * 100 + "%";
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  // Вычисляем результаты
  calcSteps.innerHTML +=
    '<p style="font-size: 18px; font-weight: 600; margin: 24px 0 16px;">Подбираем профессии...</p>';
  progressFill.style.width = "70%";

  await new Promise((resolve) => setTimeout(resolve, 800));

  const results = calculateDetailedResults();

  // Показываем топ-3 в процессе расчета
  for (let i = 0; i < Math.min(3, results.length); i++) {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const result = results[i];
    const profCard = `
      <div class="calc-profession">
        <div class="calc-profession-name">${result.icon} ${result.name}</div>
        <div class="calc-profession-score">${result.percentage}% совпадение</div>
      </div>
    `;
    calcSteps.innerHTML += profCard;

    progressFill.style.width = 70 + ((i + 1) / 3) * 30 + "%";
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));
  progressFill.style.width = "100%";

  await new Promise((resolve) => setTimeout(resolve, 500));
  showResults(results);
}

// РЕАЛЬНЫЙ расчет результатов с детализацией и весами
function calculateDetailedResults() {
  const results = [];

  // Получаем все выбранные качества пользователя
  const userProfile = {};
  let userTotalPoints = 0;
  appData.qualities.forEach((q) => {
    if (pointsData[q.id] > 0) {
      userProfile[q.id] = pointsData[q.id];
      userTotalPoints += pointsData[q.id];
    }
  });

  // Для каждой профессии рассчитываем совпадение
  appData.professions.forEach((profession) => {
    // Создаем профиль профессии с весами
    const professionProfile = {};
    let professionTotalWeight = 0;

    profession.qualities.forEach((qualityData) => {
      // Поддержка старого формата (строка) и нового (объект с весом)
      const qualityId =
        typeof qualityData === "string" ? qualityData : qualityData.id;
      const weight =
        typeof qualityData === "string" ? 1 : qualityData.weight || 1;

      professionProfile[qualityId] = weight;
      professionTotalWeight += weight;
    });

    // Рассчитываем score по формуле взвешенного совпадения
    let matchScore = 0;
    let penaltyScore = 0;
    const contributions = [];

    // Проходим по всем качествам профессии
    Object.keys(professionProfile).forEach((qualityId) => {
      const requiredWeight = professionProfile[qualityId];
      const userPoints = userProfile[qualityId] || 0;

      if (userPoints > 0) {
        // Формула: (баллы_пользователя / 100) × вес_качества × 100
        // Нормализуем важность качества для профессии
        const qualityImportance = requiredWeight / professionTotalWeight;
        const qualityScore =
          (userPoints / 100) * qualityImportance * 100 * requiredWeight;

        matchScore += qualityScore;

        const qualityName = appData.qualities.find(
          (q) => q.id === qualityId
        ).name;
        contributions.push({
          name: qualityName,
          points: userPoints,
          score: qualityScore,
          weight: requiredWeight,
        });
      } else {
        // Штраф за отсутствие важного качества
        const missingPenalty = (requiredWeight / professionTotalWeight) * 15;
        penaltyScore += missingPenalty;
      }
    });

    // Бонус за полноту профиля (если покрыты все качества профессии)
    const coverageBonus =
      (contributions.length / profession.qualities.length) * 25;

    // Штраф за лишние качества (которые не нужны профессии)
    let irrelevantPenalty = 0;
    Object.keys(userProfile).forEach((qualityId) => {
      if (!professionProfile[qualityId]) {
        irrelevantPenalty += (userProfile[qualityId] / 100) * 5;
      }
    });

    // Итоговый score с учетом всех факторов
    let totalScore =
      matchScore + coverageBonus - penaltyScore - irrelevantPenalty;

    // Минимальный порог для включения в результаты
    if (totalScore > 5 && contributions.length > 0) {
      // Бонус за концентрацию (если много баллов на нужные качества)
      const concentrationBonus = (matchScore / userTotalPoints) * 20;
      totalScore += concentrationBonus;

      results.push({
        name: profession.name,
        icon: profession.icon,
        description: profession.description,
        totalScore: Math.max(0, totalScore),
        contributions: contributions,
        matchCount: contributions.length,
        coveragePercent:
          (contributions.length / profession.qualities.length) * 100,
        percentage: 0,
      });
    }
  });

  // Сортируем по score
  results.sort((a, b) => b.totalScore - a.totalScore);

  // Берем топ-5
  const topFive = results.slice(0, 5);

  if (topFive.length === 0) return [];

  // Добавляем случайную вариативность к каждому score
  topFive.forEach((result, index) => {
    // Генерируем случайный множитель (от 0.85 до 1.15)
    const randomFactor = 0.85 + Math.random() * 0.3;
    result.adjustedScore = result.totalScore * randomFactor;

    // Лидеру иногда даем дополнительный бонус (30% вероятность)
    if (index === 0 && Math.random() > 0.7) {
      result.adjustedScore *= 1.2 + Math.random() * 0.4; // бонус от 20% до 60%
    }

    // Последним позициям иногда снижаем score (40% вероятность)
    if (index >= 3 && Math.random() > 0.6) {
      result.adjustedScore *= 0.6 + Math.random() * 0.3; // снижение на 10-40%
    }
  });

  // Пересортируем с учетом adjusted scores
  topFive.sort((a, b) => b.adjustedScore - a.adjustedScore);

  // Выбираем случайную степень экспоненты для распределения (от 1.2 до 2.8)
  const exponentialPower = 1.2 + Math.random() * 1.6;

  const maxScore = topFive[0].adjustedScore;
  let normalizedScores = topFive.map((r) => {
    // Применяем экспоненциальное распределение с переменной степенью
    const normalized = Math.pow(r.adjustedScore / maxScore, exponentialPower);
    return normalized;
  });

  // Иногда усиливаем разрыв между лидером и остальными (40% вероятность)
  if (Math.random() > 0.6) {
    normalizedScores[0] *= 1.3 + Math.random() * 0.5; // лидер получает +30-80%
  }

  const totalNormalized = normalizedScores.reduce((sum, s) => sum + s, 0);

  // Рассчитываем базовые проценты
  topFive.forEach((result, index) => {
    result.percentage = Math.round(
      (normalizedScores[index] / totalNormalized) * 100
    );
  });

  // Корректируем чтобы сумма была ровно 100%
  const currentSum = topFive
    .slice(0, -1)
    .reduce((sum, r) => sum + r.percentage, 0);
  topFive[topFive.length - 1].percentage = 100 - currentSum;

  // Финальная проверка: если последний получился отрицательным или слишком большим
  if (topFive[topFive.length - 1].percentage < 2) {
    topFive[topFive.length - 1].percentage = 2 + Math.floor(Math.random() * 4); // 2-5%
    // Пересчитываем остальные пропорционально
    const remaining = 100 - topFive[topFive.length - 1].percentage;
    const othersSum = topFive
      .slice(0, -1)
      .reduce((sum, r) => sum + r.percentage, 0);
    topFive.slice(0, -1).forEach((r) => {
      r.percentage = Math.round((r.percentage / othersSum) * remaining);
    });
  }

  // Еще одна финальная корректировка суммы
  const finalSum = topFive.reduce((sum, r) => sum + r.percentage, 0);
  if (finalSum !== 100) {
    topFive[0].percentage += 100 - finalSum;
  }

  // Рассчитываем процентный вклад каждого качества внутри профессии
  topFive.forEach((result) => {
    const contributionTotal = result.contributions.reduce(
      (sum, c) => sum + c.score,
      0
    );

    if (contributionTotal > 0) {
      result.contributions.forEach((contrib) => {
        contrib.percentage = Math.round(
          (contrib.score / contributionTotal) * 100
        );
      });

      // Корректируем сумму вкладов до 100%
      const contribSum = result.contributions
        .slice(0, -1)
        .reduce((sum, c) => sum + c.percentage, 0);
      if (result.contributions.length > 0) {
        result.contributions[result.contributions.length - 1].percentage =
          100 - contribSum;
      }
    }

    // Сортируем contributions по убыванию процента
    result.contributions.sort((a, b) => b.percentage - a.percentage);
  });

  return topFive;
}

// Показ результатов
function showResults(results) {
  const progressSection = document.getElementById("progressSection");
  const resultsSection = document.getElementById("resultsSection");
  const resultsContent = document.getElementById("resultsContent");

  gsap.to(progressSection, {
    opacity: 0,
    scale: 0.9,
    duration: 0.5,
    onComplete: () => {
      progressSection.style.display = "none";
      resultsSection.style.display = "block";

      resultsContent.innerHTML = "";

      results.forEach((result, index) => {
        const card = document.createElement("div");
        card.className = "profession-card";
        card.style.opacity = "0";
        card.style.transform = "translateY(50px) scale(0.95)";

        const medals = ["🥇", "🥈", "🥉", "🏅", "⭐"];
        const emoji = medals[index];

        // Форматируем вклады качеств
        const contributionsHTML = result.contributions
          .map(
            (c) =>
              `<span class="quality-contribution">${c.name} (${c.percentage}%)</span>`
          )
          .join("");

        card.innerHTML = `
          <div class="profession-rank">${emoji}</div>
          <div class="profession-header">
            <div class="profession-icon">${result.icon}</div>
            <div class="profession-info">
              <div class="profession-name">${result.name}</div>
              <div class="profession-percentage">${result.percentage}%</div>
            </div>
          </div>
          <div class="profession-description">${result.description}</div>
          <div class="profession-qualities">
            <strong>Ваш профиль:</strong><br>
            ${contributionsHTML}
          </div>
        `;

        resultsContent.appendChild(card);

        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: index * 0.25,
          ease: "back.out(1.4)",
        });
      });

      gsap.from(resultsSection, {
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
      });
    },
  });
}

// Перезапуск теста
function restart() {
  window.location.reload();
}

// Запуск приложения при загрузке страницы
document.addEventListener("DOMContentLoaded", init);

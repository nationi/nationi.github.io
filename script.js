document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const socialCards = document.querySelectorAll(".social-card");
    socialCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("fade-in"); // Добавляем класс для анимации
      }, index * 100); // Задержка 300 мс между карточками
    });
  }, 3500); // Задержка в 4 секунды перед началом анимации
});
document.addEventListener("DOMContentLoaded", function () {
  const socialCards = document.querySelectorAll(".social-card");
  socialCards.forEach(card => {
      const randomHue = Math.floor(Math.random() * 360); // Случайный оттенок
      const saturation = '70%'; // Уровень насыщенности
      const initialLightness = '70%'; // Начальный уровень светлоты
      const hoverLightness = '65%'; // Уровень светлоты при наведении (50% сделает цвет более насыщенным)
      
      const lightColor = `hsl(${randomHue}, ${saturation}, ${initialLightness})`;
      const brightColor = `hsl(${randomHue}, ${saturation}, ${hoverLightness})`;
      card.style.backgroundColor = lightColor;

      // При наведении курсора
      card.addEventListener("mouseover", () => {
          card.style.backgroundColor = brightColor;
      });

      // При убирании курсора
      card.addEventListener("mouseout", () => {
          card.style.backgroundColor = lightColor;
      });
  });
});

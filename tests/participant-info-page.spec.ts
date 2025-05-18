import { test, expect } from '@playwright/test';

test.describe('ParticipantInfoPage', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Инициализируем данные
    await page.addInitScript(() => {
      const participants = [
        { id: '1', firstName: 'Иван', lastName: 'Иванов', rating: 1600 },
        { id: '2', firstName: 'Петр', lastName: 'Петров', rating: 1550 },
        { id: '3', firstName: 'Анна', lastName: 'Смирнова', rating: 1500 },
        { id: 'empty-4', firstName: 'Пустой', lastName: 'Участник', rating: 0, isEmpty: true }
      ];

      const matches = [
        {
          id: 'm1',
          player1: '1',
          player2: '2',
          result: {
            winner: 'player1',
            details: [{ matchNumber: 0, result: 'player1' }]
          },
          bracket: 'upper',
          round: 1
        },
        {
          id: 'm2',
          player1: '1',
          player2: '3',
          result: {
            winner: 'player2',
            details: [{ matchNumber: 0, result: 'player2' }]
          },
          bracket: 'lower',
          round: 2
        }
      ];

      const standings = [
        {
          participantId: '1',
          points: 3.0,
          position: 1
        }
      ];

      localStorage.setItem('tournamentParticipants', JSON.stringify(participants));
      localStorage.setItem('tournamentMatches', JSON.stringify(matches));
      localStorage.setItem('tournamentStandings', JSON.stringify(standings));
    });

    // 2. Переходим на страницу и ждем загрузки
    await page.goto('/tournament/players/1');

    // 3. Ждем появления любого контента страницы
    await page.waitForSelector('.participant-info-page');
  });

  test('должен отображать информацию об участнике', async ({ page }) => {
    // Проверяем заголовок более гибким способом
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();

    // Проверяем, что заголовок содержит имя и рейтинг (раздельно)
    await expect(heading).toContainText('Иван ');
    await expect(heading).toContainText('1600 elo');

    // Проверяем позицию в рейтинге
    await expect(page.getByText(/Текущая позиция в рейтинге: 1/)).toBeVisible();
  });

  test('должен отображать историю матчей', async ({ page }) => {
    // Проверяем заголовок раздела
    await expect(page.getByText('Завершенные партии')).toBeVisible();

    // Проверяем матчи
    const matches = page.locator('.participant-match-info');
    await expect(matches).toHaveCount(2);

    // Проверяем первый матч
    await expect(matches.first()).toContainText('Верхняя сетка - Раунд 1');
    await expect(matches.first()).toContainText('Победа');

    // Проверяем второй матч
    await expect(matches.nth(1)).toContainText('Нижняя сетка - Раунд 2');
    await expect(matches.nth(1)).toContainText('Поражение');
    await expect(matches.nth(1)).toContainText('Анна');
  });

  test('должен обновлять данные при изменении', async ({ page }) => {
    // Запоминаем текущий рейтинг
    const initialRating = await page.locator('h1').textContent();

    // Обновляем данные
    await page.evaluate(() => {
      const participants = JSON.parse(localStorage.getItem('tournamentParticipants') || '[]');
      participants[0].rating = 1700;
      localStorage.setItem('tournamentParticipants', JSON.stringify(participants));
    });

    // Ждем обновления (увеличили таймаут)
    await page.waitForTimeout(2000);

    // Проверяем изменение
    const updatedRating = await page.locator('h1').textContent();
    expect(updatedRating).toContain('1700 elo');
    expect(updatedRating).not.toBe(initialRating);
  });
});

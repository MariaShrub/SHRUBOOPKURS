import { test, expect } from '@playwright/test';

test.describe('TournamentPage', () => {
  test.beforeEach(async ({ page }) => {
    // Инициализация тестовых данных
    await page.addInitScript(() => {
      const participants = [
        { id: '1', firstName: 'Иван', lastName: 'Иванов', rating: 1500 },
        { id: '2', firstName: 'Петр', lastName: 'Петров', rating: 1400 },
        { id: '3', firstName: 'Анна', lastName: 'Смирнова', rating: 1600 },
        { id: '4', firstName: 'Олег', lastName: 'Сидоров', rating: 1450 },
        { id: '5', firstName: 'Юлия', lastName: 'Кузнецова', rating: 1350 },
        { id: '6', firstName: 'Максим', lastName: 'Орлов', rating: 1550 },
        { id: '7', firstName: 'Елена', lastName: 'Новикова', rating: 1480 },
        { id: 'empty-8', firstName: 'Пустой', lastName: 'Участник', rating: 0, isEmpty: true }
      ];

      const config = {
        participantsCount: 8,
        bracketType: 'rigid',
        tiebreakerType: 'rating',
        matchesInRound: 1
      };

      localStorage.setItem('tournamentParticipants', JSON.stringify(participants));
      localStorage.setItem('tournamentConfig', JSON.stringify(config));
    });

    // Перейдите на страницу турнира
    await page.goto('/tournament');
    await page.waitForSelector('.match-card', { state: 'visible', timeout: 30000 });
  });

  test('полный цикл проведения турнира', async ({ page }) => {
    test.setTimeout(300000); // 5-minute timeout for stability

    // Функция для обработки одного совпадения
    const processMatch = async (matchLocator: any, matchIndex: number) => {
      console.log(`Processing match ${matchIndex}`);
      // Пропускать матчи с пустыми участниками
      if (await matchLocator.getByText('[Пустой]').count() > 0) {
        console.log(`Match ${matchIndex} has empty participant, skipping`);
        return;
      }

      // Найдите и нажмите первый переключатель в совпадении
      const radioButton = matchLocator.locator('input[type="radio"]').first();
      await radioButton.waitFor({ state: 'attached', timeout: 20000 });
      await radioButton.click({ force: true });
      console.log(`Clicked radio button for match ${matchIndex}`);
      await page.waitForTimeout(1500); // Minimal delay for UI to process
    };

    // Процесс всего раунда
    let currentRound = 1;
    while (currentRound <= 5) {
      console.log(`Starting round ${currentRound}`);

      // Собираем матчи
      const matches = page.locator('.match-card');
      const matchCount = await matches.count();
      console.log(`Found ${matchCount} matches in round ${currentRound}`);

      // Обрабатываем каждый матч
      for (let i = 0; i < matchCount; i++) {
        await processMatch(matches.nth(i), i);
      }

      // присутствуем ли мы на финальном матче
      const finalMatchText = page.getByText('Финальный матч');
      if (await finalMatchText.isVisible()) {
        console.log('Final match detected');
        break; // Exit loop to handle final match separately
      }

      // Следующий раунд
      const nextRoundButton = page.getByRole('button', { name: 'Следующий раунд' });
      if (await nextRoundButton.isVisible()) {
        console.log('Clicking next round button');
        await nextRoundButton.click();
        currentRound++;
        await page.waitForTimeout(2500); // Wait for round transition
      }
    }

    // Финальный матч
    console.log('Processing final match');
    await page.waitForSelector('.match-card', { state: 'visible', timeout: 20000 });
    const finalMatch = page.locator('.match-card').first();
    const radioButton = finalMatch.locator('input[type="radio"]').first();
    await radioButton.waitFor({ state: 'attached', timeout: 20000 });
    await radioButton.click({ force: true });
    console.log('Clicked radio button for final match');
    await page.waitForTimeout(2500); // Wait for UI to process final match

    // Verify tournament completion
    await expect(page.getByText('🏆 Победитель турнира 🏆')).toBeVisible({ timeout: 30000 });
    console.log('Tournament completed successfully');
  });

  test('корректно отображает начальные матчи', async ({ page }) => {
    await expect(page.getByText('Иван Иванов')).toBeVisible();
    await expect(page.getByText('Петр Петров')).toBeVisible();
    await expect(page.getByText('Анна Смирнова')).toBeVisible();
    await expect(page.getByText('Пустой Участник')).toBeVisible();
    await expect(page.getByText('Верхняя сетка - Раунд 1')).toBeVisible();
  });

  test('автоматически завершает матчи с пустыми участниками', async ({ page }) => {
    const emptyMatches = page.locator('.match-card', { hasText: '[Пустой]' });
    await expect(emptyMatches).toHaveCount(1);
  });
});
import { test, expect } from '@playwright/test';

test.describe('Full Tournament Flow', () => {
  test.setTimeout(300000); // 5-minute timeout

  test('complete full tournament with 8 participants', async ({ page }) => {
    // 1. Tournament Setup
    await page.goto('/');
    await page.getByLabel('Количество участников:').selectOption('8');
    await page.getByLabel('Тип сетки:').selectOption('rigid');
    await page.getByLabel('Тип тайбрейка:').selectOption('rating');
    await page.getByLabel('Количество матчей в серии:').selectOption('1');
    await page.getByRole('button', { name: 'Сохранить настройки' }).click();

    // 2. Add Participants
    const testPlayers = [
      'Иван Иванов 1500',
      'Петр Петров 1400',
      'Анна Смирнова 1600',
      'Олег Сидоров 1450',
      'Юлия Кузнецова 1350',
      'Максим Орлов 1550',
      'Елена Новикова 1480'
    ];

    for (const player of testPlayers) {
      const [firstName, lastName, rating] = player.split(' ');
      await page.getByPlaceholder('Имя').fill(firstName);
      await page.getByPlaceholder('Фамилия').fill(lastName);
      await page.getByPlaceholder('Рейтинг').fill(rating);
      await page.getByRole('button', { name: 'Добавить участника' }).click();
      await page.waitForTimeout(500); // Wait for UI update
    }

    // 3. Start Tournament
    await page.getByRole('button', { name: /Начать турнир \(\d\/8\)/ }).click();
    await page.waitForSelector('.match-card', { state: 'visible', timeout: 30000 });

    // 4. Process All Rounds
    let round = 1;
    while (round <= 5) {
      console.log(`Starting round ${round}`);
      const matches = page.locator('.match-card');
      const count = await matches.count();
      console.log(`Found ${count} matches in round ${round}`);

      // Process each match
      for (let i = 0; i < count; i++) {
        const match = matches.nth(i);
        if (await match.getByText('[Пустой]').count() > 0) {
          console.log(`Match ${i} has empty participant, skipping`);
          continue;
        }

        console.log(`Processing match ${i}`);
        const radioButton = match.locator('input[type="radio"]').first();
        await radioButton.waitFor({ state: 'attached', timeout: 20000 });
        await radioButton.click({ force: true });
        console.log(`Clicked radio button for match ${i}`);
        await page.waitForTimeout(1500); // Minimal delay for UI to process
      }

      // Check for final match
      const finalMatchText = page.getByText('Финальный матч');
      if (await finalMatchText.isVisible()) {
        console.log('Final match detected');
        break;
      }

      // Move to next round
      const nextRoundButton = page.getByRole('button', { name: 'Следующий раунд' });
      if (await nextRoundButton.isVisible()) {
        console.log('Clicking next round button');
        await nextRoundButton.click();
        round++;
        await page.waitForTimeout(2500); // Wait for round transition
      }
    }

    // Explicitly process the final match
    console.log('Processing final match');
    await page.waitForSelector('.match-card', { state: 'visible', timeout: 20000 });
    const finalMatch = page.locator('.match-card').first();
    const radioButton = finalMatch.locator('input[type="radio"]').first();
    await radioButton.waitFor({ state: 'attached', timeout: 20000 });
    await radioButton.click({ force: true });
    console.log('Clicked radio button for final match');
    await page.waitForTimeout(2500); // Wait for UI to process final match

    // 5. Verify Results
    await expect(page.getByText('🏆 Победитель турнира 🏆')).toBeVisible({ timeout: 30000 });
    console.log('Tournament completed successfully');

    // 6. Navigate to Tournament Info Page
    await page.goto('http://localhost:5173/tournament/info');
    await page.waitForSelector('table', { timeout: 10000 }); // Wait for table to load
    console.log('Navigated to Tournament Info page');
  });
});
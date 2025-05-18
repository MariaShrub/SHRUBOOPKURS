import { test, expect } from '@playwright/test';

test('должен сохранить настройки и перейти на страницу участников', async ({ page }) => {
    await page.goto('/');

    // Ожидаем заголовок страницы
    await expect(page.getByRole('heading', { name: 'Настройка турнира' })).toBeVisible();

    // Выбор количества участников
    await page.getByLabel('Количество участников:').selectOption('16');

    // Выбор типа сетки
    await page.getByLabel('Тип сетки:').selectOption('random');

    // Выбор типа тайбрейка
    await page.getByLabel('Тип тайбрейка:').selectOption('buchholz');

    // Выбор количества матчей в серии
    await page.getByLabel('Количество матчей в серии:').selectOption('3');

    // Клик по кнопке сохранения
    await page.getByRole('button', { name: 'Сохранить настройки' }).click();

    // Проверяем, что произошел переход на страницу участников
    await expect(page).toHaveURL('/participants');

    const config = await page.evaluate(() => {
        return JSON.parse(localStorage.getItem('tournamentConfig')!);
    });

    expect(config).toEqual({
        participantsCount: 16,
        bracketType: 'random',
        tiebreakerType: 'buchholz',
        matchesInRound: 3,
    });
});

test.describe('ParticipantsPage - управление участниками', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('tournamentConfig', JSON.stringify({
                participantsCount: 4,
                bracketType: 'random',
                tiebreakerType: 'buchholz',
                superFinalType: 'handicap',
            }));
        });

        await page.goto('/participants');
    });

    test('добавляет участника и обновляет таблицу', async ({ page }) => {
        await page.getByPlaceholder('Имя').fill('Иван');
        await page.getByPlaceholder('Фамилия').fill('Иванов');
        await page.getByPlaceholder('Рейтинг').fill('1500');
        await page.getByRole('button', { name: 'Добавить участника' }).click();

        const rows = page.locator('.table-row');
        await expect(rows).toHaveCount(1);

        await expect(page.getByText('Участников: 1 / 4')).toBeVisible();
        await expect(page.getByText('требуется еще 3')).toBeVisible();
    });

    test('удаляет участника из таблицы', async ({ page }) => {
        // Добавим участника вручную
        await page.getByPlaceholder('Имя').fill('Анна');
        await page.getByPlaceholder('Фамилия').fill('Петрова');
        await page.getByPlaceholder('Рейтинг').fill('1600');
        await page.getByRole('button', { name: 'Добавить участника' }).click();

        const row = page.locator('.table-row');
        await expect(row).toHaveCount(1);

        // Удаляем
        const removeBtn = page.getByRole('button', { name: /Удалить Анна Петрова/ });
        await removeBtn.click();

        // Проверяем, что таблица пуста
        await expect(page.getByText('Нет добавленных участников')).toBeVisible();
        await expect(page.getByText('Участников: 0 / 4')).toBeVisible();
    });

    test('не добавляет участника без имени и фамилии', async ({ page }) => {
        await page.getByPlaceholder('Рейтинг').fill('1000');

        const addButton = page.getByRole('button', { name: 'Добавить участника' });
        await expect(addButton).toBeDisabled();
    });
});



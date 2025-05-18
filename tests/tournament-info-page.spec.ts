import { test, expect } from '@playwright/test';

test.describe('TournamentInfoPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      const participants = [
        { id: '1', firstName: 'Иван', lastName: 'Иванов', rating: 1600 },
        { id: '2', firstName: 'Петр', lastName: 'Петров', rating: 1550 },
        { id: '3', firstName: 'Анна', lastName: 'Смирнова', rating: 1500 },
        { id: '4', firstName: 'Олег', lastName: 'Сидоров', rating: 1450 },
        { id: '5', firstName: 'Юлия', lastName: 'Кузнецова', rating: 1350 },
        { id: '6', firstName: 'Максим', lastName: 'Орлов', rating: 1550 },
        { id: '7', firstName: 'Елена', lastName: 'Новикова', rating: 1480 },
        { id: 'empty-8', firstName: 'Пустой', lastName: 'Участник', rating: 0, isEmpty: true }
      ];

      const standings = [
        { participantId: '1', points: 5.0, wins: 5, draws: 0, losses: 0, rating: 1600, position: 1, buchholz: 15.0, berger: 12.0 },
        { participantId: '2', points: 4.0, wins: 4, draws: 0, losses: 1, rating: 1550, position: 2, buchholz: 14.0, berger: 11.0 },
        { participantId: '6', points: 3.5, wins: 3, draws: 1, losses: 1, rating: 1550, position: 3, buchholz: 13.5, berger: 10.5 },
        { participantId: '3', points: 3.0, wins: 3, draws: 0, losses: 2, rating: 1500, position: 4, buchholz: 13.0, berger: 9.0 },
        { participantId: '7', points: 2.0, wins: 2, draws: 0, losses: 3, rating: 1480, position: 5, buchholz: 12.0, berger: 8.0 },
        { participantId: '4', points: 2.0, wins: 2, draws: 0, losses: 3, rating: 1450, position: 6, buchholz: 11.5, berger: 7.5 },
        { participantId: '5', points: 1.0, wins: 1, draws: 0, losses: 4, rating: 1350, position: 7, buchholz: 11.0, berger: 6.0 },
        { participantId: 'empty-8', points: 0.0, wins: 0, draws: 0, losses: 0, rating: 0, position: 8, buchholz: 0.0, berger: 0.0 }
      ];

      localStorage.setItem('tournamentParticipants', JSON.stringify(participants));
      localStorage.setItem('tournamentStandings', JSON.stringify(standings));
    });

    await page.goto('/tournament/info');
    await page.waitForSelector('.standings-table', { state: 'attached', timeout: 10000 });
  });

  test('отображает турнирную таблицу с 8 участниками', async ({ page }) => {
    const rows = page.locator('.standings-table tbody tr');
    await expect(rows).toHaveCount(8);
    
    await expect(page.getByText('Иван Иванов')).toBeVisible();
    await expect(page.getByText('Пустой Участник')).toBeVisible();
  });

  test('корректно отображает начальные позиции участников', async ({ page }) => {
    const positions = page.locator('.position-badge');
    
    await expect(positions.nth(0)).toHaveText('1');
    await expect(positions.nth(1)).toHaveText('2');
    await expect(positions.nth(2)).toHaveText('3');
    await expect(positions.nth(3)).toHaveText('4');
  });

  test('изменение позиции участника при обновлении данных', async ({ page }) => {
    // Проверяем начальные позиции
    await expect(page.locator('.position-badge').nth(0)).toHaveText('1'); // Иван Иванов
    await expect(page.locator('.position-badge').nth(1)).toHaveText('2'); // Петр Петров

    // Меняем данные - Петр становится первым, Иван вторым
    await page.evaluate(() => {
      const standings = JSON.parse(localStorage.getItem('tournamentStandings') || '[]');
      
      // Находим участников
      const ivan = standings.find((s: Standing) => s.participantId === '1');
      const petr = standings.find((s: Standing) => s.participantId === '2');
      
      if (ivan && petr) {
        // Меняем очки
        ivan.points = 4.0;
        petr.points = 5.0;
        ivan.wins = 4;
        ivan.losses = 1;
        petr.wins = 5;
        petr.losses = 0;

        // Сортируем по новым очкам
        standings.sort((a: Standing, b: Standing) => {
          if (b.points !== a.points) return b.points - a.points;
          return b.rating - a.rating;
        });
        
        // Обновляем позиции
        standings.forEach((s: Standing, index: number) => {
          s.position = index + 1;
        });
        
        localStorage.setItem('tournamentStandings', JSON.stringify(standings));
      }
    });

    // Ждем обновления данных
    await page.waitForTimeout(2000);
    
    // Проверяем новые позиции
    await expect(page.locator('.position-badge').nth(0)).toHaveText('1'); // Теперь Петр
    await expect(page.locator('.standings-table tbody tr').nth(0)).toContainText('Петр Петров');
    
    await expect(page.locator('.position-badge').nth(1)).toHaveText('2'); // Теперь Иван
    await expect(page.locator('.standings-table tbody tr').nth(1)).toContainText('Иван Иванов');
  });

  test('отображает тайбрейкеры для лидеров', async ({ page }) => {
    await expect(page.locator('.buchholz-cell').first()).toHaveText('15.0');
    await expect(page.locator('.berger-cell').first()).toHaveText('12.0');
  });

  test('подсвечивает топ-3 участников', async ({ page }) => {
    await expect(page.locator('.top-1')).toBeVisible();
    await expect(page.locator('.top-2')).toBeVisible();
    await expect(page.locator('.top-3')).toBeVisible();
  });
});

// Добавляем типы для TypeScript
interface Standing {
  participantId: string;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  rating: number;
  position: number;
  buchholz?: number;
  berger?: number;
}
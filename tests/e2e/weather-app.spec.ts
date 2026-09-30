import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const city = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
};

const weather = {
  current: {
    temperature_2m: 0,
    relative_humidity_2m: 70,
    wind_speed_10m: 10,
    surface_pressure: 1010,
    precipitation: 0,
    weather_code: 0,
    time: '2026-09-30T12:00',
  },
  daily: {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [0, 1, 2, 3, 61],
    temperature_2m_max: [10, 11, 12, 13, 14],
    temperature_2m_min: [0, 1, 2, 3, 4],
    precipitation_probability_max: [20, 30, 40, 10, 60],
  },
};

async function mockWeatherRoutes(page: Page) {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(weather) });
  });
}

test('realiza busca, consulta e alterna unidade', async ({ page }) => {
  await mockWeatherRoutes(page);
  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
  await page.getByRole('button', { name: 'Fahrenheit' }).click();
  await expect(page.getByTestId('current-temperature')).toHaveText('32°F');
  await expect(page.getByText('50°F', { exact: true })).toBeVisible();
});

test('informa ausência de resultados', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: '{}' });
  });
  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('Atlantis');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByText('Nenhuma cidade encontrada')).toBeVisible();
});

test('informa falha de busca e permite tentar novamente', async ({ page }) => {
  let searchAttempts = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    searchAttempts += 1;
    if (searchAttempts === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(weather) });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();
  await expect(page.getByText('Clima atual')).toBeVisible();
});

test('recupera consulta meteorológica após reconexão e retry', async ({ page }) => {
  let online = false;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ results: [city] }),
    });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    if (!online) {
      await route.abort('internetdisconnected');
      return;
    }
    await route.fulfill({ contentType: 'application/json', body: JSON.stringify(weather) });
  });

  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();
  await expect(page.getByRole('alert')).toContainText('Verifique sua conexão');
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeEnabled();

  online = true;
  await page.getByRole('button', { name: 'Tentar novamente' }).click();
  await expect(page.getByText('Clima atual')).toBeVisible();
});

test('mantém fluxo essencial em viewport móvel', async ({ page }) => {
  await mockWeatherRoutes(page);
  await page.goto('/');
  await page.getByLabel('Nome da cidade').fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();
  await page.getByRole('button', { name: /São Paulo/ }).click();
  await expect(page.getByText('Clima atual')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeVisible();
});

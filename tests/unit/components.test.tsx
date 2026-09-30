import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';

afterEach(() => vi.unstubAllGlobals());

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

function mockFetch() {
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const url = String(input);
      return Promise.resolve(
        new Response(
          url.includes('geocoding') ? JSON.stringify({ results: [city] }) : JSON.stringify(weather),
        ),
      );
    }),
  );
}

describe('interface do weather app', () => {
  it('busca, seleciona uma cidade e alterna a unidade', async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByText('Clima atual')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Previsão de 5 dias' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));
    expect(screen.getByTestId('current-temperature')).toHaveTextContent('32°F');
  });

  it('permite buscar e selecionar uma cidade apenas pelo teclado', async () => {
    mockFetch();
    const user = userEvent.setup();
    render(<App />);

    await user.tab();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText('Nome da cidade')).toHaveFocus();

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Buscar' })).toHaveFocus();
    await user.keyboard('{Enter}');

    const cityOption = await screen.findByRole('button', { name: /São Paulo/ });
    await user.tab();
    expect(cityOption).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(await screen.findByText('Clima atual')).toBeInTheDocument();
  });

  it('mostra estado vazio sem chamar a previsão', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({})));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'Atlantis');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByText('Nenhuma cidade encontrada')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('não inicia busca com entrada vazia', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), '   ');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('indica que a busca está em andamento', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => undefined)),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('status', { name: 'Buscando cidades...' })).toBeInTheDocument();
  });

  it('indica que a consulta meteorológica está em andamento', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
      .mockReturnValueOnce(new Promise<Response>(() => undefined));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(
      await screen.findByRole('status', { name: 'Consultando o clima de São Paulo...' }),
    ).toBeInTheDocument();
  });

  it('mostra erro e permite tentar a busca novamente', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByRole('button', { name: /São Paulo/ })).toBeInTheDocument();
  });

  it('mostra erro ao consultar o clima e permite tentar novamente', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ results: [city] })))
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(new Response(JSON.stringify(weather)));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Clima atual')).toBeInTheDocument();
  });

  it('identifica temperatura atual indisponível sem exibir zero', async () => {
    const incompleteWeather = {
      ...weather,
      current: { ...weather.current, temperature_2m: undefined },
    };
    vi.stubGlobal(
      'fetch',
      vi.fn((input: string | URL) =>
        Promise.resolve(
          new Response(
            String(input).includes('geocoding')
              ? JSON.stringify({ results: [city] })
              : JSON.stringify(incompleteWeather),
          ),
        ),
      ),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Nome da cidade'), 'São Paulo');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    await user.click(await screen.findByRole('button', { name: /São Paulo/ }));
    expect(await screen.findByTestId('current-temperature')).toHaveTextContent('Indisponível');
  });
});

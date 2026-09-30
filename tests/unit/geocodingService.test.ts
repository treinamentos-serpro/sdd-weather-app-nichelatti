import { afterEach, describe, expect, it, vi } from 'vitest';
import { searchCities, WeatherServiceError } from '../../src/services/geocodingService';

afterEach(() => vi.unstubAllGlobals());

const cityResult = {
  id: 1,
  name: 'São Paulo',
  country: 'Brasil',
  admin1: 'São Paulo',
  latitude: -23.55,
  longitude: -46.63,
  timezone: 'America/Sao_Paulo',
};

describe('searchCities', () => {
  it('mapeia resultados e envia os parâmetros aprovados', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ results: [cityResult] })));
    vi.stubGlobal('fetch', fetchMock);

    await expect(searchCities(' São Paulo ')).resolves.toEqual([
      {
        id: 1,
        name: 'São Paulo',
        country: 'Brasil',
        region: 'São Paulo',
        latitude: -23.55,
        longitude: -46.63,
        timezone: 'America/Sao_Paulo',
      },
    ]);
    const url = new URL(fetchMock.mock.calls[0][0]);
    expect(url.searchParams.get('language')).toBe('pt');
    expect(url.searchParams.get('count')).toBe('10');
  });

  it('retorna lista vazia sem correspondências', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({}))));
    await expect(searchCities('Atlantis')).resolves.toEqual([]);
  });

  it.each([
    ['erro HTTP', () => Promise.resolve(new Response('{}', { status: 500 }))],
    ['falha de rede', () => Promise.reject(new TypeError('network'))],
    ['resposta inválida', () => Promise.resolve(new Response(JSON.stringify({ results: [{}] })))],
  ])('falha de forma controlada em caso de %s', async (_, implementation) => {
    vi.stubGlobal('fetch', vi.fn(implementation));
    await expect(searchCities('São Paulo')).rejects.toBeInstanceOf(WeatherServiceError);
  });

  it('aborta a busca quando o timeout é atingido', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: string | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(new DOMException('aborted', 'AbortError'));
          });
        }),
    );
    vi.stubGlobal('fetch', fetchMock);

    try {
      const request = searchCities('São Paulo');
      const rejection = expect(request).rejects.toThrow('tempo limite de 10 segundos');
      await vi.advanceTimersByTimeAsync(10_000);
      await rejection;
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.useRealTimers();
    }
  });

  it('orienta a verificar a conexão quando a busca falha por rede', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network')));

    await expect(searchCities('São Paulo')).rejects.toThrow('Verifique sua conexão');
  });
});

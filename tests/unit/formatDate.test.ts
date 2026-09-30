import { describe, expect, it } from 'vitest';
import { formatDate } from '../../src/lib/formatDate';

describe('formatDate', () => {
  it('formata uma data ISO no locale pt-BR', () => {
    expect(formatDate('2026-09-30')).toBe('qua., 30/09');
  });

  it('preserva o dia do calendário perto da mudança de dia', () => {
    expect(formatDate('2026-09-30T23:30:00-03:00')).toBe('qui., 01/10');
  });

  it('retorna fallback para data inválida', () => {
    expect(formatDate('data inválida')).toBe('Data indisponível');
  });
});

import { normaliseField } from './CsvExport';

describe('normaliseField', () => {
  it('should return the string as is if it does not contain a comma or quote', () => {
    const input = 'simpleString';
    const expected = 'simpleString';
    expect(normaliseField(input)).toBe(expected);
  });

  it('should wrap the string in quotes if it contains a comma', () => {
    const input = 'string,WithComma';
    const expected = '"string,WithComma"';
    expect(normaliseField(input)).toBe(expected);
  });

  it('should escape quotes with another quote if string contains a quote', () => {
    const input = `string"WithQuote`;
    const expected = '"string""WithQuote"';
    const out = normaliseField(input);
    console.log({out});
    expect(normaliseField(input)).toBe(expected);
  });

  it('should wrap the string in quotes and escape quotes with another quote if string contains both a comma and a quote', () => {
    const input = 'string,With"CommaAndQuote';
    const expected = '"string,With""CommaAndQuote"';
    expect(normaliseField(input)).toBe(expected);
  });

  it('should correctly handle empty strings', () => {
    const input = '';
    const expected = '';
    expect(normaliseField(input)).toBe(expected);
  });
});

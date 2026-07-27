import { isValidPeruvianPhone, normalizePeruvianPhone } from './phone.schema';

describe('isValidPeruvianPhone', () => {
  it('accepts a 9-digit number starting with 9', () => {
    expect(isValidPeruvianPhone('987654321')).toBe(true);
  });

  it('rejects a number not starting with 9', () => {
    expect(isValidPeruvianPhone('812345678')).toBe(false);
  });

  it('rejects a number with fewer than 9 digits', () => {
    expect(isValidPeruvianPhone('98765432')).toBe(false);
  });

  it('rejects a number with more than 9 digits', () => {
    expect(isValidPeruvianPhone('9876543210')).toBe(false);
  });

  it('rejects a number already prefixed with +51', () => {
    expect(isValidPeruvianPhone('+51987654321')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidPeruvianPhone('')).toBe(false);
  });
});

describe('normalizePeruvianPhone', () => {
  it('prefixes +51 when missing', () => {
    expect(normalizePeruvianPhone('987654321')).toBe('+51987654321');
  });

  it('leaves the number unchanged when already prefixed', () => {
    expect(normalizePeruvianPhone('+51987654321')).toBe('+51987654321');
  });
});

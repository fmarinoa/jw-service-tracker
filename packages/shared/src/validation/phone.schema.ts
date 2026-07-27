import Joi from 'joi';

const PERU_COUNTRY_CODE = '+51';

export const peruvianPhoneSchema = Joi.string()
  .pattern(/^9\d{8}$/)
  .message('El celular debe tener 9 dígitos y empezar con 9.');

export function isValidPeruvianPhone(phone: string): boolean {
  return !peruvianPhoneSchema.validate(phone).error;
}

export function normalizePeruvianPhone(phone: string): string {
  return phone.startsWith(PERU_COUNTRY_CODE)
    ? phone
    : `${PERU_COUNTRY_CODE}${phone}`;
}

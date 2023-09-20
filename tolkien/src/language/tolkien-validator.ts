import type { ValidationChecks } from 'langium';
import type { TolkienAstType } from './generated/ast.js';
import type { TolkienServices } from './tolkien-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: TolkienServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.TolkienValidator;
    const checks: ValidationChecks<TolkienAstType> = {
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class TolkienValidator {}

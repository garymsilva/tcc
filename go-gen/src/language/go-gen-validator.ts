import type { ValidationChecks } from 'langium';
import type { GoGenAstType } from './generated/ast.js';
import type { GoGenServices } from './go-gen-module.js';

/**
 * Register custom validation checks.
 */
export function registerValidationChecks(services: GoGenServices) {
    const registry = services.validation.ValidationRegistry;
    const validator = services.validation.GoGenValidator;
    const checks: ValidationChecks<GoGenAstType> = {
    };
    registry.register(checks, validator);
}

/**
 * Implementation of custom validations.
 */
export class GoGenValidator {}

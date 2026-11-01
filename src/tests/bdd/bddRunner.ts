/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BddFeature, FeatureExecutionResult, ScenarioExecutionResult, StepExecutionResult } from './bddTypes.ts';

export class BddRunner {
  static async runFeature(feature: BddFeature): Promise<FeatureExecutionResult> {
    const scenarioResults: ScenarioExecutionResult[] = [];
    let allPassed = true;

    for (const scenario of feature.scenarios) {
      const start = performance.now();
      const stepResults: StepExecutionResult[] = [];
      let scenarioPassed = true;

      for (const step of scenario.steps) {
        try {
          await step.action();
          stepResults.push({
            type: step.type,
            description: step.description,
            passed: true,
          });
        } catch (err: unknown) {
          scenarioPassed = false;
          allPassed = false;
          stepResults.push({
            type: step.type,
            description: step.description,
            passed: false,
            error: err instanceof Error ? err.message : String(err),
          });
          // シナリオ内の以降のステップはスキップ
          break;
        }
      }

      const durationMs = Math.round(performance.now() - start);
      scenarioResults.push({
        id: scenario.id,
        name: scenario.name,
        passed: scenarioPassed,
        durationMs,
        steps: stepResults,
      });
    }

    return {
      id: feature.id,
      title: feature.title,
      passed: allPassed,
      scenarios: scenarioResults,
    };
  }

  static async runAll(features: BddFeature[]): Promise<FeatureExecutionResult[]> {
    const results: FeatureExecutionResult[] = [];
    for (const f of features) {
      const res = await this.runFeature(f);
      results.push(res);
    }
    return results;
  }
}

/**
 * 簡易アサーション関数
 */
export function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual < expected) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== 'number' || actual > expected) {
        throw new Error(`Expected ${actual} to be less than or equal to ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, but got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, but got ${actual}`);
      }
    },
    toContain(item: unknown) {
      if (Array.isArray(actual) && !actual.includes(item)) {
        throw new Error(`Expected array to contain ${JSON.stringify(item)}`);
      }
    },
  };
}

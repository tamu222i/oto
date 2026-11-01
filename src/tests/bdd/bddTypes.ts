/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface BddStep {
  type: 'GIVEN' | 'WHEN' | 'THEN' | 'AND';
  description: string;
  action: () => void | Promise<void>;
}

export interface BddScenario {
  id: string;
  name: string;
  description: string;
  steps: BddStep[];
}

export interface BddFeature {
  id: string;
  title: string;
  userStory: string;
  scenarios: BddScenario[];
}

export interface StepExecutionResult {
  type: 'GIVEN' | 'WHEN' | 'THEN' | 'AND';
  description: string;
  passed: boolean;
  error?: string;
}

export interface ScenarioExecutionResult {
  id: string;
  name: string;
  passed: boolean;
  durationMs: number;
  steps: StepExecutionResult[];
}

export interface FeatureExecutionResult {
  id: string;
  title: string;
  passed: boolean;
  scenarios: ScenarioExecutionResult[];
}

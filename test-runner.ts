/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BddRunner } from './src/tests/bdd/bddRunner.ts';
import { TOWER_BDD_FEATURES } from './src/tests/bdd/towerSpecs.ts';

async function main() {
  console.log('--- Running BDD Test Suite ---');
  const results = await BddRunner.runAll(TOWER_BDD_FEATURES);
  let totalScenarios = 0;
  let passedScenarios = 0;

  for (const feature of results) {
    console.log(`\n[Feature] ${feature.title} - ${feature.passed ? 'PASSED' : 'FAILED'}`);
    for (const scenario of feature.scenarios) {
      totalScenarios++;
      if (scenario.passed) passedScenarios++;
      console.log(`  Scenario: ${scenario.name} [${scenario.passed ? 'OK' : 'FAIL'}] (${scenario.durationMs}ms)`);
      for (const step of scenario.steps) {
        console.log(`    - ${step.type} ${step.description}: ${step.passed ? 'OK' : `FAIL: ${step.error}`}`);
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Total Scenarios: ${totalScenarios}, Passed: ${passedScenarios}`);
  console.log(`========================================\n`);

  if (passedScenarios !== totalScenarios) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

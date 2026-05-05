import { EXPECT_ENUM, WARNING } from '@lib/model';
import {
  addCriticalExpectExpectation,
  addExpectationWithResult,
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  catalogExpectEnumExpectationFactory,
  catalogExpectExpectationFactory,
  catalogExpectSameExpectationFactory,
  checkResultFactory,
  checksExecutionCompletedFactory,
  emptyCheckResultFactory,
  hostFactory,
  withOverriddenValues,
} from '@lib/test-utils/factories';

import CheckResultDetail from './CheckResultDetail';

const clusterHosts = hostFactory.buildList(2);
const [{ id: target1 }, { id: target2 }] = clusterHosts;
const targetType = 'host';

const catalogExpectations = [
  ...catalogExpectExpectationFactory.buildList(5),
  catalogExpectSameExpectationFactory.build(),
  catalogExpectEnumExpectationFactory.build(),
];

const [
  { name: expectationName1 },
  { name: expectationName2 },
  { name: expectationName3 },
  { name: expectationName4 },
  { name: expectationName5 },
  { name: expectationName6 },
  { name: expectationName7 },
] = catalogExpectations;

let checkResult = emptyCheckResultFactory.build({
  targets: [target1, target2],
});

const { check_id: checkID } = checkResult;

checkResult = addPassingExpectExpectation(checkResult, expectationName1);
checkResult = addPassingExpectExpectation(checkResult, expectationName2);
checkResult = addCriticalExpectExpectation(checkResult, expectationName3);
checkResult = addCriticalExpectExpectation(checkResult, expectationName4);
checkResult = addCriticalExpectExpectation(checkResult, expectationName5);
checkResult = addPassingExpectSameExpectation(checkResult, expectationName6);
checkResult = addExpectationWithResult(
  checkResult,
  EXPECT_ENUM,
  expectationName7,
  WARNING
);

const checkResultWithoutValues = withOverriddenValues(checkResult, target1, []);

const executionData = checksExecutionCompletedFactory.build({
  check_results: [checkResultFactory.build(), checkResult],
});

const executionDataWithoutValues = checksExecutionCompletedFactory.build({
  check_results: [checkResultFactory.build(), checkResultWithoutValues],
});

export default {
  title: 'Layouts/CheckResultDetail',
  component: CheckResultDetail,
  argTypes: {
    checkID: {
      description: 'ID of the check to display details for',
      control: { type: 'text' },
    },
    targetID: {
      description: 'ID of the target associated with the check result',
      control: { type: 'text' },
    },
    targetType: {
      description: 'Type of the target (e.g., host, cluster)',
      control: { type: 'text' },
    },
    executionData: {
      description:
        'Data from the checks execution containing results and expectations',
      control: { type: 'object' },
    },
    expectations: {
      description:
        'List of expectations associated with the check results for display',
      control: { type: 'object' },
    },
    severity: {
      description: 'Severity level of the check result',
      control: { type: 'text' },
    },
  },
};

export const Default = {
  args: {
    checkID,
    targetID: target1,
    targetType,
    executionData,
    expectations: catalogExpectations,
  },
};

export const WithoutValues = {
  args: {
    ...Default.args,
    executionData: executionDataWithoutValues,
  },
};

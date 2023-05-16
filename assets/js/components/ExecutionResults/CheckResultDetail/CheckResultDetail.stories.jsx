import {
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  emptyCheckResultFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  checkResultFactory,
  addCriticalExpectExpectation,
  withOverriddenValues,
} from '@lib/test-utils/factories';

import CheckResultDetail from './CheckResultDetail';

const clusterHosts = hostFactory.buildList(2);
const [{ id: target1 }, { id: target2 }] = clusterHosts;
const targetType = 'host';

let checkResult = emptyCheckResultFactory.build({
  targets: [target1, target2],
});

const { check_id: checkID } = checkResult;

checkResult = addPassingExpectExpectation(checkResult);
checkResult = addPassingExpectExpectation(checkResult);
checkResult = addCriticalExpectExpectation(checkResult);
checkResult = addCriticalExpectExpectation(checkResult);
checkResult = addCriticalExpectExpectation(checkResult);
checkResult = addPassingExpectSameExpectation(checkResult, 'expectation_name');

const checkResultWithoutValues = withOverriddenValues(checkResult, target1, []);

const executionData = checksExecutionCompletedFactory.build({
  check_results: [checkResultFactory.build(), checkResult],
});

const executionDataWithoutValues = checksExecutionCompletedFactory.build({
  check_results: [checkResultFactory.build(), checkResultWithoutValues],
});

export default {
  title: 'CheckResultDetail',
  component: CheckResultDetail,
};

export const Default = {
  args: {
    checkID,
    targetID: target1,
    targetType,
    executionData,
    expectations: [],
  },
};

export const WithoutValues = {
  args: {
    ...Default.args,
    executionData: executionDataWithoutValues,
  },
};

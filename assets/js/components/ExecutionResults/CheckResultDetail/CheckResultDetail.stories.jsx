import React from 'react';
import {
  addPassingExpectExpectation,
  addPassingExpectSameExpectation,
  emptyCheckResultFactory,
  hostFactory,
  checksExecutionCompletedFactory,
  checkResultFactory,
  addCriticalExpectExpectation,
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

const executionData = checksExecutionCompletedFactory.build({
  check_results: [checkResultFactory.build(), checkResult],
});

export default {
  title: 'CheckResultDetail',
  component: CheckResultDetail,
  args: {
    checkID,
    targetID: target1,
    targetType,
    executionData,
    expectations: [],
  },
};

export function Default(args) {
  return <CheckResultDetail {...args} />;
}

// SPDX-FileCopyrightText: SUSE LLC
// SPDX-License-Identifier: Apache-2.0

import * as aboutPage from '../pageObject/about_po';

describe('About page', () => {
  before(() => {
    aboutPage.preloadTestData();
  });

  beforeEach(() => {
    aboutPage.visit();
    aboutPage.validateUrl('/about');
  });

  it('should have the correct page title', () => {
    aboutPage.pageTitleIsDisplayed();
  });

  it('should show the correct server version', () => {
    aboutPage.expectedServerVersionIsDisplayed();
  });

  it('should show the Wanda version', () => {
    aboutPage.expectedComponentVersionIsDisplayed('wanda');
  });

  it('should show the Checks version', () => {
    aboutPage.expectedComponentVersionIsDisplayed('checks');
  });

  it('should show the PostgreSQL version', () => {
    aboutPage.expectedComponentVersionIsDisplayed('postgres');
  });

  it('should show the RabbitMQ version', () => {
    aboutPage.expectedComponentVersionIsDisplayed('rabbitmq');
  });

  it('should show the Prometheus version', () => {
    aboutPage.expectedComponentVersionIsDisplayed('prometheus');
  });

  it('should show the github project link', () => {
    aboutPage.expectedGithubUrlIsDisplayed();
  });

  it('should display number of SLES subscriptions found', () => {
    aboutPage.expectedSlesForSapSubscriptionsAreDisplayed(27);
  });

  it('should update number of SLES subscriptions when a host is deregistered', () => {
    aboutPage.apiDeregisterHost();
    aboutPage.visit();
    aboutPage.expectedSlesForSapSubscriptionsAreDisplayed(26);
  });
});

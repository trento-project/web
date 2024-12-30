context('SUSE Manager overviews', () => {
  before(() => {
    cy.preloadTestData();
  });
  describe('navigates and display SUSE Manager based infos', () => {
    it('host is found on SUSE Manager and has vulnerabilities', () => {
      cy.clearSUMASettings();

      cy.saveSUMASettings({
        url: 'https://trento.io',
        username: 'suseManagerAdmin',
        password: 'suseManagerPw',
      });

      // Navigate to vmdrbddev01
      cy.visit('/hosts/240f96b1-8d26-53b7-9e99-ffb0f2e735bf');

      cy.contains('Relevant Patches').parent().should('contain', 2).click();

      cy.contains('Relevant Patches:').should('contain', 'vmdrbddev01');

      cy.contains('SUSE-15-SP4-2024-630')
        .parent()
        .next()
        .should('contain', 'Recommended update for cloud-netconfig');

      cy.contains('SUSE-15-SP4-2024-619')
        .parent()
        .next()
        .should('contain', 'important: Security update for java-1_8_0-ibm');

      cy.contains('Back to Host Details').click();

      cy.contains('Upgradable Packages').parent().should('contain', 2).click();

      cy.contains('elixir-1.15.7-3.x86_64')
        .parent()
        .next()
        .should('contain', 'elixir-1.16.2-1.x86_64')
        .next()
        .contains('SUSE-15-SP4-2024-630')
        .click();

      cy.contains('Synopsis')
        .next()
        .should('contain', 'Security update for java')
        .should('contain', 'Issued')
        .should('contain', '27 Feb 2024')
        .should('contain', 'stable')
        .should('contain', 'Yes')
        .should('contain', 'No');

      cy.contains('Description')
        .next()
        .should('contain', 'Minor security bug fixes');

      cy.contains('Fixes').next().should('contain', 'VUL-0');

      cy.contains('CVEs').next().should('contain', 'SUSE-15-SP4');

      cy.contains('Affected Packages').next().should('contain', 'elixir');
      cy.contains('Affected Systems')
        .next()
        .should('contain', 'vmdrbddev01')
        .should('contain', 'vmdrbddev02');

      cy.clearSUMASettings();
    });

    it('host is not found on SUSE Manager', () => {
      cy.saveSUMASettings({
        url: 'https://trento.io',
        username: 'suseManagerAdmin',
        password: 'suseManagerPw',
      });

      // Navigate to vmdrbddev02
      cy.visit('/hosts/21de186a-e38f-5804-b643-7f4ef22fecfd');

      cy.contains('Relevant Patches')
        .parent()
        .should('contain', 'Host not found in SUSE Manager');
      cy.contains('Upgradable Packages')
        .parent()
        .should('contain', 'Host not found in SUSE Manager');

      cy.clearSUMASettings();
    });
  });
});

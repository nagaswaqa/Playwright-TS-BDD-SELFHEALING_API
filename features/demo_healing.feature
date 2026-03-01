Feature: Self-Healing Demo - Button Click with Recovery

  Background:
    Given I navigate to the demo page

  @demo @healing @smoke
  Scenario: Verify self-healing click on login button
    When I click the login button using self-healing
    Then I should see the success message

  @demo @healing @interactive
  Scenario: Verify login button is visible and enabled
    Then the login button should be visible
    And the login button should be enabled
    And the login button text should be "demoLogin"

  @demo @healing @regression
  Scenario: Verify element state with self-healing
    When I check the login button state with healing
    Then the button state should indicate it is clickable
    And the button should have the correct ID attribute

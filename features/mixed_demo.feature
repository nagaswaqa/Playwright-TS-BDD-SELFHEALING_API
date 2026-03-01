Feature: Mixed UI and API Testing
  As a tester
  I want to perform both UI and API interactions in a single scenario
  So that I can verify end-to-end flows that span across multiple layers

  @mixed @smoke
  Scenario: Hybrid Interaction - UI Navigation and API Validation
    Given I navigate to the demo page
    When I perform a GET request to "https://jsonplaceholder.typicode.com/todos/1"
    Then the API response status should be 200
    And the API response should contain "delectus aut autem"
    And I click the login button with self-healing
    And the success message should be visible

  @mixed @state @sharing
  Scenario: State Sharing - API Data to UI Input
    Given I navigate to the demo page
    When I perform a GET request to "https://jsonplaceholder.typicode.com/todos/2"
    And I extract the field "title" from the API response and save it as "api_title"
    And I enter the saved value "api_title" into the username field
    Then I click the login button with self-healing
    And the success message should be visible

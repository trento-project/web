defmodule TrentoWeb.Auth.AssentSamlStrategyTest do
  @moduledoc false

  alias TrentoWeb.Auth.AssentSamlStrategy

  use ExUnit.Case

  describe "authorize_url/1" do
    test "should return valid authorization url" do
      Application.put_env(:trento, :saml, idp_id: "test-saml", enabled: false)
      assert {:ok, %{url: "/sso/auth/signin/test-saml"}} == AssentSamlStrategy.authorize_url([])
    end
  end

  describe "callback/2" do
    test "should return a normalized user" do
      username = Faker.Internet.user_name()
      email = Faker.Internet.email()
      first_name = Faker.Person.first_name()
      last_name = Faker.Person.last_name()

      assert {:ok,
              %{
                user: %{
                  "sub" => username,
                  "email" => email,
                  "username" => username,
                  "email_verified" => true,
                  "name" => "#{first_name} #{last_name}"
                },
                token: %{}
              }} ==
               AssentSamlStrategy.callback([], %{
                 attributes: %{
                   "username" => username,
                   "email" => email,
                   "firstName" => first_name,
                   "lastName" => last_name
                 }
               })
    end

    test "should raise an error when the user is not authenticated" do
      assert {:error, :user_not_authenticated} ==
               AssentSamlStrategy.callback([], nil)
    end

    test "should raise an error if mandatory attributes are missing" do
      email = Faker.Internet.email()
      first_name = Faker.Person.first_name()
      last_name = Faker.Person.last_name()

      assert {:error, :user_attributes_missing} ==
               AssentSamlStrategy.callback([], %{
                 attributes: %{
                   "email" => email,
                   "firstName" => first_name,
                   "lastName" => last_name
                 }
               })
    end
  end
end

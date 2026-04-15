defmodule TrentoWeb.V1.AIConfigurationJSON do
  def ai_configuration(%{ai_configuration: ai_configuration}),
    do: ai_configuration_entry(ai_configuration)

  def ai_configuration_entry(%{
        provider: provider,
        model: model
      }),
      do: %{
        provider: provider,
        model: model
      }

  def ai_configuration_entry(_), do: nil
end

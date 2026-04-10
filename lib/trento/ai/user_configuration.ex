defmodule Trento.AI.UserConfiguration do
  @moduledoc false

  use Ecto.Schema
  import Ecto.Changeset

  alias Trento.Support.Ecto.EncryptedBinary

  alias Trento.AI.LLMRegistry

  @type t :: %__MODULE__{}

  @primary_key false
  schema "ai_configurations" do
    field :model, :string
    field :provider, Ecto.Enum, values: LLMRegistry.providers()
    # field :provider, :string
    field :api_key, EncryptedBinary, redact: true

    belongs_to :user, Trento.Users.User, primary_key: true

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(ai_configuration, attrs) do
    ai_configuration
    |> cast(attrs, [:user_id, :model, :provider, :api_key])
    |> validate_required([:user_id, :model, :provider, :api_key])
    |> validate_change(:provider, &validate_provider/2)
    |> validate_model()
    |> unique_constraint(:user_id,
      name: :ai_configurations_pkey,
      message: "User already has a configuration"
    )
    |> foreign_key_constraint(:user_id, message: "User does not exist")
  end

  defp validate_provider(_provider_field_atom, provider) do
    if LLMRegistry.provider_supported?(provider) do
      []
    else
      [provider: {"is not supported", validation: :ai_provider_validity}]
    end
  end

  defp validate_model(%{errors: [provider: _]} = changeset), do: changeset

  defp validate_model(changeset) do
    provider = get_field(changeset, :provider)
    model = get_field(changeset, :model)

    changeset
    |> force_change(:model, model)
    |> force_change(:provider, provider)
    |> validate_change(:model, fn _model_atom, _model ->
      model_supported? = LLMRegistry.model_supported?(model)
      model_supported_by_provider? = LLMRegistry.model_supported_by_provider?(model, provider)

      case {model_supported?, model_supported_by_provider?} do
        {true, true} ->
          []

        {true, false} ->
          [
            model:
              {"is not supported by the specified provider",
               validation: :ai_model_provider_mismatch}
          ]

        {false, _} ->
          [model: {"is not supported", validation: :ai_model_validity}]
      end
    end)
  end
end

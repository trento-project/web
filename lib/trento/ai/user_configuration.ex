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
    field :api_key, EncryptedBinary, redact: true

    belongs_to :user, Trento.Users.User, primary_key: true

    timestamps(type: :utc_datetime_usec)
  end

  def changeset(ai_configuration, attrs) do
    updated_attrs = maybe_update_provider(attrs)

    ai_configuration
    |> cast(updated_attrs, [:user_id, :model, :provider, :api_key])
    |> validate_required([:user_id, :model, :api_key])
    |> validate_change(:model, &validate_model/2)
    |> unique_constraint(:user_id,
      name: :ai_configurations_pkey,
      message: "User already has a configuration"
    )
    |> foreign_key_constraint(:user_id, message: "User does not exist")
  end

  defp maybe_update_provider(attrs) do
    case Map.has_key?(attrs, :model) do
      true -> Map.put(attrs, :provider, get_model_provider(attrs))
      false -> attrs
    end
  end

  defp get_model_provider(attrs) do
    attrs
    |> Map.get(:model)
    |> LLMRegistry.get_model_provider()
  end

  defp validate_model(_model_field_atom, model) do
    if LLMRegistry.model_supported?(model) do
      []
    else
      [model: {"is not supported", validation: :ai_model_validity}]
    end
  end
end

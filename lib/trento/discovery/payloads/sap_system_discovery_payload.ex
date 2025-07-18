defmodule Trento.Discovery.Payloads.SapSystemDiscoveryPayload do
  @moduledoc """
  SAP system discovery integration event payload
  """

  alias Trento.Discovery.Payloads.SapSystemDiscoveryPayload.{
    Database,
    Instance,
    Profile
  }

  @unknown_type 0
  @database_type 1
  @application_type 2
  @diagnostics_type 3

  @required_fields [:Id, :SID, :Type, :Profile, :Databases, :Instances]
  @system_types [@unknown_type, @database_type, @application_type, @diagnostics_type]

  use Trento.Support.Type

  deftype do
    field :Id, :string
    field :SID, :string
    field :Type, :integer
    field :DBAddress, :string

    embeds_one :Profile, Profile
    embeds_many :Databases, Database
    embeds_many :Instances, Instance
  end

  def changeset(sap_system, attrs) do
    modified_attrs = databases_to_list(attrs)

    sap_system
    |> cast(modified_attrs, fields())
    |> cast_embed(:Profile,
      with: fn profile, profile_attrs ->
        Profile.changeset(profile, profile_attrs, parse_system_type(modified_attrs))
      end,
      required: true
    )
    |> cast_embed(:Databases)
    |> cast_embed(:Instances)
    |> validate_required_fields(@required_fields)
    |> validate_inclusion(:Type, @system_types)
  end

  defp parse_system_type(%{"Type" => system_type}), do: system_type
  defp parse_system_type(_), do: nil

  defp databases_to_list(%{"Databases" => nil} = attrs),
    do: %{attrs | "Databases" => []}

  defp databases_to_list(attrs), do: attrs

  defmodule Profile do
    @moduledoc """
    Profile field payload
    """

    @application_type 2
    @application_required_fields [:"dbs/hdb/dbname"]

    # Cannot use Trento.Support.Type here, Jason.Encoder is breaking the schema creation
    use Ecto.Schema
    import Ecto.Changeset

    @type t() :: %__MODULE__{}

    @primary_key false

    embedded_schema do
      field :"dbs/hdb/dbname", :string
    end

    def changeset(profile, attrs, type) do
      profile
      |> cast(attrs, __MODULE__.__schema__(:fields))
      |> maybe_validate_required_fields(type)
    end

    defp maybe_validate_required_fields(changeset, @application_type),
      do: validate_required(changeset, @application_required_fields)

    defp maybe_validate_required_fields(changeset, _), do: changeset
  end

  defmodule Database do
    @moduledoc """
    Databases field payload
    """

    @required_fields [:Database]

    use Trento.Support.Type

    deftype do
      field :Host, :string
      field :User, :string
      field :Group, :string
      field :Active, :string
      field :UserId, :string
      field :GroupId, :string
      field :SqlPort, :string
      field :Database, :string
      field :Container, :string
    end

    def changeset(database, attrs) do
      database
      |> cast(attrs, fields())
      |> validate_required_fields(@required_fields)
    end
  end

  defmodule Instance do
    @moduledoc """
    Instances field payload
    """

    alias Trento.Discovery.Payloads.SapSystemDiscoveryPayload.{
      HdbnsutilSRstate,
      SapControl,
      SystemReplication
    }

    @required_fields [:Host, :Name, :Type]

    use Trento.Support.Type

    deftype do
      field :Host, :string
      field :Name, :string
      field :Type, :integer

      embeds_one :SAPControl, SapControl
      embeds_one :SystemReplication, SystemReplication
      embeds_one :HdbnsutilSRstate, HdbnsutilSRstate
    end

    def changeset(instance, attrs) do
      instance
      |> cast(attrs, fields())
      |> cast_embed(:SAPControl, required: true)
      |> cast_embed(:SystemReplication)
      |> cast_embed(:HdbnsutilSRstate)
      |> validate_required_fields(@required_fields)
    end
  end

  defmodule SapControl do
    @moduledoc """
    SAP control field payload
    """

    alias Trento.Discovery.Payloads.SapSystemDiscoveryPayload.{
      SapControlInstance,
      SapControlProcess,
      SapControlProperty
    }

    @required_fields []

    use Trento.Support.Type

    deftype do
      embeds_many :Properties, SapControlProperty
      embeds_many :Instances, SapControlInstance
      embeds_many :Processes, SapControlProcess
    end

    def changeset(sap_control, attrs) do
      hostname = find_property("SAPLOCALHOST", attrs)

      instance_number =
        case find_property("SAPSYSTEM", attrs) do
          instance_number when is_binary(instance_number) -> String.to_integer(instance_number)
          _ -> nil
        end

      sap_control
      |> cast(attrs, fields())
      |> cast_embed(:Properties, required: true)
      |> cast_embed(:Instances,
        with: fn instances, attrs ->
          SapControlInstance.changeset(instances, attrs, hostname, instance_number)
        end,
        required: true
      )
      |> cast_embed(:Processes, required: true)
      |> validate_required_fields(@required_fields)
    end

    defp find_property(property, %{"Properties" => properties}) do
      Enum.find_value(properties, fn
        %{"property" => ^property, "value" => value} -> value
        _ -> nil
      end)
    end

    defp find_property(_, _), do: nil
  end

  defmodule SapControlProperty do
    @moduledoc """
    SAP control property field payload
    """

    @required_fields [:value, :property]

    use Trento.Support.Type

    deftype do
      field :value, :string
      field :property, :string
      field :propertytype, :string
    end

    def changeset(property, attrs) do
      property
      |> cast(attrs, fields())
      |> validate_required_fields(@required_fields)
    end
  end

  defmodule SapControlInstance do
    @moduledoc """
    SAP control instances field payload
    """

    @required_fields [
      :features,
      :hostname,
      :httpPort,
      :dispstatus,
      :instanceNr,
      :startPriority,
      :currentInstance
    ]

    use Trento.Support.Type

    deftype do
      field :features, :string
      field :hostname, :string
      field :httpPort, :integer
      field :httpsPort, :integer

      field :dispstatus, Ecto.Enum,
        values: [
          :"SAPControl-GREEN",
          :"SAPControl-YELLOW",
          :"SAPControl-RED",
          :"SAPControl-GRAY"
        ]

      field :instanceNr, :integer
      field :startPriority, :string
      field :currentInstance, :boolean
    end

    def changeset(instance, attrs, hostname, instance_number) do
      enriched_attrs = enrich_current_instance(attrs, hostname, instance_number)

      instance
      |> cast(enriched_attrs, fields())
      |> validate_required_fields(@required_fields)
    end

    defp enrich_current_instance(%{"currentInstance" => _} = attrs, _, _), do: attrs

    # Keep backward compatibility for older agents that don't send currentInstance
    defp enrich_current_instance(
           %{"hostname" => hostname, "instanceNr" => instance_number} = attrs,
           hostname,
           instance_number
         ),
         do: Map.put(attrs, "currentInstance", true)

    defp enrich_current_instance(attrs, _, _), do: Map.put(attrs, "currentInstance", false)
  end

  defmodule SapControlProcess do
    @moduledoc """
    SAP control process field payload
    """

    @required_fields [
      :pid,
      :name,
      :dispstatus,
      :textstatus,
      :description
    ]

    use Trento.Support.Type

    deftype do
      field :pid, :integer
      field :name, :string
      field :starttime, :string

      field :dispstatus, Ecto.Enum,
        values: [
          :"SAPControl-GREEN",
          :"SAPControl-YELLOW",
          :"SAPControl-RED",
          :"SAPControl-GRAY"
        ]

      field :description, :string
      field :elapsedtime, :string
    end

    def changeset(process, attrs) do
      process
      |> cast(attrs, fields())
      |> validate_required_fields(@required_fields)
    end
  end

  defmodule SystemReplication do
    @moduledoc """
    SystemReplication process field payload
    """

    @required_fields [:local_site_id]

    # Cannot use Trento.Support.Type here, Jason.Encoder is breaking the schema creation
    use Ecto.Schema
    import Ecto.Changeset

    @type t() :: %__MODULE__{}

    @primary_key false

    embedded_schema do
      field :local_site_id, :string
      field :overall_replication_status, :string
      field :"site/1/REPLICATION_MODE", :string
      field :"site/2/REPLICATION_MODE", :string
    end

    def changeset(system_replication, attrs) do
      local_site_id = parse_local_site_id(attrs)

      system_replication
      |> cast(attrs, __MODULE__.__schema__(:fields))
      |> validate_required(@required_fields)
      |> maybe_validate_replication_mode(local_site_id)
    end

    defp parse_local_site_id(%{"local_site_id" => local_site_id}), do: local_site_id
    defp parse_local_site_id(_), do: 1

    defp maybe_validate_replication_mode(changeset, "0") do
      changeset
    end

    defp maybe_validate_replication_mode(changeset, local_site_id) do
      validate_required(changeset, [:"site/#{local_site_id}/REPLICATION_MODE"])
    end
  end

  defmodule HdbnsutilSRstate do
    @moduledoc """
    HdbnsutilSRstate field payload
    """

    @required_fields []

    use Trento.Support.Type

    deftype do
      field :mode, :string
      field :operation_mode, :string
      field :site_name, :string
      field :site_mapping, :map
      field :tier_mapping, :map
    end

    def changeset(sr_state, attrs) do
      site_mapping =
        attrs
        |> Enum.filter(fn {key, _value} ->
          String.starts_with?(key, "siteMapping")
        end)
        |> Enum.into(%{}, fn {key, value} ->
          {value, key |> String.split("/") |> Enum.at(1)}
        end)

      tier_mapping =
        attrs
        |> Enum.filter(fn {key, _value} ->
          String.starts_with?(key, "siteTier")
        end)
        |> Enum.into(%{}, fn {key, value} ->
          {key |> String.split("/") |> Enum.at(1), String.to_integer(value)}
        end)

      sr_state
      |> cast(attrs, fields() -- [:site_mapping, :tier_mapping])
      |> put_change(:site_mapping, site_mapping)
      |> put_change(:tier_mapping, tier_mapping)
      |> validate_required_fields(@required_fields)
    end
  end
end

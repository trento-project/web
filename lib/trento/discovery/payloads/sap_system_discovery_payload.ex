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
    field :Tenant, :string

    embeds_one :Profile, Profile
    embeds_many :Databases, Database
    embeds_many :Instances, Instance
  end

  def changeset(sap_system, attrs) do
    modified_attrs = databases_to_list(attrs)

    sap_system
    |> cast(modified_attrs, fields())
    |> cast_embed(:Profile, required: true)
    |> cast_embed(:Databases)
    |> cast_embed(:Instances)
    |> validate_required_fields(@required_fields)
    |> validate_inclusion(:Type, @system_types)
    |> validate_tenant(modified_attrs)
  end

  defp databases_to_list(%{"Databases" => nil} = attrs),
    do: %{attrs | "Databases" => []}

  defp databases_to_list(attrs), do: attrs

  # Tenant value must exist if a ABAP or J2EE instance are running
  defp validate_tenant(changeset, attrs) do
    is_abap_j2ee_instance =
      changeset
      |> get_embed(:Instances)
      |> Enum.map(fn instance ->
        instance
        |> get_embed(:SAPControl)
        |> get_embed(:Instances)
        |> Enum.find_value(fn
          %Ecto.Changeset{changes: %{features: features, currentInstance: true}, valid?: true} ->
            features

          _ ->
            nil
        end)
      end)
      |> Enum.any?(fn feature -> feature =~ "ABAP" or feature =~ "J2EE" end)

    changeset
    |> maybe_fallback_dbname(attrs, is_abap_j2ee_instance)
    |> maybe_validate_tenant_required(is_abap_j2ee_instance)
  end

  # Make discovery backward compatible for agents that don't send the Tenant field
  defp maybe_fallback_dbname(changeset, _attrs, false), do: changeset
  defp maybe_fallback_dbname(changeset, %{"Tenant" => _}, true), do: changeset

  defp maybe_fallback_dbname(changeset, _attrs, true) do
    dbname =
      changeset
      |> get_embed(:Profile)
      |> get_field(:"dbs/hdb/dbname")

    put_change(changeset, :Tenant, dbname)
  end

  defp maybe_validate_tenant_required(changeset, true),
    do: validate_required(changeset, :Tenant, message: "can't be blank in a ABAP/J2EE instance")

  defp maybe_validate_tenant_required(changeset, false), do: changeset

  defmodule Profile do
    @moduledoc """
    Profile field payload
    """

    # Cannot use Trento.Support.Type here, Jason.Encoder is breaking the schema creation
    use Ecto.Schema
    import Ecto.Changeset

    @type t() :: %__MODULE__{}

    @primary_key false

    embedded_schema do
      field :"dbs/hdb/dbname", :string
    end

    def changeset(profile, attrs) do
      cast(profile, attrs, __MODULE__.__schema__(:fields))
    end
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
    end

    def changeset(instance, attrs) do
      instance
      |> cast(attrs, fields())
      |> cast_embed(:SAPControl, required: true)
      |> cast_embed(:SystemReplication)
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
end

# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0

defmodule Trento.Repo.Migrations.RenameHealthToStatusInstanceReadModel do
  use Ecto.Migration

  def up do
    rename table("application_instances"), :health, to: :status
    rename table("database_instances"), :health, to: :status

    execute """
    UPDATE application_instances
    SET status = CASE status
      WHEN 'passing'  THEN 'green'
      WHEN 'warning'  THEN 'yellow'
      WHEN 'critical' THEN 'red'
      WHEN 'unknown'  THEN 'gray'
      ELSE status
    END;
    """

    execute """
    UPDATE database_instances
    SET status = CASE status
      WHEN 'passing'  THEN 'green'
      WHEN 'warning'  THEN 'yellow'
      WHEN 'critical' THEN 'red'
      WHEN 'unknown'  THEN 'gray'
      ELSE status
    END;
    """
  end

  def down do
    execute """
    UPDATE application_instances
    SET status = CASE status
      WHEN 'green'  THEN 'passing'
      WHEN 'yellow'  THEN 'warning'
      WHEN 'red' THEN 'critical'
      WHEN 'gray'  THEN 'unknown'
      ELSE status
    END;
    """

    execute """
    UPDATE database_instances
    SET status = CASE status
      WHEN 'green'  THEN 'passing'
      WHEN 'yellow'  THEN 'warning'
      WHEN 'red' THEN 'critical'
      WHEN 'gray'  THEN 'unknown'
      ELSE status
    END;
    """

    rename table("application_instances"), :status, to: :health
    rename table("database_instances"), :status, to: :health
  end
end

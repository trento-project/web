#!/bin/sh
# SPDX-FileCopyrightText: SUSE LLC
# SPDX-License-Identifier: Apache-2.0


echo -n "starting prometheus seed using /container_init/prometheus_snap.tar.xz"

tar -xvf /container_init/prometheus_snap.tar.xz -C /prometheus

echo -n "starting prometheus will the provided arguments"

exec /bin/prometheus $@


# Trento Checks DSL Specification

## Foreword
The need this DSL aims to fulfill is to provide users a simple way to declare what we (the Trento Core Team) often refer to as "checks". Checks are, in Trento's domain, the crystallization of SUSE's best practices when it comes to SAP clusters configuration in a form that both a man and a machine can read.

We get several benefits from this approach:

- Humans can formalize best practices with no space for ambiguity;
- Machines can assert systems' state, automatically, with no space for ambiguity;
- The development of new best practices gets streamlined through a common definition that allows to firestart shared efforts.

## Facts
Fact declaration and gathering revolves all around the concept of _gatherer_. Gatherers are functions directly built inside the interpretation level of the language, and reflect the various types of information that the platform can discover on the hosts, and on a given cluster. Examples include (but are not limited to) installed packages, open ports, and configuration files' content. Gathered facts can be matched against values inside expectations, using the name that we give them inside the fact declaration.

A fact gathering declaration contains:

- The fact name;
- The pre-defined gatherer function used for this fact;
- The parameter that said function declaration accepts.

## Expectations
Once that facts are evaluated, they get assigned to names and they can be matched against expectations. Expectations formalize a predetermined assumption that a given fact declaration matches what the user wants it to be. The match declaration can be whatever the user wants in the span of what the language itself allows.

For numeric values, we aim to support:

- strict equality;
- checking if the matched value is greater than a provided value;
- checking if the matched value is lower than a provided value.

For string values, we aim to support:

- strict equality;
- checking if the matched value contains a provided string.

## Example of a check

```yml
check_corosync_token_timeout:
  id: 156F64
  name: Corosync configuration file
  group: Corosync
  description: |
    Corosync `token` timeout is set to `{{ platform.corosync.expectedTokenTimeout }}`
  remediation: |
    ## Abstract
    The value of the Corosync `token` timeout is not set as recommended.
    ## Remediation
    ...
  facts:
    -
      name: corosync_token_timeout
      gatherer: corosync
      arguments: totem.token
    -
      name: some_other_fact_useful_for_this_check
      gatherer: another_reference_to_a_gatherer
      argument: something_else
  expectations:
    -
      name: corosync_token_timeout
      value: 80
```

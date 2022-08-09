# Kaholo Pipeline Executer Plugin
This plugin provides a Pipeline Action that triggers other Kaholo Pipelines, i.e. causes them to be run. The plugin also includes optional inputs for the pipeline being triggered, selection of a configuration, and can wait for the triggered pipeline to complete execution before continuing.

This allows for the chaining of Kaholo Pipelines, including conditional execution based on the results of upstream and downstream pipelines. For example a suite of automated tests could be orchestrated such that the entire suite could be run nightly using Kaholo scheduling, but any individual could trigger specific parts or individual pipelines in that test suite manually on demand, or when related code is checked into the version control system.

## Access and Authentication
In Kaholo's Settings | Identity and Access Management (IAM) | Users, create a user of type "Service Account". Every service account is given a Token (JWT). This token is required as parameter to execute other pipelines, and is subject to access management via groups and policies just as any other Kaholo user account.

## Plugin Installation
For download, installation, upgrade, downgrade and troubleshooting of plugins in general, see [INSTALL.md](./INSTALL.md).

## Plugin Settings
Plugin settings act as default parameter values. If configured in plugin settings, the action parameters may be left unconfigured. Action parameters configured anyway over-ride the plugin-level settings for that Action.

The only default the Pipeline Executer plugin has is the Default Access Token. If you configure this setting, every Pipeline Executor Action will have the Token parameter conveniently preconfigured with this default.

## Method Execute Pipeline
The only method of this plugin is method "Execute Pipeline". It takes the following parameters.
* Token - the JWT token provided with the Kaholo service account that has Access to trigger other pipelines. The token is stored in the Kaholo vault so it never appears in the UI, logs, or error messages.
* Pipeline - the other Kaholo pipeline you wish to trigger with the Action
* Configuration Name - the configuration name with which to run the other Pipeline
* Configuration Object - the custom configuration object in JSON with which to run the other Pipeline
* Trigger Reason - a text annotation that appears as the triggering reason in the execution that is triggered. For example "Triggered by pipeline service bus integration test".
* Execution Inputs - these are key=value pairs that are passed to the pipeline being triggered. For this to work, inputs must be configured on the "Inputs" page of the target pipeline. Parameters of that pipeline can then use the inputs by enabling Code and accessing object `kaholo.execution.inputs.<InputId>`, where `<InputId>` is the ID of the input configured for that pipeline. These are entered in the parameter one pair per line, for example:

      config=test
      loglevel=low
      mode=prod

* Wait Until Pipeline Ends - if selected, the Action will wait until the triggered pipeline finishes and then display the results of that execution in Final Result for the Action. If not, the pipeline moves onto the next action without delay.
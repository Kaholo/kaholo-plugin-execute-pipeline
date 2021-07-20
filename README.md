# kaholo-plugin-execute-pipeline
Pipeline(Map) execuation plugin for Kaholo.

## Method Execute Pipeline
Execute the specified kaholo pipeline.

### Parameters
1. Pipeline (Auto Complete) **Required** - Pipeline to execute.
2. Configuration (string/object) **Optional** - Configurations to run the pipeline with. Can be passed either as string or as an object. Default is empty configurations.
3. Agents (String) **Optional** - Agents to execute the pipeline on. Can enter multiple values by seperating the values with commas.
4. Trigger Reason (String) **Optional** - The reason that the pipeline was executed/triggered to attach to the execution details. Default is: "Started by map-executer plugin".

# kaholo-plugin-execute-map
Map execuation plugin for Kaholo.

## Method Execute Map
Execute the specified kaholo map.

### Parameters
1. Pipeline (Auto Complete) **Required** - Pipeline to execute.
2. Configuration (string/object) **Optional** - Configurations to run the map with. Can be passed either as string or as an object. Default is empty configurations.
3. Agents (String) **Optional** - Agents to execute the map on. Can enter multiple values by seperating the values with commas.
4. Trigger Reason (String) **Optional** - The reason that the map was executed/triggered to attach to the execution details. Default is: "Started by map-executer plugin".

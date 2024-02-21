# ai-actions

## 0.3.3

### Patch Changes

- fb9c0ec: Added both unparsed and parsed arguments to the caller results (successes and errors)

## 0.3.2

### Patch Changes

- ba644e5: Added ability to pass an ID alongside TActionCallerInput

## 0.3.1

### Patch Changes

- 4bcc45c: Optimize setup action caller types to avoid recursion errors.

## 0.3.0

### Minor Changes

- 16baf06: New helper methods `setupActionCaller` and `setupFunctionCalling`

### Patch Changes

- 6fd18a6: fixed bug where metadata couldn't be omitted from the object

## 0.2.1

### Patch Changes

- ffc6b79: Fixed bug where the output type of the action function wasn't correct on a GET action

## 0.2.0

### Minor Changes

- 620a9ac: New `generateActionRegistryFunctions` helper function that makes the `createAction` and `createActionRegistry` based on a namespace

## 0.1.1

### Patch Changes

- f813284: Initial publish to npm

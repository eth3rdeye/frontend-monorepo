---
sidebar_position: 1
sidebar_label: System Overview
---

# System Overview

The following pages will help you to understand:

- The different types of users
- How the smart contract works
- How the app works

## Sessions

The system logic revolves around the concept of a `Session`. A Session can be considered a single test or game, and there are multiple Sessions stored in the smart contract.

A `Session` consists of the following variables. These variables will be explained in detail in the following sections and pages.

```sol title="contracts/src/structs.sol"
struct Session  {
  bytes32 targetCommitment;
  string target;
  uint startedAt;
  address tasker;
}
```

## User Types

### Tasker
These users create one or more `Session`s. They choose the `target` word, and later reveal it after predictions have been submitted.

### Viewer
The `Viewer` is the user who uses psychic intuition to guess the contents of the secret `target` for a particular session.
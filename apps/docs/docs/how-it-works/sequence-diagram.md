---
sidebar_position: 3
sidebar_label: Sequence Diagrams
---

# Sequence Diagrams

These diagrams show the sequence of entities and steps in a visual format.

![Image of Eth3rdWorkflow](/img/tutorial/Eth3rdEye.svg)

This diagram was created using the following text at [SequenceDiagram.org](https://sequencediagram.org)


```
title Eth3rdEye

actor Tasker
actor Psychic

Tasker->Frontend: Select secret target
note over Frontend: Create salt and \ntarget commitment
Frontend->Eth3rdEye.sol: Invoke\ncreateSession
note over Eth3rdEye.sol: Save Session
Psychic->Eth3rdEye.sol: Invoke\nsubmitPrediction

Tasker->Eth3rdEye.sol: Invoke\nrevealTarget
note over Eth3rdEye.sol: Check target\nmatches commitment
note over Eth3rdEye.sol: Save target in Session
Psychic->Eth3rdEye.sol: Invoke\nclaimAccuracy
note over Eth3rdEye.sol: Check prediction\nmatches target
note over Eth3rdEye.sol: Save accuracy
```
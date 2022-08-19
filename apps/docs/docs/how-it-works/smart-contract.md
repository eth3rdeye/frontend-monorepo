---
sidebar_position: 2
sidebar_label: Smart Contract
---

# Eth3rdEye.sol

This page will go through the smart contract to help understand how the logic works. It's written to remain accessible to a wide audience to maintain transparency and confidence in the system.

:::tip
Blockchain technical terms are hyperlinked to the [glossary](/docs/glossary)
:::

## Commit-reveal scheme
The smart contract logic follows a process known as a commit-reveal scheme. The commit-reveal is a sequenced order of operations that ensures the integrity of a value is maintained, and in our case kept secret, up until a specific step (the reveal stage). Predictably, the operations are:

1. Commit
2. Reveal

In the case of Eth3rdEye, the commitment step consists of calculating the output of a [hash-function](/docs/glossary#hash-functions) using two values as the input: 

- the **target**. In the first phase, the target is selected from a list of 7 words.
- another secret known as the **salt**. This is a series of random letters and numbers that are hard to guess, like `34dp9Mdal6`.

Thus, the `targetCommitment` that is saved in the `Session` can be defined mathematically as `hash(target,salt)`. The resulting output of this function is used by a `Tasker` to start a session.

:::info
As an end user, you do not need to know to calculate the output of the hash function, or need to worry about creating a salt. The front-end website will guide you and perform the work necessary behind-the-scenes.
:::


## Contract Storage
```solidity
  // Session management
  mapping(uint16 => Session) sessionsById;
  uint16 public lastSessionIndex;
  mapping(bytes32 => string) public predictions;

  // Accuracy management
  mapping(address => uint32) public accuracy;
  mapping(address => uint32) public attempts;
```

## Starting a session

A [`Tasker`](/docs/system-overview#tasker) is responsible for creating

```solidity title="contracts/src/Eth3rdEye.sol"
  function startSession( uint16 sessionIndex, bytes32 commitment ) public {
    uint16 nextIndex = lastSessionIndex + 1;

    require( nextIndex == sessionIndex, "Unexpected session index" );
    require( sessionsById[sessionIndex].targetCommitment == 0, "Session already started" );

    string memory emptyTarget = "";
    Session memory s = Session(commitment, emptyTarget, block.timestamp, msg.sender);

    sessionsById[sessionIndex] = s;
    lastSessionIndex = sessionIndex;
  }
```
`  function startSession( uint16 sessionIndex, bytes32 commitment ) public {`

The `sessionIndex` is a number which indicates what session the function applies to. The `commitment`
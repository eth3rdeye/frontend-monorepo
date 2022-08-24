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
The smart contract logic follows a process known as a commit-reveal scheme. The commit-reveal is a sequenced order of operations that ensures the integrity of a value is maintained, and in our case kept secret, up until a specific step (the reveal stage). [View diagram of commit-reveal sequence](/docs/how-it-works/sequence-diagram)

In the case of Eth3rdEye, the commitment step consists of calculating the output of a [hash-function](/docs/glossary#hash-functions) using two values as the input: 

- the **target**. In the first version, the target is selected from a list of 7 words/phrases.
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

The [`Tasker`](/docs/how-it-works/system-overview#tasker) is responsible for selecting a secret value. The `sessionIndex` identifies a session. The front-end will create the salt and hash the target to create the `targetCommitment`. Both of these are provided as arguments to the `createSession` function.

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
A new `Session` is created and saved to the `sessionsById` mapping. The `Session` contains the following variables:
- `commitment` to store the target commitment
- a placeholder to store the revealed target. At this stage, an empty target string `""` is set.
- the `block.timestamp` to enable time-based logic
- the `msg.sender` is the address of the wallet which invoked this transaction. This is how the `Tasker` of the `Session` is saved.
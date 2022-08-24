---
sidebar_position: 2
sidebar_label: Smart Contract
---

# Eth3rdEye.sol

This page will go through the smart contract to help understand how the logic works. It's written to remain accessible to a wide audience to maintain transparency and confidence in the system.

:::info Open-Source
The source code for the smart contract is open-source and can be viewed within the Eth3rdEye Github repository [here](https://github.com/eth3rdeye/contracts/blob/main/src/Eth3rdEye.sol)
:::

:::tip
Blockchain technical terms are hyperlinked to the [glossary](/docs/glossary)
:::

## Commit-reveal scheme
The smart contract logic follows a process known as a commit-reveal scheme. The commit-reveal is a sequenced order of operations that ensures the integrity of a value is maintained, and in our case kept secret, up until a specific step (the reveal stage). 

<details>

<summary>View sequence diagram of commit-reveal scheme</summary>

![Image of Eth3rdWorkflow](/img/tutorial/Eth3rdEye.svg)

</details>

In the case of Eth3rdEye, the commitment step consists of calculating the output of a [hash function](/docs/glossary#hash-functions) using two values as the input: 

- the **target**. In the first version, the target is selected from a list of 7 words/phrases.
- another secret known as the **salt**. This is a series of random letters and numbers that are hard to guess, like `34dp9Mdal6`.

Thus, the `targetCommitment` that is saved in the `Session` can be defined mathematically as `hash(target,salt)`. The resulting output of this function is used by a `Tasker` to start a session.

:::info
As an end user, you do not need to know to calculate the output of the hash function, or need to worry about creating a salt. The front-end website will guide you and perform the work necessary behind-the-scenes.
:::


## Contract Storage
These are the main storage variables used in the contract. With these 5 variables, it is possible to create multiple `Session`s, keep track of predictions, and keep track of attempts and accuracy. These variables will be referenced throughout the following sections.
<details>
<summary>View code</summary>

```solidity
  // Session management
  mapping(uint16 => Session) sessionsById;
  uint16 public lastSessionIndex;
  mapping(bytes32 => string) public predictions;

  // Accuracy management
  mapping(address => uint32) public accuracy;
  mapping(address => uint32) public attempts;
```

</details>


## Starting a session

The [`Tasker`](/docs/how-it-works/system-overview#tasker) is responsible for selecting a secret value (the "target"). The front-end will create the salt and hash the target to create the `targetCommitment`. This is provided as an argument to the `startSession` function, along with a `sessionIndex` to distinguish this session from other sessions.

<details>
<summary>View code</summary>

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
</details>


A new `Session` is created and saved to the `sessionsById` storage mapping, using the `sessionIndex` as the key. The `Session` contains the following variables:
- `commitment` to store the target commitment
- a placeholder to store the revealed target. At this stage of the commit-reveal, an empty target string `""` is set.
- the `block.timestamp` to enable time-based logic
- the `msg.sender` is the address of the wallet which invoked this transaction. This is how the `Tasker` of the `Session` is saved.

A new `sessionIndex` is also saved, so that the smart contract and front-end can keep track of the total count and latest id across all Sessions.

## Submit Prediction

In summary, the `Tasker` has created a target, with only the `commitment` being saved on-chain. The target is not visible publicly, because what is saved is the output of `hash(target,salt)`, and only the Tasker can access or knows these two values. This commitment ensures that the target cannot be changed after the fact, which essentially means it is "locked-in".

`Psychic` users are now able to invoke the `submitPrediction` smart contract function.

<details>
<summary>View code</summary>

```solidity
  function submitPrediction(uint16 sessionIndex, string calldata prediction) public {

    bytes32 predictionKey = keccak256(abi.encode(sessionIndex, msg.sender));

    predictions[predictionKey] = prediction;

    attempts[msg.sender]++;
  }
```
</details>
There are only 3 lines so let's go through each one:

`bytes32 predictionKey = keccak256(abi.encode(sessionIndex, msg.sender));`

This creates a unique key by hashing the `sessionIndex` and the address of the wallet that invoked the call. `keccak256` is the name of a hash function available in the Solidity programming language. This unique key allows for the same address to submit multiple predictions across multiple sessions. Changing even one character or letter in a [hash function](/docs/glossary#hash-function) will produce an entirely different output. So each session will have a different key, even for the same user. In other words, it's a way to combine the `sessionIndex` and `msg.sender` into a single value.

`predictions[predictionKey] = prediction;`

Using this unique session key, we can save the provided `prediction` for the user in the `predictions` storage mapping.

`attempts[msg.sender]++;`

Finally, we increment the counter for the number of attempts for the user. This counter is global across all Sessions.

## Reveal Target
<details>
<summary>View code</summary>

```solidity
  function revealTarget(uint16 sessionIndex, string calldata salt, string calldata target) public {
    Session storage s = sessionsById[sessionIndex];

    require( s.tasker == msg.sender, "Only the tasker can reveal target" );

    bytes32 calculatedCommitment = keccak256(abi.encode(salt, target));

    require( s.targetCommitment == calculatedCommitment, "Target commitments must match" );
    
    // Save the target
    s.target = target;
  }
```
</details>
At this stage, one or many predictions have been submitted. The contract retrieves the previously saved `Session` object in this line: 

`Session storage s = sessionsById[sessionIndex];`

The contract then ensures that only the `Tasker` can invoke this function. In Solidity, a `require` is a logical assertion that must resolve to true, or the contract call will fail. The assertion here is `s.tasker == msg.sender`, meaning calling this function with any other wallet address will fail, except for the original `Tasker`.

`require( s.tasker == msg.sender, "Only the tasker can reveal target" );`

The contract function receives as arguments the `salt` and the `target`. In this next line, the expected commitment of these two values is  calculated.

`bytes32 calculatedCommitment = keccak256(abi.encode(salt, target));`

Another assertion ensures that the commitment provided to the initial `startSession` call matches the calculated commitment. This ensures that the target has not changed.

`require( s.targetCommitment == calculatedCommitment, "Target commitments must match" );`

The smart contract logic can now be sure that the target provided is the same one used in the session by the original `Tasker`. The target secret has been "revealed" publicly, and can now be saved in the Session.

`s.target = target;`

## Claim Accuracy

<details>
<summary>View code</summary>

```
  function claimAccuracy(uint16 sessionIndex, string calldata prediction ) public {

    bytes32 predictionKey = keccak256(abi.encode(sessionIndex, msg.sender));
    string memory predictionValue = predictions[predictionKey];
    
    bool predictionCommitmentMatch = bool(keccak256(abi.encode(prediction)) == keccak256(abi.encode(predictionValue)));
    require( predictionCommitmentMatch, "Cannot claimAccuracy with differing commitments" );
    Session memory s = sessionsById[sessionIndex];

    require( bytes(s.target).length != 0, "Target not revealed");

    bool targetsMatch = keccak256(abi.encode(prediction)) == keccak256(abi.encode(s.target));
    
    if(targetsMatch){
      accuracy[msg.sender]++;
    }
  }
```
</details>

The function `claimAccuracy` is invoked by the `Psychic` after the target has been revealed. An assertion ensures that the provided prediction by the psychic matches the same valued provided and saved in the `submitPrediction` function.

If the `prediction` matches the target, the on-chain accuracy of the `Psychic`s wallet address is incremented using the code `accuracy[msg.sender]++;`. Like `attempts`, the `accuracy` value is global across all sessions and is associated to the wallet address of the Psychic user.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract TOEFLRecord is Ownable {
  error RecordAlreadyExists(bytes32 hash);

  event RecordStored(address indexed sender, bytes32 indexed hash, string cid);

  mapping(bytes32 => string) private records;

  constructor() Ownable(msg.sender) {}

  function store(bytes32 hash, string calldata cid) external onlyOwner {
    if (bytes(records[hash]).length != 0) {
      revert RecordAlreadyExists(hash);
    }
    records[hash] = cid;
    emit RecordStored(msg.sender, hash, cid);
  }

  function getRecord(bytes32 hash) external view returns (string memory) {
    return records[hash];
  }

  function exists(bytes32 hash) external view returns (bool) {
    return bytes(records[hash]).length > 0;
  }
}

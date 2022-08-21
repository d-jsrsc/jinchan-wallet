const { Buffer } = require('buffer');
const base58 = require('bs58');
const { Message, PublicKey } = require('@solana/web3.js');
const { decodeTokenInstruction, TOKEN_PROGRAM_ID } = require('@project-serum/token');
var a =
  '7HigsMcj71AXjv6NrsGxpHRXqDNuEgLpk826ytTX8PQyEZkdt3hSjZB88a3LKnva8VdnygH7wDqEZjNVqweqe1wFuZdMNhZia4tmygtj7Kxxy3TVYyvpPvYA4m4xAavYQX7KWWjwDf5M67iNatNnovL2qfB2g7SJx8vG7Dx2fXWQD8rme9mza7VF6LKHu1UCgqZeHFWH2wgCkQQBhT93w34JBvPQ8JSoSg5zkujzFwLHprXtcrdKd';

// console.log(base58.decode('3DdGGhkhJbjm'));

// console.log(base58.decode('3Bxs411Dtc7pkFQj'));

const dataBuf = base58.decode(a);
console.log(dataBuf.toString());
console.log(Message.from(dataBuf));

const transactionMessage = Message.from(dataBuf);

const transactionInstruction = transactionMessage.instructions[0];
const accountKeys = transactionMessage.accountKeys;

handleTokenInstruction(
  new PublicKey('3112ASdPyfQFAvoyatxRdUrhe6MwN3TrWzxiBia6UdqA'),
  transactionInstruction,
  accountKeys
);

function handleTokenInstruction(publicKey, instruction, accountKeys) {
  const { programIdIndex, accounts, data } = instruction;
  if (!programIdIndex || !accounts || !data) {
    return;
  }

  // construct token instruction
  const tokenInstruction = {
    programId: accountKeys[programIdIndex],
    keys: accounts.map((accountIndex) => ({
      pubkey: accountKeys[accountIndex]
    })),
    data: Buffer.from(base58.decode(data))
  };

  console.log('tokenInstruction', tokenInstruction);

  const decoded = decodeTokenInstruction(tokenInstruction);

  return {
    type: decoded.type,
    data: decoded.params
  };
}

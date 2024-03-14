import {
  Coins,
  Db,
  LCDClient,
  MnemonicKey,
  Numeric,
} from "@glitterprotocol/glitter-sdk";
import { useEffect, useState } from "react";

const XIAN_HOST = "https://api.xian.glitter.link";
const CHAIN_ID = "xian";
const mnemonicKey =
  "lesson police usual earth embrace someone opera season urban produce jealous canyon shrug usage subject cigar imitate hollow route inhale vocal special sun fuel";

const useDbClient = () => {
  const [dbClient, setDbClient] = useState<Db>();

  useEffect(() => {
    if (!dbClient) {
      const client = new LCDClient({
        URL: XIAN_HOST,
        chainID: CHAIN_ID,
        gasPrices: Coins.fromString("0.15agli"),
        gasAdjustment: Numeric.parse(1.5),
      });

      const key = new MnemonicKey({
        mnemonic: mnemonicKey,
        account: 0,
        index: 0,
      });

      setDbClient(client.db(key));
    }
  }, [dbClient]);

  return dbClient;
};

export default useDbClient;

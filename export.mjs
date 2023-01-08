import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });

import { Client, PrivateKey, ThreadID } from '@textile/hub';
import Redis from "ioredis";
import { MongoClient } from 'mongodb';

import { prettyDate, bfjStringify, saveToFile } from './utils.mjs';

const { TEXTILE_PK, TEXTILE_HUB_KEY_DEV, MONGODB_URI, TEXTILE_THREADID, NFTSTORAGE_KEY, PINATA_API_KEY, PINATA_API_SECRET, REDIS_CONNECTION} = process.env;

const getClient = async () =>{

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;

}

const getData = async () =>{
    const threadClient = await getClient();
    const threadId = ThreadID.fromString(TEXTILE_THREADID);
    console.log('Getting Data');
    let snapshot = await threadClient.find(threadId, 'bridge', {});
    console.log('Stringifying Data');
    snapshot = await bfjStringify(snapshot);
    return snapshot;
}

async function runPipeline(){
    let stringified = await getData();
    let fn = `${prettyDate()}.json`;
    let storeRes = await saveToFile(fn, stringified);
    console.log(storeRes);
    process.exit(0);
}

runPipeline();

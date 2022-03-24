import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });

import { Client, PrivateKey, ThreadID } from '@textile/hub';
import Redis from "ioredis";
import { MongoClient } from 'mongodb';

import { prettyDate, bfjStringify, saveToFile } from './utils.mjs';
import { storeOnNftStorage } from './adaptors/nftstorage.mjs';
import { pinToInfura } from './adaptors/infura.mjs';
import { pinToCrust } from './adaptors/crust.mjs';

const { CHAINSAFE_STORAGE_API_KEY, TEXTILE_PK, TEXTILE_HUB_KEY_DEV, MONGODB_URI, TEXTILE_THREADID, NFTSTORAGE_KEY, PINATA_API_KEY, PINATA_API_SECRET, REDIS_CONNECTION} = process.env;

const getClient = async () =>{

    const identity = PrivateKey.fromString(TEXTILE_PK);
    const client = await Client.withKeyInfo({
        key: TEXTILE_HUB_KEY_DEV,
        debug: true
    })
    await client.getToken(identity);
    return client;

}

async function getRedisData() {

    let promise = new Promise((res) => {

        let client = new Redis(REDIS_CONNECTION);
        client.keys('*').then((data)=>{

            let recObj = client.multi();
            for (let index = 0; index < data.length; index++) {
                recObj = recObj.get(data[index])
            }
            recObj.exec((err, results) => {
                let db = {}
                for (let i = 0; i < results.length; i++) {
                    db[data[i]] = results[i][1]
                }
                client.quit();
                res(db);
            });

        });

    })
    let result = await promise;
    return result;

}

const getAllTrustScoreData = async () => {

    const client = await MongoClient.connect(MONGODB_URI);
    let db = client.db('convo');
    let coll = db.collection('cachedTrustScores');
    // TODO: stream the data for mongdb and possibly strinfy on the fly.
    let completeData = await coll.find().toArray();

    return completeData;

}

const getData = async () =>{
    // const threadClient = await getClient();
    // const threadId = ThreadID.fromString(TEXTILE_THREADID);

    // let snapshot_comments = await threadClient.find(threadId, 'comments', {});
    // console.log("🟡 snapshot.comments");
    // let snapshot_threads = await threadClient.find(threadId, 'threads', {});
    // console.log("🟡 snapshot.threads");
    // let snapshot_addressToThreadIds = await threadClient.find(threadId, 'addressToThreadIds', {});
    // console.log("🟡 snapshot.addressToThreadIds");
    // let snapshot_cachedTrustScores = await getAllTrustScoreData();
    // console.log("🟡 snapshot.cachedTrustScores");
    // let snapshot_bridge = await threadClient.find(threadId, 'bridge', {});
    // console.log("🟡 snapshot.bridge");
    // let redis_data = await getRedisData();
    // console.log("🟡 snapshot.redis_data");

    // return {
    //     snapshot_comments,
    //     snapshot_threads,
    //     snapshot_addressToThreadIds,
    //     snapshot_cachedTrustScores,
    //     snapshot_bridge,
    //     redis_data
    // };

    return {
        hello: 'world'
    }
}

async function runPipeline(){
    let data = await getData();
    let stringified = await bfjStringify(data);
    let fn = `${prettyDate()}.json`;
    let storeRes = await saveToFile(fn, stringified);

    if (storeRes.success === true) {
        let nftStorageResp = await storeOnNftStorage(stringified);
        if (nftStorageResp.slice(0, 3) === 'baf'){
            console.log('🟢 NFT.Storage Backup Successful');

            await pinToInfura(ipfsHash);
            await pinToCrust(ipfsHash);
        }
    }
    else {
        console.error('File Storage Error', storeRes?.error);
    }

    process.exit(0);
}

runPipeline();

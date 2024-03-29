import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' });

import Redis from "ioredis";
import { MongoClient } from 'mongodb';

import { prettyDate, bfjStringify, saveToFile } from './utils.mjs';
import { storeOnNftStorage } from './adaptors/nftstorage.mjs';
import { pinToPinata } from './adaptors/pinata.mjs';
import { storeOnChainsafeStorage } from './adaptors/chainsafe.mjs';
import { storeOnFleekStorage } from './adaptors/fleekstorage.mjs';
import { storeOnFilebase } from './adaptors/filebase.mjs';
import { storeOnWeb3Storage } from './adaptors/web3storage.mjs';

const { MONGODB_URI, REDIS_CONNECTION} = process.env;

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

const getAllCollectionData = async (collectionName = "") => {

    const client = await MongoClient.connect(MONGODB_URI);
    let db = client.db('convo');
    let coll = db.collection(collectionName);
    let completeData = await coll.find().toArray();

    return completeData;

}

const getData = async () =>{

    let snapshot_comments = await getAllCollectionData('comments');
    console.log("🟢 snapshot.comments");
    let snapshot_threads = await getAllCollectionData('threads');
    console.log("🟢 snapshot.threads");
    let snapshot_addressToThreadIds = await getAllCollectionData('addressToThreadIds');
    console.log("🟢 snapshot.addressToThreadIds");
    // let snapshot_cachedTrustScores = await getAllTrustScoreData();
    // console.log("🟢 snapshot.cachedTrustScores");
    let snapshot_bridge = await getAllCollectionData('bridge');
    console.log("🟢 snapshot.bridge");
    let redis_data = await getRedisData();
    console.log("🟢 snapshot.redis_data");

    return {
        snapshot_comments,
        snapshot_threads,
        snapshot_addressToThreadIds,
        // snapshot_cachedTrustScores,
        snapshot_bridge,
        redis_data
    };

    // return {
    //     hello: 'world'
    // }
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
            await pinToPinata(nftStorageResp);
        }

        await storeOnChainsafeStorage(fn, storeRes.path);
        await storeOnFilebase(fn, storeRes.path);
        await storeOnWeb3Storage(fn, stringified);
        await storeOnFleekStorage(fn, storeRes.path);
    }
    else {
        console.error('File Storage Error', storeRes?.error);
    }

    process.exit(0);
}

runPipeline();

import pkg from 'aws-sdk';
const { S3 } = pkg;

import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { FILEBASE_API_KEY, FILEBASE_API_SECRET } = process.env;

async function putOnFilebase(bucket, fn, stream) {

    let promise = new Promise(async (res, rej) => {

        let filebase = new S3({
            endpoint: "https://s3.filebase.com",
            accessKeyId: FILEBASE_API_KEY,
            secretAccessKey: FILEBASE_API_SECRET,
        });

        let params = {
            Bucket: bucket,
            Key: fn,
            Body: stream
        };

        await filebase.upload(params, {}, (err, data)=>{
            if (!err){
                res(data);
            }
            else{
                rej(err);
            }
        });

    })
    let result = await promise;
    return result;

}

export async function storeOnFilebase( fn, path ){

    try {
        console.log("🔃 Backing up data to Filebase.");

        const file = fs.createReadStream(path);


        let resp2 = await putOnFilebase('convostorj1', fn, file);

        if ('Location' in resp2){
            console.log('🟢 Backup to Filebase-Storj Successful');
        }
        else {
            console.log('🔴 Backup to Filebase-Storj Failed')
            console.log(resp2);
        }


        // let resp = await putOnFilebase('convoipfs1', fn, file);
        //     console.log(resp);

        // if ('Location' in resp){
        //     console.log('🟢 Backup to Filebase-IPFS Successful');
        // }
        // else {
        //     console.log('🔴 Backup to Filebase-IPFS Failed')
        //     console.log(resp);
        // }


        return resp2;

    } catch (error) {
        console.log('🔴 Filebase Backup Error', error);
    }

}

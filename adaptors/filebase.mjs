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

        // convosia, convoipfs1
        let resp = await putOnFilebase('convosia', fn, file);

        if ('Location' in resp){
            console.log('🟢 Backup to Filebase-Sia Successful');
        }
        else {
            console.log('🔴 Backup to Filebase-Sia Failed')
            console.log(resp);
        }


        return resp;

    } catch (error) {
        console.log('🔴 Filebase Backup Error', error);
    }

}

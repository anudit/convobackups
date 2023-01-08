import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import fleekStorage from '@fleekhq/fleek-storage-js'
const { FLEEK_STORAGE_API_KEY, FLEEK_STORAGE_API_SECRET } = process.env;

export async function storeOnFleekStorage( fn, path ){

    try {
        console.log("🔃 Backing up data to Fleek Storage");

        const file = fs.createReadStream(path);
        const title = fn;

        const uploadedFile = await fleekStorage.streamUpload({
            apiKey: FLEEK_STORAGE_API_KEY,
            apiSecret: FLEEK_STORAGE_API_SECRET,
            key: title,
            stream: file
        });

        if ('hash' in uploadedFile){
            console.log('🟢 Backup to Fleek Storage Successful');
        }
        else {
            console.log('🔴 Backup to Fleek Storage Failed')
            console.log(uploadedFile);
        }

        return uploadedFile;

    } catch (error) {
        console.log('🔴 Fleek Storage Backup Error', error);
    }

}

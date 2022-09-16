import dotenv from 'dotenv'
import FormData from 'form-data';
dotenv.config({ path: '.env.local' });
const { CHAINSAFE_STORAGE_API_KEY } = process.env;

import fs from 'fs'
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


export async function storeOnChainsafeStorage( fn, path ){

    try {
        console.log("🔃 Backing up data to Chainsafe Storage");

        const file = fs.createReadStream(path);
        const title = fn;

        const form = new FormData();
        form.append('title', title);
        form.append('file', file);

        var requestOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CHAINSAFE_STORAGE_API_KEY}`,
                ...form.getHeaders(),
            },
            body: form,
            redirect: 'follow'
        };

        let resp = await fetch("https://api.chainsafe.io/api/v1/bucket/4b8ef0f3-5596-4940-a03c-32b14ba31578/upload", requestOptions);
        let json = await resp.json();

        if (Object.keys(json).includes('path') == true){
            console.log('🟢 Backup to Chainsafe Successful');
        }
        else {
            console.log('🔴 Backup to Chainsafe Failed')
            console.log(json);
        }

        return json;

    } catch (error) {
        console.log('🔴 Chainsafe Backup Error', error);
    }

}

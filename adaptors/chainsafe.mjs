import dotenv from 'dotenv'
import FormData from 'form-data';
dotenv.config({ path: '.env.local' });
const { CHAINSAFE_STORAGE_API_KEY } = process.env;

import fs from 'fs'
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


export async function storeOnChainsafeStorage( fn, path ){
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

    let resp = await fetch("https://api.chainsafe.io/api/v1/bucket/ad2c9217-bf2a-4e13-a8b6-85bd375aada2/upload", requestOptions);
    let json = await resp.json();

    if ('path' in json){
        console.log('🟢 Backup to Chainsafe Sucessful');
    }
    else {
        console.log('🔴 Backup to Chainsafe Failed')
        console.log(json);
    }

    return json;

}

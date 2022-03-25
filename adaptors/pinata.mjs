const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
import { prettyDate } from '../utils.mjs';

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;

// Gateway : https://gateway.pinata.cloud/ipfs/<hash>
export async function pinToPinata(hash) {

    try {



    } catch (error) {
        console.log('pinToPinata.error', error);
        return false;
    }

    const pinlist = await fetch(`https://api.pinata.cloud/data/pinList?status=pinned&pageLimit=1000`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_API_SECRET
        }
    }).then(res=>{return res.json()});

    // Unpin Old Backups, keeping last 2 backups.
    for (let index = 2; index < pinlist['rows'].length; index++) {
        const hash = pinlist['rows'][index].ipfs_pin_hash;
        console.log(`Unpinning ${index+1}/${pinlist['rows'].length}`);
        await fetch(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_API_SECRET
            }
        });
    }

    // Pin Latest Backup
    let resp = await fetch(`https://api.pinata.cloud/pinning/pinByHash`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_API_SECRET
        },
        redirect: 'follow',
        body: JSON.stringify({
            hashToPin: hash,
            pinataMetadata: {
                name: `Backup-${prettyDate()}.json`,
            }
        })
    });

    let json = await resp.json();

    if ('ipfsHash' in json){
        console.log('🟢 Backup Replicated to Pinata');
    }
    else {
        console.log('🔴 Backup Replication to Pinata Failed')
        console.log(json);
    }

    return json;
}

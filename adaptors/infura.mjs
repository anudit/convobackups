const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Gateway : https://<hash>.ipfs.infura-ipfs.io/
export async function pinToInfura(hash) {
    try {

        const response = await fetch(`https://ipfs.infura.io:5001/api/v0/pin/add?hash=${hash}&arg=${hash}&pin=true`, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
            redirect: 'follow',
            body: JSON.stringify({})
        });
        let json = await response.json();

        if ('Pins' in json && json['Pins'].length > 0){
            console.log('🟢 Backup Replicated to Infura');
        }
        else {
            console.log('🔴 Backup Replication to Infura Failed')
            console.log(json);
        }

        return json;

    }
    catch (error) {
        console.log('pinToInfura.error', error);
        return "";
    }
}

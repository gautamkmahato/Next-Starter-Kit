'use server'

export default async function createNewUser(inputData){
    const response = await fetch('https://tts-backend.vercel.app/api/v1/user', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify(inputData)
    });
    const result = await response.json(); 

    if(!response.ok){
        return {
            message: "Error in Inserting Data in createNewUser"
        }
    }
    return result;
}
import { google } from 'googleapis'
import fs from 'fs'
import   path from 'path'
import dotenv from "dotenv"
dotenv.config()
// CLIENT_ID = process.env.GOOGLE_ID,
//     CLIENT_SECRET = process.env.GOOGLE_SECRET,
//     REDIRECT_URI = process.env.GOOGLE_REDIRECT;

// let REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;    

// const oauth2Client = new google.auth.OAuth2(
//     CLIENT_ID,
//     CLIENT_SECRET,
//     REDIRECT_URI
// )

// oauth2Client.setCredentials(
//     { refresh_token: REFRESH_TOKEN }
// )
// const SERVICE_ACCOUNT_KEY_FILE = path.join(__dirname, "..",'keyfile.json');
// console.log(SERVICE_ACCOUNT_KEY_FILE)
// const auth = new google.auth.GoogleAuth({
//     keyFile: SERVICE_ACCOUNT_KEY_FILE,
//     scopes: ['https://www.googleapis.com/auth/drive'],
// });


// async function shareRootFolderWithServiceAccount() {
//     try {
       
//         const jwtClient = new google.auth.JWT(
//             process.env.GOOGLE_CLIENT_EMAIL,
//             null,
//             process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
//             ['https://www.googleapis.com/auth/drive'],
//             null
//         );

//         await jwtClient.authorize();

//         const drive = google.drive({ version: 'v3', auth: jwtClient });

//         await drive.permissions.create({
//             resource: {
//                 type: 'user',
//                 role: 'writer',
//                 emailAddress: process.env.GOOGLE_CLIENT_EMAIL,
//             },
//             fileId: 'root',
//         });

//         console.log('Root folder shared successfully with the service account.');
//     } catch (error) {
//         console.error('Error sharing root folder:', error);
//     }
// }



    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
    const auth = new google.auth.GoogleAuth({
        credentials: {
            type: process.env.GOOGLE_SERVICE_ACCOUNT_TYPE,
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: privateKey,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: process.env.GOOGLE_AUTH_URI,
            token_uri: process.env.GOOGLE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
            universe_domain: process.env.GOOGLE_UNIVERSE_DOMAIN,
        },
        scopes: ['https://www.googleapis.com/auth/drive'],
    });

  

    const drive = google.drive({ version: 'v3', auth });


// async function refreshToken() {
//     try {
//         const response = await oauth2Client.refreshAccessToken();
//         const credentials = response.credentials;
//         oauth2Client.setCredentials(credentials);
//         console.log(credentials)

//         // Update the refresh token in your environment variable
//         REFRESH_TOKEN = credentials.refresh_token;
//         process.env.GOOGLE_REFRESH_TOKEN = REFRESH_TOKEN;
//     } catch (error) {
//         console.error('Error refreshing access token:', error);
//         throw new Error('Failed to refresh access token');
//     }
// }

export const  getFolder = async (foldername)=> {
    try {
        
        const folderName = foldername;
        const folderQuery = `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;

        // Search for the folder with the given name
        const response = await drive.files.list({
            q: folderQuery,
            fields: 'files(id)'
        });
        let folderId;
        if (response.data.files.length > 0) {
            // Folder already exists, return its ID
            folderId = response.data.files[0].id;
        } else {
            // Folder does not exist, create it
            const folderMetadata = {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder'
            };

            const createFolderResponse = await drive.files.create({
                resource: folderMetadata,
                fields: 'id'
            });

            folderId = createFolderResponse.data.id;
        }
        await drive.permissions.create({
            fileId: folderId,
            requestBody: {
                role: 'writer',
                type: 'user',
                emailAddress:  process.env.GOOGLE_CLIENT_EMAIL, // replace with your service account email
            },
        });
        return folderId
    } catch (error) {
        console.log(error)

        // if (error.response && error.response.status >= 400) {
        //     await refreshToken();
        //     return getFolder(folderName); // Retry after refreshing access token
        // } else {
        //     console.error('Error getting or creating folder:', error);
        //     throw error;
        // }
    }
}


export const uploadFile = async (namestring, filePath, folderId)=> {

    // const fileMetadata = {
    //     name: namestring + "-profile-image.jpg",
    //     parents: [folderId]
    // };

    // const media = {
    //     mimeType: 'image/jpeg',
    //     body: fs.createReadStream(filePath)
    // };
    try {
        
        const response = await drive.files.create({
            requestBody: {
                name: namestring + "-profile-image.jpg",
                parents: [folderId]
            },
            media: {
                mimeType: 'image/jpeg',
                body: fs.createReadStream(filePath),
            }
        });

        const file_Id = response.data.id

        await drive.permissions.create({
            fileId: file_Id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        const file_Details = await drive.files.get(
            {
                fileId: file_Id,
                fields: "id,webViewLink, webContentLink",
            }
        );
        const { id, webContentLink } = file_Details.data
        // return file_Details.data;
        return {
            id,
            viewLink: `https://lh3.googleusercontent.com/d/${id}`,
            contentLink: webContentLink
        }
    } catch (error) {
        console.log(error)
        // if (error.response && error.response.status >= 401) {
        //     await refreshToken();
        //     return uploadFile(nameString, filePath, folderId); // Retry after refreshing access token
        // } else {
        //     console.error('Error uploading file:', error);
        //     throw error;
        // }
    }
}



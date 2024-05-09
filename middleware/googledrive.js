const { google } = require('googleapis')
const fs = require('fs'),
CLIENT_ID = process.env.GOOGLE_ID,
    CLIENT_SECRET = process.env.GOOGLE_SECRET,
    REDIRECT_URI = process.env.GOOGLE_REDIRECT

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
)

oauth2Client.setCredentials(
    { refresh_token: process.env.GOOGLE_REFRESH_TOKEN }
)

const drive = google.drive({
    version: "v3",
    auth: oauth2Client
})

async function getFolder(foldername) {
    const folderName = foldername;
    const folderQuery = `name='${folderName}' and mimeType='application/vnd.google-apps.folder'`;

    // Search for the folder with the given name
    const response = await drive.files.list({
        q: folderQuery,
        fields: 'files(id)'
    });

    if (response.data.files.length > 0) {
        // Folder already exists, return its ID
        return response.data.files[0].id;
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

        return createFolderResponse.data.id;
    }
}


async function uploadFile(namestring, filePath, folderId) {

    // const fileMetadata = {
    //     name: namestring + "-profile-image.jpg",
    //     parents: [folderId]
    // };

    // const media = {
    //     mimeType: 'image/jpeg',
    //     body: fs.createReadStream(filePath)
    // };

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
            fileId:file_Id,
            fields: "id,webViewLink, webContentLink",
        }
    );
    const {id, webContentLink} = file_Details.data
    // return file_Details.data;
    return {
        id,
        viewLink: `https://lh3.googleusercontent.com/d/${id}`,
        contentLink: webContentLink
    }
}

module.exports = {
    getFolder,
    uploadFile
}

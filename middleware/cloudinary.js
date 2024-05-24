import  {v2 as cloudinary} from 'cloudinary'


cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.Api_key,
  api_secret: process.env.Api_secret_key
});
export default cloudinary


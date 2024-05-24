import {Newuser} from '../models/User.js'
import {Newblogs} from '../models/newblogs.js'
// const cloudinary = require('../middleware/cloudinary')
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'
import { formatDistanceToNow } from 'date-fns'
import { generateToken } from '../middleware/token.js'
import {
    getFolder,
    uploadFile
} from '../middleware/googledrive.js'


let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.SECRET_KEY
    }
})

const sendVerificationEmail = async (name, email, token) => {
    try {
        const templatePath = path.join(__dirname, '..', 'public', 'templates', 'email_template.html');
        const emailTemplate = fs.readFileSync(templatePath, 'utf8');
        const Token = token.split('').join('-')
        const html = emailTemplate
            .replace('[NAME]', name)
            .replace('[TOKEN]', Token)
        // .replace('{{ verificationLink }}', verificationLink);

        console.log(html)
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: 'Email Verification',
            html: html
        };

        const info = await transporter.sendMail(mailOptions);
        if (info.response) {
            console.log("Verfication email sent successfully:", info.response)
            return true
        }

    } catch (error) {
        console.log("Error sending verfication email:", error)
        return false
    }
}

export const sign_up = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // if (!_csrf || _csrf !== req.csrfToken()) {
        //     console.log('invlid crf')
        //     res.status(403).send('CSRF token invalid');
        //     return;
        //   }


        // const opt = {
        //   use_filename: true,
        //   unique_filename: false,
        //   overwrite: true,
        //   resource_type: "auto"
        // };
        const exist = await Newuser.findOne({ email });
        if (exist) {
            console.log('User Already Exists')
            return res.json({ message: 'User Already Exists', error: true })
        }
        if (!name || !email || !password) {
            console.log('no file')
            return res.json({ message: 'Error: empty field detected', error: true });
        }
        let result;
        if (req.file) {
            const filePath = req.file.path;
            const folder = await getFolder("User-Avatars")
            result = await uploadFile(name, filePath, folder)
            //Url = `https://drive.google.com/thumbnail?export=view&id=${result.id}`
            // result = await cloudinary.uploader.upload(filePath, { folder: 'UserAvatars' });
        }
        const hashpassword = await bcrypt.hash(password, 10);
        const token = generateToken();
        const _user_account_info = new Newuser({
            name,
            email,
            avatar_info: {
                public_id: result ? result.id : null,
                url: result ? result.viewLink : null
            },
            password: hashpassword,
            verificationToken: token,
            verificationTokenExpiration: new Date().getTime() + (5 * 60 * 1000)
        })
        //   if(req.file){
        //     _blog.heroimage=req.file.path
        //   }



        const tokenSent = await sendVerificationEmail(name, email, token)
        if (!tokenSent) {
            return res.json({ message: 'Error sending verification OTP, try again', error: true })
        }

        console.log("requset body =>  ", req.body)
        console.log("request file =>", req.file)
        console.log("requset Token =>", token)
        console.log(result)


        // return res.render("verify",{title:"verification"})
        await _user_account_info.save()
        console.log(_user_account_info)
        return res.json({ redirectTo: `/user/verify?email=${email}`, message: 'Successful redirecting....', error: false })

    } catch (error) {
        console.log(error)
    }
}



export const tokenVerify = async (req, res) => {
    try {
        const { token } = req.body
        const user = await Newuser.findOne({ verificationToken: token });
        if (!user) {
            console.log("user does not exist")
            return res.json({ message: 'Error: OTP invalid', error: true });
        }

        const tokenExpiration = user.verificationTokenExpiration;
        if (new Date().getTime() > tokenExpiration) {
            // Token has expired, generate a new token and send verification email
            const newToken = generateToken(); // Generate a new token
            const tokenSent = await sendVerificationEmail(user.name, user.email, newToken); // Send verification email with new token
            if (!tokenSent) {
                return res.json({ message: 'Error sending verification OTP, try again', error: true });
            }
            // Update user with new token and expiration time
            user.verificationToken = newToken;
            user.verificationTokenExpiration = new Date().getTime() + (5 * 60 * 1000); // 5 minutes expiration
            await user.save();

            return res.json({ message: 'OTP Expired: New verification OTP sent', error: true });
        }
        console.log(user)

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpiration = null;
        await user.save();
        console.log(user)

        return res.json({ redirectTo: '/user/log-in', message: 'Email verified successfully', error: false })
    } catch (error) {
        console.log(error)
    }


}

export const log_in = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Newuser.findOne({ email });
        console.log(user)

        if (!user) {
            console.log('User does not exist');
            return res.json({ message: "Invalid Credentials: User not found", error: true });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log('Invalid password');
            return res.json({ message: 'Invalid Credentials: email/password error', error: true });
        }

        if (!user.isVerified) {
            console.log('Account not verified ');
            // return res.json({ message: 'Error: Account not verified ', error: true });
            const newToken = generateToken(); // Generate a new token
            const tokenSent = await sendVerificationEmail(user.name, user.email, newToken); // Send verification email with new token
            if (!tokenSent) {
                return res.json({ message: 'Error sending new verification OTP, try again', error: true });
            }
            // Update user with new token and expiration time
            user.verificationToken = newToken;
            user.verificationTokenExpiration = new Date().getTime() + (5 * 60 * 1000); // 5 minutes expiration
            await user.save();

            return res.json({ redirectTo: '/user/verify', message: 'Account not verified: New OTP sent', error: true });
        }

        console.log('User logged in:', user);
        const serializedUser = {
            _id: user._id,
            name: user.name,
            avatar_info: user.avatar_info,
            email: user.email,
            isVerified: user.isVerified
        };

        // Set session user data
        req.session.user = serializedUser;

        console.log(req.session);

        return res.json({ redirectTo: '/user/dashboard', message: 'Login successful', error: false });


        // res.redirect('/user/dashboard')
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error try again later', error: true });
    }
};

export const updatePassword = async (req, res) => {
    const { email, newPassword } = req.body

    try {
        const user = await Newuser.findOne({ email });
        if (!user) {
            res.json({ message: 'User not found', error: true })
        }

        const passwordMatch = await bcrypt.compare(newPassword, user.password);
        if (passwordMatch) {
            return res.json({ message: 'Pls create a new password', error: true });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        const token = generateToken();

        user.password = hashedPassword;
        user.isVerified = false;
        user.verificationToken = token;
        user.verificationTokenExpiration = new Date().getTime() + (5 * 60 * 1000)

        const tokenSent = await sendVerificationEmail(user.name, email, token)
        if (!tokenSent) {
            return res.json({ message: 'Error sending verification token, try again', error: true })

        }



        await user.save();
        console.log(user)

        // Send a success response
        res.json({ redirectTo: '/user/verify', message: 'Password updated successfully', error: false });

    } catch (error) {
        console.log(error)
    }
}

export const Show_user_dashboard = async (req, res) => {
    try {

        const user = req.session.user;
        // const lastMonthStartDate = moment().subtract(1, 'month').startOf('month').toDate();

        const authoredBlogs = await Newblogs.find({ author_id: user._id })



        // const user = await Newuser.findById(userId)
        //const user = await User.findById(userId).populate('authoredBlogs');
        // if (!user) {
        //     throw new Error('User not found');
        // }
        // else {
        //     
        // }
        res.render('user_dashboard', { title: 'account', User: user, authoredBlogs });

    } catch (error) {
        return res.status(500).send('Error fetching dashboard: ' + error.message);
    }
}

export const get_user_blogInfo = async (req, res) => {
    const user = req.session.user;
    const currentMonthStartDate = new Date(); // Get current date
    currentMonthStartDate.setDate(1); // Set the date to the first day of the month

    // Initialize an array to store the start dates of the previous five months
    const startDates = [currentMonthStartDate];
    // Calculate the start dates for the previous five months
    for (let i = 1; i <= 5; i++) {
        const startDate = new Date(currentMonthStartDate);
        startDate.setMonth(currentMonthStartDate.getMonth() - i);
        startDates.push(startDate);
    }
    // Group blogs by month and count the number of blogs for each month
    const blogActivity = await Newblogs.aggregate([
        {
            $match: {
                createdAt: { $gte: startDates[5] },
                author_id: user._id // Filter blogs created since last month
            }
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 }
            }
        }
    ]);

    // Prepare data for Chart.js
    // const labels = blogActivity.map(data => moment().month(data._id - 1).format('MMM')); // Format month labels
    labels = blogActivity.map(data => {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return monthNames[data._id - 1];
    });
    data = blogActivity.map(data => data.count); // Blog counts
    console.log(labels, data)

    return res.json({ labels, data })

}

export const load_blogCreate = async (req, res) => {
    try {

        const user = req.session.user;
        // const user = await Newuser.findById(user.id)
        // const Author_name = user.name;
        return res.render('blogs', { title: 'Create A Blog', User: user })
    } catch (error) {
        console.log(error)
    }

}



export const create_blog = async (req, res) => {


    try {
        const { author, category, title, blog } = req.body
        const author_id = req.session.user._id

        // const opt = {
        //   use_filename: true,
        //   unique_filename: false,
        //   overwrite: true,
        //   resource_type: "auto"
        // };
        if (!req.file) {
            console.log('no file')
            return res.json({ message: 'No file uploaded', error: true });
        }

        // Get the file path
        const filePath = req.file.path;
        //const result = await cloudinary.uploader.upload(filePath, { folder: 'blogphotos' });
        const folderId = await getFolder('blogphotos')
        const result = await uploadFile(title, filePath, folderId)

        const _blog = new Newblogs({
            author,
            author_id,
            category,
            title,
            heroimage_info: {
                public_id: result.id,
                url: result.viewLink
            },
            blog

        })

        await _blog.save()
        console.log(req.body)
        console.log(result)
        console.log(_blog)
        return res.json({ redirectTo: '/', message: 'Blog created successfully', error: false });


    } catch (error) {
        console.log(error)
        return res.json({ message: error, error: true });
    }
}

export const user_Authored_blogs = async (req, res) => {
    try {
        const user = req.session.user
        const authored_blogs = await Newblogs.find({ author_id: user._id }).sort({ createdAt: -1 })
        console.log({
            BlogLength: authored_blogs.length,
            blogs: authored_blogs
        })
        return res.render('authored_blogs', {
            title: "Your Authored blogs",
            Blogs: authored_blogs,
            formatDistanceToNow,
            User:user
        })
    } catch (error) {
        console.log(error)
    }

}



export const log_out = async (req, res) => {
    try {
        await req.session.destroy(); // Async operation to destroy the session
        return res.redirect('/user/log-in'); // Redirect to login page after logout
    } catch (error) {
        console.error('Error destroying session:', error);
        return res.status(500).send('Internal Server Error');
    }
};


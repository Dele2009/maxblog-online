const Newuser = require('../models/User')
const Newblogs = require('../models/newblogs')
const cloudinary = require('../middleware/cloudinary')
const bcrypt = require('bcrypt')

let labels, data;

const sign_up = async (req, res) => {
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
            result = await cloudinary.uploader.upload(filePath, { folder: 'UserAvatars' });
        }
        const hashpassword = await bcrypt.hash(password, 15);

        const _user_account_info = new Newuser({
            name,
            email,
            avatar_info: {
                public_id: result ? result.public_id : null,
                url: result ? result.secure_url : null
            },
            password: hashpassword
        })
        //   if(req.file){
        //     _blog.heroimage=req.file.path
        //   }

        await _user_account_info.save()
        console.log(req.body, req.file)
        console.log(result)
        console.log(_user_account_info)
        return res.json({ redirectTo: '/user/log-in', message: 'Account Created Successfully', error: false })

    } catch (error) {
        console.log(error)
    }
}

const log_in = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Newuser.findOne({ email });
        console.log(user)

        if (!user) {
            console.log('User does not exist');
            return res.json({ message: "Invalid Credentials: User not found", error: true });
        }

        const isMatched = await bcrypt.compare(password, user.password);
        if (!isMatched) {
            console.log('Invalid password');
            return res.json({ message: 'Invalid Credentials: email/password error', error: true });
        }

        console.log('User logged in:', user);
        req.session.user = {
            _id: user._id,
            name: user.name,
            avatar_info: user.avatar_info,
            email: user.email
        };

        console.log(req.session);

        return res.json({ redirectTo: '/user/dashboard', message: 'Login successful', error: false });


        // res.redirect('/user/dashboard')
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error try again later', error:true });
    }
};

const updatePassword = async (req,res)=>{
    const {email,currentPassword,newPassword} = req.body

    try{
      const user = await Newuser.findOne({ email });
      if(!user){
        res.json({message: 'User not found', error:true})
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);
      if (!passwordMatch) {
        return res.json({ message: 'Invalid Credentials: email/password error', error: true  });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 15)

      user.password = hashedPassword;
      await user.save();
  
      // Send a success response
      res.json({ redirectTo: '/user/log-in', message: 'Password updated successfully',error:false });

    }catch(error){

    }
}

const Show_user_dashboard = async (req, res) => {
    try {

        const user = req.session.user;
        // const lastMonthStartDate = moment().subtract(1, 'month').startOf('month').toDate();
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


        // const user = await Newuser.findById(userId)
        //const user = await User.findById(userId).populate('authoredBlogs');
        // if (!user) {
        //     throw new Error('User not found');
        // }
        // else {
        //     
        // }
        res.render('user_dashboard', { title: 'account', User: user, labels, data });

    } catch (error) {
        return res.status(500).send('Error fetching dashboard: ' + error.message);
    }
}

const load_blogCreate = async (req, res) => {
    try {

        const user = req.session.user;
        // const user = await Newuser.findById(user.id)
        // const Author_name = user.name;
        return res.render('blogs', { title: 'Create A Blog', User: user })
    } catch (error) {
        console.log(error)
    }

}



const create_blog = async (req, res) => {


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
        const result = await cloudinary.uploader.upload(filePath, { folder: 'blogphotos' });

        const _blog = new Newblogs({
            author,
            author_id,
            category,
            title,
            heroimage_info: {
                public_id: result.public_id,
                url: result.secure_url
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



const log_out = async (req, res) => {
    try {
        await req.session.destroy(); // Async operation to destroy the session
        return res.redirect('/user/log-in'); // Redirect to login page after logout
    } catch (error) {
        console.error('Error destroying session:', error);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    sign_up,
    log_in,
    Show_user_dashboard,
    load_blogCreate,
    create_blog,
    log_out,
    updatePassword,
    labels,
    data
}
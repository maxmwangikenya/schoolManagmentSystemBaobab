import multer from 'multer';
import path from 'path'; // ✅ Added missing import
import Employee from '../models/Employee.js';
import User from '../models/user.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }   
}); 

const upload = multer({ storage: storage });

// Export the multer middleware for single file upload
const uploadSingle = upload.single('image');

const addEmployee = async (req, res) => {
    console.log('🔥 addEmployee route hit');
    console.log('📝 Request body:', req.body);
    console.log('📸 Request file:', req.file);
    console.log('🔍 Role value:', req.body.role);
    console.log('🔍 Password value:', req.body.password);
    
    try {
        const {
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            password, 
            role
        } = req.body;

        // Check if employee with same email or employeeId already exists
        const existingEmployee = await Employee.findOne({ 
            $or: [{ email }, { employeeId }] 
        });
        
        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                error: 'Employee with this email or ID already exists'
            });
        }

        // Check if user with same email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User with this email already exists'
            });
        }

        // ✅ Create new user (authentication)
        const newUser = new User({
            email,
            password,
            role: role || 'employee' // default to 'employee' if not provided
        });

        await newUser.save();

        // ✅ Create new employee (profile)
        const newEmployee = new Employee({
            name,
            email,
            employeeId,
            dob,
            gender,
            maritalStatus,
            designation,
            department,
            salary,
            profileImage: req.file ? req.file.filename : null, // ✅ Handle uploaded image
            user: newUser._id // link to user
        });

        await newEmployee.save();

        // ✅ Respond with success (don't send password back)
        const { password: _, ...userWithoutPassword } = newUser.toObject();
        
        return res.status(201).json({
            success: true,
            message: 'Employee added successfully',
            employee: newEmployee,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Error adding employee:', error);
        return res.status(500).json({
            success: false,
            error: 'Server error while adding employee'
        });
    }
};

export { addEmployee, uploadSingle };
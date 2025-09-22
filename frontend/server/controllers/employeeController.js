import multer from 'multer';
import path from 'path';
import Employee from '../models/Employee.js';
import User from '../models/user.js'; // Note: Make sure this matches your actual file name

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

// Your existing addEmployee function
const addEmployee = async (req, res) => {
    console.log('🔥 addEmployee route hit');
    console.log('📝 Request body:', req.body);
    console.log('📸 Request file:', req.file);
    console.log('🔍 Role value:', req.body.role);
    console.log('🔍 Password value:', req.body.password);
    console.log('🔍 DOB value:', req.body.dob, 'Type:', typeof req.body.dob);
    console.log('🔍 DOB as Date:', new Date(req.body.dob));
    
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

        // ✅ Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required'
            });
        }

        // ✅ Validate date format if provided
        if (dob && isNaN(new Date(dob).getTime())) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format for date of birth. Use YYYY-MM-DD format.'
            });
        }

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

        // ✅ Create new user (authentication) - Include name field
        const newUser = new User({
            name,           // ✅ Added missing name field
            email,
            password,
            role: role || 'employee'
        });

        await newUser.save();

        // ✅ Create new employee (profile)
        const newEmployee = new Employee({
            name,
            email,
            employeeId,
            dob: dob ? new Date(dob) : null, // ✅ Properly handle date conversion
            gender,
            maritalStatus,
            designation,
            department,
            salary: salary ? Number(salary) : null, // ✅ Handle empty salary
            profileImage: req.file ? req.file.filename : null,
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
            error: 'Server error while adding employee',
            details: error.message
        });
    }
};

// GET all employees
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate('user', 'name email role') // If you have user references
            .sort({ createdAt: -1 }); // Sort by newest first
        
        res.json({
            success: true,
            employees: employees,
            count: employees.length
        });
    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching employees',
            error: error.message
        });
    }
};

// GET single employee by ID
const getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('user', 'name email role');
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        res.json({
            success: true,
            employee: employee
        });
    } catch (error) {
        console.error('Error fetching employee:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error fetching employee',
            error: error.message
        });
    }
};

// UPDATE employee
const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const updateData = { ...req.body };
        
        // Handle file upload if present
        if (req.file) {
            updateData.profileImage = req.file.filename;
        }
        
        // Remove fields that shouldn't be updated directly
        delete updateData._id;
        delete updateData.__v;
        delete updateData.createdAt;
        
        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            updateData,
            { 
                new: true, 
                runValidators: true,
                populate: { path: 'user', select: 'name email role' }
            }
        );
        
        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        // Update user data if needed
        if (updatedEmployee.user && (updateData.name || updateData.email)) {
            await User.findByIdAndUpdate(
                updatedEmployee.user,
                {
                    ...(updateData.name && { name: updateData.name }),
                    ...(updateData.email && { email: updateData.email })
                }
            );
        }
        
        res.json({
            success: true,
            message: 'Employee updated successfully',
            employee: updatedEmployee
        });
    } catch (error) {
        console.error('Error updating employee:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID format'
            });
        }
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Employee ID or email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error updating employee',
            error: error.message
        });
    }
};

// DELETE employee
const deleteEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        
        // Find the employee first to get associated user ID
        const employee = await Employee.findById(employeeId);
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        // Delete the employee
        await Employee.findByIdAndDelete(employeeId);
        
        // Optionally delete associated user account
        if (employee.user) {
            await User.findByIdAndDelete(employee.user);
        }
        
        res.json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting employee:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid employee ID format'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }
};

export { 
    addEmployee, 
    getAllEmployees, 
    getEmployeeById, 
    updateEmployee, 
    deleteEmployee, 
    uploadSingle 
};
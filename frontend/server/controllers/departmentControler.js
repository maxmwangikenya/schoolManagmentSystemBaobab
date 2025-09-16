import Department from "../models/Department.js";

const getDepartments = async (req, res) => { // Added req, res parameters
  try {
    const departments = await Department.find(); // Fixed variable name
    return res.status(200).json({ success: true, departments }); // Fixed syntax
  } catch (error) {
    console.error('Get departments error:', error);
    return res.status(500).json({ success: false, error: "get department server error" }); // Fixed syntax
  }
}

const addDepartment = async (req, res) => {
  try {
    const { dep_name, description } = req.body;
    
    // Check if department name already exists
    const existingDepartment = await Department.findOne({ dep_name });
    if (existingDepartment) {
      return res.status(400).json({ success: false, error: "Department already exists" });
    }

    const newDep = new Department({
      dep_name,
      description
    });
    
    await newDep.save();
    return res.status(201).json({ success: true, department: newDep }); // Changed to 201 for created
  } catch (error) {
    console.error('Add department error:', error);
    return res.status(500).json({ success: false, error: "add department server error" });
  }
}

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { dep_name, description } = req.body;
    
    // Check if department name already exists (excluding current department)
    const existingDepartment = await Department.findOne({ 
      dep_name,
      _id: { $ne: id }
    });
    
    if (existingDepartment) {
      return res.status(400).json({ success: false, error: "Department name already exists" });
    }

    const updatedDepartment = await Department.findByIdAndUpdate(
      id,
      { dep_name, description },
      { new: true, runValidators: true }
    );
    
    if (!updatedDepartment) {
      return res.status(404).json({ success: false, error: "Department not found" });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Department updated successfully",
      department: updatedDepartment 
    });
  } catch (error) {
    console.error('Update department error:', error);
    return res.status(500).json({ success: false, error: "update department server error" });
  }
}

const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findById(id);
    
    if (!department) {
      return res.status(404).json({ success: false, error: "Department not found" });
    }
    
    return res.status(200).json({ 
      success: true, 
      department 
    });
  } catch (error) {
    console.error('Get department by ID error:', error);
    return res.status(500).json({ success: false, error: "get department server error" });
  }
}

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findByIdAndDelete(id);
    
    if (!department) {
      return res.status(404).json({ success: false, error: "Department not found" });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Department deleted successfully",
      department 
    });
  } catch (error) {
    console.error('Delete department error:', error);
    return res.status(500).json({ success: false, error: "delete department server error" });
  }
}

export { addDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment };
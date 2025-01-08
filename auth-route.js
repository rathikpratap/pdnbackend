const router = require('express').Router();

const User = require('./models/user');
const Task = require('./models/newTask');


const jwt = require('jsonwebtoken');
const checkAuth = require('./middleware/check-auth');
const req = require('express/lib/request');


router.post('/login', (req, res) => {
    User.findOne({ signupUsername: req.body.loginUsername }).exec().then(user => {
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (req.body.loginPswd === user.signupPassword) {
            const payload = {
                userId: user._id,
                name: user.signupUsername,
                signupRole: user.signupRole
            };
            const token = jwt.sign(payload, "webWatch", { expiresIn: '8h' });
            console.log("PAYLOAD DATA====>", payload);
            user.save().then(() => {
                return res.json({
                    success: true,
                    token: token,
                    role: user.signupRole,
                    message: "login Successfull"
                });
            }).catch(err => {
                console.error("Error saving login  time: ", err);
                return res.json({ success: false, message: "FALSE FALSE FALSE" });
            });
        } else {
            return res.json({ success: false, message: "Password not matched" });
        }
    }).catch(err => {
        res.json({ success: false, message: "Authentication Failed" });
    });
});

router.get('/profile', checkAuth, async (req, res) => {
    const userId = await req.userData.userId;

    User.findById(userId).exec().then((result) => {
        return res.json({ success: true, data: result })
    }).catch(err => {
        res.json({ success: false, mesage: "Server Error" })
    })
});

router.post('/logout', (req, res) => {
    // Just respond with a success message
    res.json({
        success: true,
        message: "Logout successful"
    });
});

router.post('/register', async (req, res) => {
    try {
        // Extract data from request body
        const {
            signupName,
            signupUsername,
            signupEmail,
            signupNumber,
            signupGender,
            signupPassword,
            signupAddress,
            signupRole
        } = req.body;

        // Create a new user instance
        const user = new User({
            signupName,
            signupUsername,
            signupEmail,
            signupNumber,
            signupGender,
            signupPassword,
            signupAddress,
            signupRole
        });

        // Save the user to the database
        await user.save();
        return res.status(201).json({
            success: true,
            message: "Account has been successfully created!"
        });
    } catch (err) {
        // Handle duplicate key error (e.g., email or username already exists)
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Data already exists. Please check your input."
            });
        }

        // Handle other errors
        console.error('Error saving user:', err.message);
        return res.status(500).json({
            success: false,
            message: "An error occurred during registration. Please try again later."
        });
    }
});

router.get('/allEmployee', async (req, res) => {
    try {
        const allEmployees = await User.find();

        if (!allEmployees.length) {
            return res.status(404).json({ success: false, message: "No users found." });
        }

        res.status(200).json({ success: true, data: allEmployees });
    } catch (error) {
        console.error("Error fetching employees:", error.message);
        res.status(500).json({ success: false, message: "An error occurred while fetching employees." });
    }
});

router.delete('/delete-emp/:id', async (req, res) => {
    try {
        const deleteData = await User.findByIdAndDelete(req.params.id);
        if (deleteData) {
            //console.log("Delete ==>", deleteData);
            return res.json(deleteData);
        } else {
            return res.json({ result: "No Data Deleted" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.get('/read-emp/:id', async (req, res) => {
    try {
        const empDetails = await User.findById(req.params.id);
        if (empDetails) {
            //console.log("Employee ==>", empDetails);
            return res.json(empDetails);
        } else {
            return res.json({ result: "No Employee Found" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
router.put('/updateEmp/:id', async (req, res) => {
    //console.log("req.body ==>", req.body);
    const EmpDet = await User.findByIdAndUpdate(req.params.id, {
        $set: req.body
    })
    if (EmpDet) {
        return res.json(EmpDet)
    } else {
        res.send({ result: "No Employee Found" })
    }
});
router.get('/dataLength', async(req,res)=>{
    const dataLength = await Task.countDocuments();
    return res.json(dataLength);
});
router.post('/addTask', async(req,res)=>{
    const task = new Task({

        custCode: req.body.custCode,
        topic: req.body.topic,
        referenceLink: req.body.referenceLink,
        script: req.body.script,
        thumbnailText: req.body.thumbnailText,
        remark: req.body.remark,
        taskDate: req.body.taskDate,
        writerName: req.body.writerName
    })

    await task.save().then((_)=>{
        res.json({ success: true, message: "Task Added!!"})
    }).catch((err)=>{
        res.json({success: false, message: "Task Not Added!!"})
    })
});

router.get('/searchTopic/:topic', async (req, res) => {
    try {
      const topic = req.params.topic;
      
      let searchCriteria = {
        topic: { $regex: topic, $options: 'i' }
      };
  
      let data = await Task.find(searchCriteria);
      
      res.send(data);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error searching for customer");
    }
});

router.get('/writerAllProjects',checkAuth, async (req, res) => {
    try {
        const person = req.userData?.name;
        if(!person){
            return res.status(400).json({ error: 'Invalid User Data' });
        }
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // First day of the current month
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999); // End of today
  
      const fetchedLeads = await Task.find({
        writerName: person,
        taskDate: {
          $gte: startOfMonth,
          $lte: endOfToday
        }
      }).sort({ taskDate: -1 });
  
      return res.json(fetchedLeads);
    } catch (error) {
      console.error("Error Fetching Leads", error);
      res.status(500).json({ error: 'Failed to Fetch Leads' });
    }
  });

  router.get('/writerAllPreviousProjects',checkAuth, async (req, res) => {
    const person = req.userData.name;
    try {
      const currentMonth = new Date().getMonth() + 1;
      const previousMonthData = await Task.find({
        writerName: person,
        taskDate: {
          $gte: new Date(new Date().getFullYear(), currentMonth - 2, 2),
          $lte: new Date(new Date().getFullYear(), currentMonth - 1, 1)
        }
      }).sort({ taskDate: -1 });
      return res.json(previousMonthData);
    } catch (error) {
      console.error("Error Fetching Leads", error);
      res.status(500).json({ error: 'Failed to Fetch Leads' })
    }
  });
  
  //all Previous Two Month Data
  
  router.get('/writerAllTwoPreviousProjects',checkAuth, async (req, res) => {
    const person = req.userData.name;
    try {
      const currentMonth = new Date().getMonth() + 1;
      const previousTwoMonthData = await Task.find({
        writerName: person,
        taskDate: {
          $gte: new Date(new Date().getFullYear(), currentMonth - 3, 3),
          $lte: new Date(new Date().getFullYear(), currentMonth - 2, 2)
        }
      }).sort({ taskDate: -1 });
      return res.json(previousTwoMonthData);
    } catch (error) {
      console.error("Error Fetching Leads", error);
      res.status(500).json({ error: 'Failed to Fetch Leads' })
    }
  });

router.get('/dataByRange/:startDate/:endDate',checkAuth, async (req,res)=>{
    const person = req.userData?.name;
    const signupRole = req.userData.role;
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    endDate.setDate(endDate.getDate() + 1);
    try{
        let query;
        if(signupRole === 'Admin'){
            query = {
                taskDate: {
                    $gte: startDate, $lte: endDate
                }
            };
        }else{
            query = {
                writerName: person,
                taskDate: {
                    $gte: startDate, $lte: endDate
                }
            };
        }
        const rangeData = await Task.find(query);
        console.log("TASK====>>", rangeData);
        res.json(rangeData);
    }catch(error){
        res.status(500).json({ message: "Server Error"});
    }
});

router.put('/updateWriterTask/:id', async (req, res) => {
    try {
      const custDet = await Task.findByIdAndUpdate(req.params.id, {
        $set: req.body
      }, { new: true }); // Optionally, use { new: true } to return the updated document
      
      if (custDet) {
        return res.json(custDet);
      } else {
        return res.status(404).send({ result: "No Data Found" });
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      return res.status(500).send({ error: "An error occurred while updating the customer." });
    }
  });

router.get('/read-writerTask/:id', async(req,res)=>{
    try{
        const taskDetails = await Task.findById(req.params.id);
        if(taskDetails){
            return res.json(taskDetails);
        }else{
            return res.json({ result: "No Data"});
        }
    }catch(error){
        return res.status(500).json({ error: error.mesage});
    }
});

router.get('/downloadFile',checkAuth, async(req,res)=>{
    const person = req.userData.name;
    const signupRole = req.userData.role;
    const currentMonth = new Date().getMonth() + 1;
    try{
        let query;
        if(signupRole === 'Admin') {
            query = {
                taskDate: {
                    $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1),
                    $lte: new Date(new Date().getFullYear(), currentMonth, 0)
                }
            };
        } else {
            query = {
                writerName: person,
                taskDate: {
                    $gte: new Date(new Date().getFullYear(), currentMonth - 1, 1),
                    $lte: new Date(new Date().getFullYear(), currentMonth, 0)
                }
            };
        }
        const tasks = await Task.find(query);
        const data = tasks.map(task => ({
            'TaskCode': task.custCode,
            'Topic': task.topic,
            'Reference Link': task.referenceLink,
            'Thumbnail Text': task.thumbnailText,
            'Script': task.script,
            'Remark': task.remark,
            'Task Date': task.taskDate,
            'Writer Name': task.writerName
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        XLSX.writeFile(wb, 'tasks.xlsx');
        res.download('tasks.xlsx');
    }catch(err){
        console.error('Error Downloading File', err);
        res.status(500).json({ error: 'Failed to download File'});
    }
});

router.get('/downloadRangeFile/:startDate/:endDate',checkAuth, async(req,res)=>{
    const person = req.userData.name;
    const signupRole = req.userData.role;
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    endDate.setDate(endDate.getDate() + 1);
    try{
        let query;
        if(signupRole === 'Admin'){
            query = {
                taskDate: {
                    $gte: startDate, $lte: endDate
                }
            };
        } else {
            query = {
                writerName: person,
                taskDate: {
                    $gte: startDate, $lte: endDate
                }
            };
        }
        const rangeFileData = await Task.find(query);
        const data = rangeFileData.map(task => ({
            'TaskCode': task.custCode,
            'Topic': task.topic,
            'Reference Link': task.referenceLink,
            'Thumbnail Text': task.thumbnailText,
            'Script': task.script,
            'Remark': task.remark,
            'Task Date': task.taskDate,
            'Writer Name': task.writerName
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        XLSX.writeFile(wb, 'tasks.xlsx');
        res.download('tasks.xlsx');
    }catch(err){
        cosnole.log('Error Downloading File', err);
        res.status(500).json({error: 'Failed to download File'});
    }
});

router.delete('/delete-task/:id', async (req, res)=>{
    try{
        const deleteTask = await Task.findByIdAndDelete(req.params.id);
        if(deleteTask) {
            return res.json(deleteTask);
        } else {
            return res.json({ result: "No Data Deleted"});
        }
    } catch (error) {
        return res.status(500).json({error: error.message});
    }
});

router.get('/allProjects', async(req,res)=>{
    try{
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

        const fetchedLeads = await Task.find({
            taskDate: {
                $gte: startOfMonth,
                $lte: endOfToday
            }
        }).sort({ taskDate: -1});
        return res.json(fetchedLeads);
    }catch (error) {
        console.error("Error Fetching Leads", error);
        res.status(500).json({ error: 'Failed to Fetch Leads'});
    }
});

router.get('/allPreviousProjects', async (req, res) => {
    try{
        const currentMonth = new Date().getMonth() + 1;
        const previousMonthData = await Task.find({
            taskDate: {
                $gte: new Date(new Date().getFullYear(), currentMonth - 2, 2),
                $lte: new Date(new Date().getFullYear(), currentMonth - 1, 1)
            }
        }).sort({ taskDate: -1});
        return res.json(previousMonthData);
    } catch (error) {
        console.error("Error Fetching Leads", error);
        res.status(500).json({ error: 'Failed to Fetch Tasks'})
    }
});

router.get('/allTwoPreviousProjects', async(req, res) => {
    try{
        const currentMonth = new Date().getMonth() + 1;
        const previousTwoMonthData = await Task.find({
            taskDate: {
                $gte: new Date(new Date().getFullYear(), currentMonth - 3, 3),
                $lte: new Date(new Date().getFullYear(), currentMonth - 2, 2)
            }
        }).sort({ taskDate: -1});
        return res.json(previousTwoMonthData);
    }catch(error){
        console.error("Error Fetching Leads", error);
        res.status(500).json({ error: 'Failed to fetch Tasks'})
    }
});

router.post('/updateTm', async(req,res)=>{
    try{
        const items = req.body.items;
        for(const item of items){
            let existingItem = await Task.findById(item._id);
            if(existingItem){
                existingItem.writerName = item.writerName;
                existingItem.anchorName = item.anchorName;
                existingItem.rawEditorName = item.rawEditorName;
                existingItem.mainEditorName = item.mainEditorName;
                await existingItem.save();
            }
        }
        res.json({message: "Task Manager Updated"});
    } catch(err){
        res.status(500).json({ message: err.mesage});
    }
});

router.get('/rawEditorAllProjects', checkAuth, async(req,res)=>{
    try{
        const person = req.userData?.name;
        if(!person){
            return res.status(400).json({ error: 'Invalid User Data'});
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const fetchedLeads = await Task.find({
            rawEditorName: person,
            taskDate: {
                $gte: startOfMonth,
                $lte: endOfToday
            }
        }).sort({ taskDate: -1});
        return res.json(fetchedLeads);
    }catch(error){
        console.error("Error Fetching Leads", error);
        res.status(500).json({error: 'Failed to Fetch Tasks'});
    }
});

router.get('/rawEditorAllPreviousProjects', checkAuth, async(req,res)=>{
    const person = req.userData.name;
    try{
        const currentMonth = new Date().getMonth() + 1;
        const previousMonthData = await Task.find({
            rawEditorName: person,
            taskDate: {
                $gte: new Date(new Date().getFullYear(), currentMonth -2, 2),
                $lte: new Date(new Date().getFullYear(), currentMonth - 1, 1)
            }
        }).sort({taskDate: -1});
        return res.json(previousMonthData);
    }catch(error){
        console.error("Error Fetching Tasks", error);
        res.status(500).json({ error: 'Failed to Fetch Tasks'})
    }
});

router.get('/rawEditorAllTwoPreviousProjects', checkAuth, async(req,res)=>{
    const person= req.userData?.name;
    try{
        const currentMonth = new Date().getMonth() + 1;
        const previousTwoMonthData = await Task.find({
            rawEditorName: person,
            taskDate: {
                $gte: new Date(new Date().getFullYear(), currentMonth -3, 3),
                $lte: new Date(new Date().getFullYear(), currentMonth -2, 2)
            }
        }).sort({ taskDate: -1});
        return res.json(previousTwoMonthData);
    } catch (error) {
        console.error("Error Fetching Tasks", error);
        res.status(500).json({error: 'Failed to Fetch Tasks'})
    }
});

router.get('/mainEditorAllProjects', checkAuth, async(req,res)=>{
    try{
        const person = req.userData?.name;
        if(!person){
            return res.status(400).json({ error: 'Invalid User Data'});
        }
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        const fetchedLeads = await Task.find({
            mainEditorName: person,
            taskDate: {
                $gte: startOfMonth,
                $lte: endOfToday
            }
        }).sort({ taskDate: -1});
        return res.json(fetchedLeads);
    }catch(error){
        console.error("Error Fetching Leads", error);
        res.status(500).json({error: 'Failed to Fetch Tasks'});
    }
});

router.get('/mainEditorAllPreviousProjects', checkAuth, async(req,res)=>{
    const person = req.userData.name;
    try{
        const currentMonth = new Date().getMonth() + 1;
        const previousMonthData = await Task.find({
            mainEditorName: person,
            taskDate: {
                $gte: new Date(new Date().getFullYear(), currentMonth -2, 2),
                $lte: new Date(new Date().getFullYear(), currentMonth -1,1)
            }
        }).sort({taskDate: -1});
        return res.json(previousMonthData);
    }catch(error){
        console.error("Error Fetching Tasks", error);
        res.status(500).json({ error: 'Failed to Fetch Tasks'})
    }
});

router.get('/mainEditorAllTwoPreviousProjects', checkAuth, async(req,res)=>{
    const person = req.userData?.name;
    try{
        const currentMonth = new Date().getMonth() + 1;
        const previousTwoMonthData = await Task.find({
            mainEditorName: person,
            taskDate: {
                $gte: new Date(new Date().getFullYear(), currentMonth -3, 3),
                $lte: new Date(new Date().getFullYear(), currentMonth -2, 2)
            }
        }).sort({taskDate: -1});
        return res.json(previousTwoMonthData);
    } catch (error){
        console.error("Error Fetching Tasks", error);
        res.status(500).json({error: 'Failed to Fetch Tasks'})
    }
});

module.exports = router
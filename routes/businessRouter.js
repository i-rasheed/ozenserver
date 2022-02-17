const router = require("express").Router();
const auth = require("../middleware/auth");
const Business = require("../models/businessModel");
const multer = require('multer'),
// uuidv4 = require('uuid/v4'),

 DIR = './public/';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, DIR);
  },
  filename: (req, file, cb) => {
      const fileName = file.originalname.toLowerCase().split(' ').join('-');
      cb(null, Date.now() + '-' + fileName)
  }
});

var upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
  }
});

// Add business
router.post('/upload-images', auth, upload.array('imgCollection', 6), async (req, res, next) => {
  console.log(req.body)


try{
  const {businessname, businesstype, businessno,  city, address, description, imgCollection} = req.body 
  // if (!imgCollection || !businessname || !businesstype || !businessno || !city || !address || !description){
  //   return res.status(400).send({message: 'Not all Fields have been entered'})
  // }
  const reqFiles = [];
  const url = req.protocol + '://' + req.get('host') 
  for (var i = 0; i < req.files.length; i++) {
      reqFiles.push(url + '/public/' + req.files[i].filename) 
  }  

  if(reqFiles.length > 6){
    return res.status(400).send({message: "Maximum pictures exceeded!"})
  }
  
 const duplicateBus =  await Business.findOne({businessname: businessname}) 
  if(duplicateBus){
    return res.status(400).send({message: 'No duplicate business is allowed!'})
  }

  const business = new Business({
      imgCollection: reqFiles,
      businessname,
      businesstype,
      businessno,
      userId: req.user,
      city,
      address,
      description,
  });

  await business.save()
      res.status(201).send({
          message: "Business Added!",
          })
} catch (err) {
  res.status(500).json({ error: err.message });
} 
})



// Update business
router.put("/:id", auth, async (req, res) => { 
 
  console.log(req.body)

  try {
    const { businessname, businesstype, businessno, city, address, description, imgCollection } = req.body;
    const businessId = req.params.id;
    const wantedBusiness = await Business.findById(businessId);
    if (!wantedBusiness) {
      return res.status(404).json({
        message: "No business found with this id that belongs to the current user.",
      }); 
    }
    wantedBusiness.businessname = businessname;  
    wantedBusiness.businesstype = businesstype;
    wantedBusiness.businessno = businessno;  
    wantedBusiness.city = city;
    wantedBusiness.address = address;
    wantedBusiness.description = description; 
    wantedBusiness.imgCollection= imgCollection; 
     await wantedBusiness.save();
    res.send({ message: "Business Updated"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all busniesses for a given user
router.get("/mine/all", auth, async (req, res) => {
  try {
    const businesses = await Business.find({ userId: req.user });
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all businesses 
router.get("/all", async (req, res) => {
  try {
    const businesses = await Business.find();
    res.json(businesses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// delete a single business
router.delete("/:id", auth, async (req, res) => {
  try {
    const business = await Business.findOne({
      userId: req.user,
      _id: req.params.id,
    });
    if (!business)
      return res.status(400).json({
        msg: "No business found with this id that belongs to the current user.",
      });
    const deletedBusiness = await Business.findByIdAndDelete(req.params.id);
    res.json({ deletedBusiness, msg: "successfully deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





// get a single business
router.get("/:id/one", auth, async (req, res) => {
  const business = await Business.findById(req.params.id);
  if (business) {
    res.json(business);
  } else {
    res.status(404).send({ message: "Business Not Found" });
  }
});

module.exports = router;

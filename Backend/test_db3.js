const mongoose=require('mongoose');
mongoose.connect('mongodb://deenu1835:Lji8aW4CE2bOVnsJ@ac-x3oqzzo-shard-00-00.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-01.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-02.sr16oht.mongodb.net:27017/?ssl=true&replicaSet=atlas-s6z7iy-shard-0&authSource=admin&appName=Cluster0')
.then(async () => {
    const Vehicle=require('./models/Vehicle');
    const Violation=require('./models/Violation');
    
    const vehicle = await Vehicle.findOne({ plateNumber: 'BHZ-9638' });
    if (!vehicle) { console.log('not found'); process.exit(1); }
    
    console.log('Got vehicle, searching violations by ID:', vehicle._id);
    const violations = await Violation.find({ vehicleId: vehicle._id });
    console.log('Found violations:', violations.length);
    process.exit(0);
}).catch(console.error);

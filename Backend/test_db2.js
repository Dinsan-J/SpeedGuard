const mongoose=require('mongoose');
mongoose.connect('mongodb://deenu1835:Lji8aW4CE2bOVnsJ@ac-x3oqzzo-shard-00-00.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-01.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-02.sr16oht.mongodb.net:27017/?ssl=true&replicaSet=atlas-s6z7iy-shard-0&authSource=admin&appName=Cluster0')
.then(async () => {
    const Vehicle=require('./models/Vehicle');
    const ktm = await Vehicle.findOne({$or: [{plateNumber: 'BHZ-9638'}, {vehicleNumber: 'BHZ-9638'}]}).lean();
    require('fs').writeFileSync('dbg.txt', 'Keys: ' + Object.keys(ktm||{}).join(',') + '\nplateNumber: ' + ktm?.plateNumber + '\nvehicleNumber: ' + ktm?.vehicleNumber);
    console.log('Done');
    process.exit(0);
});

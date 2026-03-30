const mongoose=require('mongoose');
mongoose.connect('mongodb://deenu1835:Lji8aW4CE2bOVnsJ@ac-x3oqzzo-shard-00-00.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-01.sr16oht.mongodb.net:27017,ac-x3oqzzo-shard-00-02.sr16oht.mongodb.net:27017/?ssl=true&replicaSet=atlas-s6z7iy-shard-0&authSource=admin&appName=Cluster0')
.then(async () => {
    const Vehicle=require('./models/Vehicle');
    const IoTDevice=require('./models/IoTDevice');
    const ktm = await Vehicle.findOne({plateNumber: 'BHZ-9638'});
    const iot = await IoTDevice.findOne({deviceId: 'ESP32_MN42TKYH'});
    if(ktm && iot) {
        await Vehicle.updateOne({_id: ktm._id}, {$set: {iotDeviceId: iot._id, vehicleNumber: ktm.plateNumber}});
        await IoTDevice.updateOne({_id: iot._id}, {$set: {assignedVehicleId: ktm._id, status: 'active'}});
        console.log('Successfully linked KTM and IoT device bypassing validation');
    } else {
        console.log('KTM or IOT not found');
    }
    process.exit(0);
});

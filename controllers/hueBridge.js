const v3 = require('node-hue-api').v3
  , discovery = v3.discovery
  , hueApi = v3.api 
;
const LightState = v3.lightStates.LightState;

const appName = 'node-hue-api';
const deviceName = 'example-code';

const LIGHT_ID = 1;

let createdUser, authenticatedApi;

const ipAddress =  "192.168.137.175";
const discoverAndCreateUser = async () => {

//   const ipAddress =  "192.168.1.103";

  const unauthenticatedApi = await hueApi.createLocal(ipAddress).connect();
  
  try {
    createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);
    console.log('*******************************************************************************\n');
    console.log('User has been created on the Hue Bridge. The following username can be used to\n' +
                'authenticate with the Bridge and provide full local access to the Hue Bridge.\n' +
                'YOU SHOULD TREAT THIS LIKE A PASSWORD\n');
    console.log(`Hue Bridge User: ${createdUser.username}`);
    console.log(`Hue Bridge User Client Key: ${createdUser.clientkey}`);
    console.log('*******************************************************************************\n');


    
    // console.log(authenticatedApi);


  } catch(err) {

    // if (err.getHueErrorType() === 101) {
    //   console.error('The Link button on the bridge was not pressed. Please press the Link button and try again.');
    // } else {
      console.error(`Unexpected Error: ${err.message}`);
    // }
  }
}

const lightList = async (req, res) => {
    // console.log(authenticatedApi);
    await hueApi.createLocal(ipAddress).connect(createdUser.username).then(api => {
      api.lights.getAll()
      .then(allLights => {
        // Display the lights from the bridge
        // console.log(JSON.stringify(allLights, null, 2));
        let list = [];
        allLights.forEach(light => {
          let l = {
            name: light.data.name,
            id: light.data.id,
            state: light.data.state.on
          }
          list.push(l);
          // console.log(l);
        })
        return res.status(200).json({
          success: "success",
          // allLights,
          list
        })
  })
});
}

const lightOn = async (req, res) => {
  console.log("on re", req.body);
  const {id} = req.body;
  if(!id) {
    return res.status(200).json({
      err: "no id"
    })
  }
  await hueApi.createLocal(ipAddress).connect(createdUser.username).
  then(api => {
    const On = new LightState().on().ct(190).bri(80);
    api.lights.setLightState(id, On);
  })
  return res.status(200).json({
    success: "light turned on",
  })
}

const lightOff = async (req, res) => {
  console.log(req.body);
  const {id} = req.body;
  if(!id) {
    return res.status(200).json({
      err: "no id"
    })
  }
  await hueApi.createLocal(ipAddress).connect(createdUser.username).
  then(api => {
    const Off = new LightState().off();
    api.lights.setLightState(id, Off);
  })
  return res.status(200).json({
    success: "light turned off",
  })
}

const lightconfig = async (req, res) => {
  const {id, bri, ct} = req.body;
  console.log(id,bri,ct);
  if(!id || !bri || !ct) {
    return res.status(200).json({
      error: "insufficient configuration details"
    })
  }
  await hueApi.createLocal(ipAddress).connect(createdUser.username).
  then(api => {
    const state = new LightState().on().brightness(bri).ct(ct);
    api.lights.setLightState(id, state);
  })
  return res.status(200).json({
    success: "light adjusted",
  })
}

module.exports = {
    discoverAndCreateUser,
    lightList,
    lightOn,
    lightOff,
    lightconfig
}
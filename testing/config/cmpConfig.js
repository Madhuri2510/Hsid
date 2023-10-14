const {build, property, constants} = inject();
// cmp super user - QA
const cmpQaCreds = {
  cmpUserEmail: 'srijith12@gmail.com',
  cmpUserPwd: 'Dish@123',
};

const cmpProdCreds = {
  cmpUserEmail: 'hebbargourish@gmail.com',
  cmpUserPwd: 'OnlyForTesting@123',
};
const propertyId =
  build.buildType === constants.buildType.debug
    ? constants.propertyId.debug
    : constants.propertyId.release;

const PROPERTY_ID =
  property.propertyType === constants.propertyType.hospitality
    ? propertyId.hospitality // SmartboxID : HOTEL
    : propertyId.mdu; // SmartboxID: AUTOMATION

const cmpUserEmail =
  build.buildType === constants.buildType.debug
    ? cmpQaCreds.cmpUserEmail
    : cmpProdCreds.cmpUserEmail;

const cmpUserPwd =
  build.buildType === constants.buildType.debug
    ? cmpQaCreds.cmpUserPwd
    : cmpProdCreds.cmpUserPwd;

module.exports = {PROPERTY_ID, cmpUserEmail, cmpUserPwd};

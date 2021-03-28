import connectToMongo from '../db/connectToMongo.js'
import disconnectFromMongo from '../db/disconnectFromMongo.js'
import RunModel from '../db/RunModel.js'
import UserModel from '../db/UserModel.js'

// Adds some real Strava runs from prod to the local database as Runlog documents in 
// runs collection.

// Only run this script in dev; prod has access to a webhoook which will trigger saving 
// the full activity data in Mongo.

const loadRuns = async () => {
  connectToMongo()

  // Find the user id for mmbakken@gmail.com
  const email = 'mmbakken@gmail.com'
  const userId = await UserModel.findOne({ email: email }, { _id: 1 })

  if (userId == null) {
    console.error(`No user id found with email: ${email}`)
    return -1
  }

  try {
    await RunModel.insertMany([
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-07T23:07:39Z'),
        'startDateLocal' : new Date('2021-02-07T17:07:39Z'),
        'timezone' : '(GMT-06:00) America/Chicago',
        'time' : 16,
        'distance' : 28.3,
        'averageSpeed' : 1.769,
        'totalElevationGain' : 0,
        'hasHeartRate' : true,
        'averageHeartRate' : 89.5,
        'maxHeartRate' : 104,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4753054969',
        'stravaExternalId' : 'garmin_push_6237712258',
        'startLatitude' : null,
        'startLongitude' : null,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-08T22:44:02Z'),
        'startDateLocal' : new Date('2021-02-08T15:44:02Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2270,
        'distance' : 7506,
        'averageSpeed' : 3.307,
        'totalElevationGain' : 37.2,
        'hasHeartRate' : true,
        'averageHeartRate' : 146.6,
        'maxHeartRate' : 164,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4757494299',
        'stravaExternalId' : 'garmin_push_6242349984',
        'startLatitude' : 39.758129,
        'startLongitude' : -104.989579,
      },
      {
        'userId' : userId,
        'name' : 'Lunch Run',
        'startDate' : new Date('2021-02-09T19:09:04Z'),
        'startDateLocal' : new Date('2021-02-09T12:09:04Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 4278,
        'distance' : 14555.3,
        'averageSpeed' : 3.402,
        'totalElevationGain' : 33.2,
        'hasHeartRate' : true,
        'averageHeartRate' : 151.4,
        'maxHeartRate' : 182,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4761989909',
        'stravaExternalId' : 'garmin_push_6246949482',
        'startLatitude' : 39.758377,
        'startLongitude' : -104.989355,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-10T20:47:09Z'),
        'startDateLocal' : new Date('2021-02-10T13:47:09Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2401,
        'distance' : 8182.7,
        'averageSpeed' : 3.408,
        'totalElevationGain' : 86.7,
        'hasHeartRate' : true,
        'averageHeartRate' : 148.4,
        'maxHeartRate' : 174,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4767474275',
        'stravaExternalId' : 'garmin_push_6252364608',
        'startLatitude' : 39.759744,
        'startLongitude' : -104.990506,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-11T21:06:01Z'),
        'startDateLocal' : new Date('2021-02-11T14:06:01Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2290,
        'distance' : 8479,
        'averageSpeed' : 3.703,
        'totalElevationGain' : 21.5,
        'hasHeartRate' : true,
        'averageHeartRate' : 156.5,
        'maxHeartRate' : 182,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4772578968',
        'stravaExternalId' : 'garmin_push_6257468361',
        'startLatitude' : 39.758117,
        'startLongitude' : -104.989318,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-11T21:58:28Z'),
        'startDateLocal' : new Date('2021-02-11T14:58:28Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 703,
        'distance' : 2339.7,
        'averageSpeed' : 3.328,
        'totalElevationGain' : 12,
        'hasHeartRate' : true,
        'averageHeartRate' : 150.3,
        'maxHeartRate' : 161,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4772659279',
        'stravaExternalId' : 'garmin_push_6257542702',
        'startLatitude' : 39.754881,
        'startLongitude' : -105.008709,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-12T22:07:11Z'),
        'startDateLocal' : new Date('2021-02-12T15:07:11Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 3081,
        'distance' : 9962.6,
        'averageSpeed' : 3.234,
        'totalElevationGain' : 58.5,
        'hasHeartRate' : true,
        'averageHeartRate' : 141.8,
        'maxHeartRate' : 164,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4777376553',
        'stravaExternalId' : 'garmin_push_6262286033',
        'startLatitude' : 39.758243,
        'startLongitude' : -104.989547,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-13T20:12:29Z'),
        'startDateLocal' : new Date('2021-02-13T13:12:29Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 5617,
        'distance' : 17334.9,
        'averageSpeed' : 3.086,
        'totalElevationGain' : 91.2,
        'hasHeartRate' : true,
        'averageHeartRate' : 140.4,
        'maxHeartRate' : 168,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4782719373',
        'stravaExternalId' : 'garmin_push_6267604327',
        'startLatitude' : 39.758024,
        'startLongitude' : -104.989358,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-19T00:07:08Z'),
        'startDateLocal' : new Date('2021-02-18T17:07:08Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 3539,
        'distance' : 11264.8,
        'averageSpeed' : 3.183,
        'totalElevationGain' : 67.4,
        'hasHeartRate' : true,
        'averageHeartRate' : 144.8,
        'maxHeartRate' : 171,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4809846142',
        'stravaExternalId' : 'garmin_push_6294403903',
        'startLatitude' : 39.758209,
        'startLongitude' : -104.989565,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-20T22:43:49Z'),
        'startDateLocal' : new Date('2021-02-20T15:43:49Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 3406,
        'distance' : 11585,
        'averageSpeed' : 3.401,
        'totalElevationGain' : 82.6,
        'hasHeartRate' : true,
        'averageHeartRate' : 150,
        'maxHeartRate' : 166,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4820647980',
        'stravaExternalId' : 'garmin_push_6305173264',
        'startLatitude' : 39.758137,
        'startLongitude' : -104.989531,
      },
      {
        'userId' : userId,
        'name' : 'Lunch Run',
        'startDate' : new Date('2021-02-21T18:22:44Z'),
        'startDateLocal' : new Date('2021-02-21T11:22:44Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 4317,
        'distance' : 14486.6,
        'averageSpeed' : 3.356,
        'totalElevationGain' : 46.8,
        'hasHeartRate' : true,
        'averageHeartRate' : 145.2,
        'maxHeartRate' : 165,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4826856507',
        'stravaExternalId' : 'garmin_push_6311163606',
        'startLatitude' : 39.758221,
        'startLongitude' : -104.989561,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-22T20:35:00Z'),
        'startDateLocal' : new Date('2021-02-22T13:35:00Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 3746,
        'distance' : 12938,
        'averageSpeed' : 3.454,
        'totalElevationGain' : 65.5,
        'hasHeartRate' : true,
        'averageHeartRate' : 145.9,
        'maxHeartRate' : 164,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4832308214',
        'stravaExternalId' : 'garmin_push_6316766218',
        'startLatitude' : 39.758389,
        'startLongitude' : -104.98955,
      },
      {
        'userId' : userId,
        'name' : 'Evening Run',
        'startDate' : new Date('2021-02-24T01:07:59Z'),
        'startDateLocal' : new Date('2021-02-23T18:07:59Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2003,
        'distance' : 6620.9,
        'averageSpeed' : 3.305,
        'totalElevationGain' : 36.1,
        'hasHeartRate' : true,
        'averageHeartRate' : 147.3,
        'maxHeartRate' : 163,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4839117806',
        'stravaExternalId' : 'garmin_push_6323479433',
        'startLatitude' : 39.758142,
        'startLongitude' : -104.989616,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-24T20:42:11Z'),
        'startDateLocal' : new Date('2021-02-24T13:42:11Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2622,
        'distance' : 8645.2,
        'averageSpeed' : 3.297,
        'totalElevationGain' : 30.2,
        'hasHeartRate' : true,
        'averageHeartRate' : 140.1,
        'maxHeartRate' : 152,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4844225231',
        'stravaExternalId' : 'garmin_push_6328590955',
        'startLatitude' : 39.758287,
        'startLongitude' : -104.989347,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-26T22:10:59Z'),
        'startDateLocal' : new Date('2021-02-26T15:10:59Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 4073,
        'distance' : 14485.6,
        'averageSpeed' : 3.556,
        'totalElevationGain' : 67.2,
        'hasHeartRate' : true,
        'averageHeartRate' : 166.5,
        'maxHeartRate' : 189,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4855632620',
        'stravaExternalId' : 'garmin_push_6339781218',
        'startLatitude' : 39.758031,
        'startLongitude' : -104.98953,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-27T21:10:41Z'),
        'startDateLocal' : new Date('2021-02-27T14:10:41Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 1985,
        'distance' : 6675.1,
        'averageSpeed' : 3.363,
        'totalElevationGain' : 19.8,
        'hasHeartRate' : true,
        'averageHeartRate' : 156.6,
        'maxHeartRate' : 173,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4861671029',
        'stravaExternalId' : 'garmin_push_6345616686',
        'startLatitude' : 39.758248,
        'startLongitude' : -104.989368,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-02-28T22:13:18Z'),
        'startDateLocal' : new Date('2021-02-28T15:13:18Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 4871,
        'distance' : 16498.2,
        'averageSpeed' : 3.387,
        'totalElevationGain' : 70.6,
        'hasHeartRate' : true,
        'averageHeartRate' : 154.6,
        'maxHeartRate' : 174,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4869015580',
        'stravaExternalId' : 'garmin_push_6352855911',
        'startLatitude' : 39.758062,
        'startLongitude' : -104.989196,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-03-01T22:46:33Z'),
        'startDateLocal' : new Date('2021-03-01T15:46:33Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2491,
        'distance' : 8497.1,
        'averageSpeed' : 3.411,
        'totalElevationGain' : 57.7,
        'hasHeartRate' : true,
        'averageHeartRate' : 149.3,
        'maxHeartRate' : 167,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4874302952',
        'stravaExternalId' : 'garmin_push_6358009720',
        'startLatitude' : 39.758085,
        'startLongitude' : -104.989269,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-03-02T22:21:03Z'),
        'startDateLocal' : new Date('2021-03-02T15:21:03Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 4101,
        'distance' : 14485.2,
        'averageSpeed' : 3.532,
        'totalElevationGain' : 27.3,
        'hasHeartRate' : true,
        'averageHeartRate' : 167.1,
        'maxHeartRate' : 194,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4880376076',
        'stravaExternalId' : 'garmin_push_6363925616',
        'startLatitude' : 39.758198,
        'startLongitude' : -104.98944,
      },
      {
        'userId' : userId,
        'name' : 'Afternoon Run',
        'startDate' : new Date('2021-03-04T00:59:21Z'),
        'startDateLocal' : new Date('2021-03-03T17:59:21Z'),
        'timezone' : '(GMT-07:00) America/Denver',
        'time' : 2119,
        'distance' : 6983.6,
        'averageSpeed' : 3.296,
        'totalElevationGain' : 51.1,
        'hasHeartRate' : true,
        'averageHeartRate' : 147.4,
        'maxHeartRate' : 167,
        'deviceName' : 'Garmin Forerunner 245',
        'stravaActivityId' : '4886692498',
        'stravaExternalId' : 'garmin_push_6370123399',
        'startLatitude' : 39.758064,
        'startLongitude' : -104.98935,
      }
    ])

    console.log('Inserted runs')
    return 1
  } catch (error) {
    console.error(error)
    return -1
  } finally {
    disconnectFromMongo()
  }
}

loadRuns()

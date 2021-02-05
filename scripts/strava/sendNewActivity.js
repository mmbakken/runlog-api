import axios from 'axios'

// Use this script to send a mock POST request to the stravaWebhookHandler endpoint

axios({
  method: 'post',
  url: 'http://localhost:4000/api/v1/strava/webhook',
  data: {
    aspect_type: 'create',   
    event_time: 1612050850,  
    object_id: 4707943142,   
    object_type: 'activity', 
    owner_id: 8843745,       
    subscription_id: 179879, 
    updates: {}
  }
})

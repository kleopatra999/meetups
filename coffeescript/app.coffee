CITIES =
  AT: ['Vienna', 'Salzburg', 'Graz']
  CZ: ['Prague', 'Brno']
  HU: ['Budapest']
  PL: ['Krakow']

parseEvent = (entry) ->
  id:         entry.id
  time:       entry.time
  name:       entry.name,
  city:       entry?.venue?.city
  attending:  entry.yes_rsvp_count
  rsvpLimit:  entry.rsvp_limit
  eventUrl:   entry.event_url
  group:      entry.group.name

parseEvents = (response) ->
  parseEvent eventJson for eventJson in response.results
  
generateUrl = (filter) ->
  "https://api.meetup.com/2/open_events?category_id=34&country=#{filter.country}&city=#{filter.city}&radius=100&key=7013cc73581ac377c5372713c133&callback=JSON_CALLBACK"
  
angular.module('meetup', ['firebase'])
  .controller('MeetupCtrl', ['$scope', '$http', '$firebase', ($scope, $http, $firebase) ->
    ref = new Firebase "https://codeship-meetups.firebaseio.com/events"
    $scope.meetups = $firebase(ref)
    
    $scope.addComment = (eventId, name, message) ->
      return unless eventId
      event = $scope.meetups[eventId];
      event.comments = event.comments ? []
      event.comments.push
        'name':     name,
        'message':  message,
        'time':     new Date()
      $scope.meetups.$save(eventId)
      
    eachCity = (callback) ->
      for country, cities of CITIES
        callback(country, city) for city in cities
      
    fetchEvents = (country, city) ->
      $http(method: 'JSONP', url: generateUrl({country, city}))
        .success (data, status, headers, config) ->
          for event in parseEvents(data)     
            id = event.id
            $scope.meetups[id] ?= {relevant: true}
            $scope.meetups[id].$priority = event.time
            $scope.meetups[id].event = event
            $scope.meetups.$save(id)
    
    $scope.meetups.$on "loaded", ->
      eachCity fetchEvents
])
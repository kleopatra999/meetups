angular
  .module('meetup', ['firebase'])

  .factory('cities', [
    ->
      byCountry:
        AT: ['Vienna', 'Salzburg', 'Graz']
        CZ: ['Prague', 'Brno']
        HU: ['Budapest']
        PL: ['Krakow']

      each: (callback) ->
        for country, cities of this.byCountry
          callback(country, city) for city in cities
  ])

  .factory('meetups', [
    '$http', '$firebase', 'cities', ($http, $firebase, cities) ->

      ref = new Firebase 'https://codeship-meetups.firebaseio.com/events'
      meetups = $firebase(ref)

      meetups.$on 'loaded', ->
        cities.each (country, city) ->
          $http(method: 'JSONP', url: generateUrl({country, city}))
            .success (data, status, headers, config) ->
              for event in parseEvents(data)
                id = event.id
                meetups[id] ?= {relevant: true}
                meetups[id].$priority = event.time
                meetups[id].event = event
                meetups.$save(id)

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

      meetups
  ])

  .controller('MeetupController', [
    '$scope', 'meetups', ($scope, meetups) ->

      $scope.meetups = meetups

      $scope.addComment = (eventId, name, message) ->
        return unless eventId
        event = $scope.meetups[eventId];
        event.comments = event.comments ? []
        event.comments.push
          'name':     name,
          'message':  message,
          'time':     new Date()
        $scope.meetups.$save(eventId)

  ])

  .directive('meetup', [
    ->
      restrict: 'EAC'
      rquire: '^MeetupController'
      replace: false
      templateUrl: '/partials/meetup.html'
      scope: false
  ])

  .directive('comments', [
    ->
      restrict: 'EAC'
      rquire: '^MeetupController'
      replace: false
      templateUrl: '/partials/comments.html'
      scope: false
  ])

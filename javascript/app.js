// Generated by CoffeeScript 1.6.3
(function() {
  angular.module('meetup', ['firebase']).factory('cities', [
    function() {
      return {
        byCountry: {
          AT: ['Vienna', 'Salzburg', 'Graz'],
          CZ: ['Prague', 'Brno'],
          HU: ['Budapest'],
          PL: ['Krakow']
        },
        each: function(callback) {
          var cities, city, country, _ref, _results;
          _ref = this.byCountry;
          _results = [];
          for (country in _ref) {
            cities = _ref[country];
            _results.push((function() {
              var _i, _len, _results1;
              _results1 = [];
              for (_i = 0, _len = cities.length; _i < _len; _i++) {
                city = cities[_i];
                _results1.push(callback(country, city));
              }
              return _results1;
            })());
          }
          return _results;
        }
      };
    }
  ]).factory('meetups', [
    '$http', '$firebase', 'cities', function($http, $firebase, cities) {
      var generateUrl, meetups, parseEvent, parseEvents, ref;
      ref = new Firebase('https://codeship-meetups.firebaseio.com/events');
      meetups = $firebase(ref);
      meetups.$on('loaded', function() {
        return cities.each(function(country, city) {
          return $http({
            method: 'JSONP',
            url: generateUrl({
              country: country,
              city: city
            })
          }).success(function(data, status, headers, config) {
            var event, id, _i, _len, _ref, _results;
            _ref = parseEvents(data);
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              event = _ref[_i];
              id = event.id;
              if (meetups[id] == null) {
                meetups[id] = {
                  relevant: true
                };
              }
              meetups[id].$priority = event.time;
              meetups[id].event = event;
              _results.push(meetups.$save(id));
            }
            return _results;
          });
        });
      });
      parseEvent = function(entry) {
        var _ref;
        return {
          id: entry.id,
          time: entry.time,
          name: entry.name,
          city: entry != null ? (_ref = entry.venue) != null ? _ref.city : void 0 : void 0,
          attending: entry.yes_rsvp_count,
          rsvpLimit: entry.rsvp_limit,
          eventUrl: entry.event_url,
          group: entry.group.name
        };
      };
      parseEvents = function(response) {
        var eventJson, _i, _len, _ref, _results;
        _ref = response.results;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          eventJson = _ref[_i];
          _results.push(parseEvent(eventJson));
        }
        return _results;
      };
      generateUrl = function(filter) {
        return "https://api.meetup.com/2/open_events?category_id=34&country=" + filter.country + "&city=" + filter.city + "&radius=100&key=7013cc73581ac377c5372713c133&callback=JSON_CALLBACK";
      };
      return meetups;
    }
  ]).controller('MeetupController', [
    '$scope', 'meetups', function($scope, meetups) {
      $scope.meetups = meetups;
      return $scope.addComment = function(eventId, name, message) {
        var event, _ref;
        if (!eventId) {
          return;
        }
        event = $scope.meetups[eventId];
        event.comments = (_ref = event.comments) != null ? _ref : [];
        event.comments.push({
          'name': name,
          'message': message,
          'time': new Date()
        });
        return $scope.meetups.$save(eventId);
      };
    }
  ]).directive('meetup', [
    function() {
      return {
        restrict: 'EAC',
        rquire: '^MeetupController',
        replace: false,
        templateUrl: '/partials/meetup.html',
        scope: false
      };
    }
  ]).directive('comments', [
    function() {
      return {
        restrict: 'EAC',
        rquire: '^MeetupController',
        replace: false,
        templateUrl: '/partials/comments.html',
        scope: false
      };
    }
  ]);

}).call(this);

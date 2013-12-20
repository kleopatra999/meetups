// Generated by CoffeeScript 1.6.3
(function() {
  var CITIES, generateUrl, parseEvent, parseEvents;

  CITIES = {
    AT: ['Vienna', 'Salzburg', 'Graz'],
    CZ: ['Prague', 'Brno'],
    HU: ['Budapest'],
    PL: ['Krakow']
  };

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

  angular.module('meetup', ['firebase']).controller('MeetupCtrl', [
    '$scope', '$http', '$firebase', function($scope, $http, $firebase) {
      var eachCity, fetchEvents, ref;
      ref = new Firebase("https://codeship-meetups.firebaseio.com/events");
      $scope.meetups = $firebase(ref);
      $scope.addComment = function(eventId, name, message) {
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
      eachCity = function(callback) {
        var cities, city, country, _results;
        _results = [];
        for (country in CITIES) {
          cities = CITIES[country];
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
      };
      fetchEvents = function(country, city) {
        return $http({
          method: 'JSONP',
          url: generateUrl({
            country: country,
            city: city
          })
        }).success(function(data, status, headers, config) {
          var event, id, _base, _i, _len, _ref, _results;
          _ref = parseEvents(data);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            event = _ref[_i];
            id = event.id;
            if ((_base = $scope.meetups)[id] == null) {
              _base[id] = {
                relevant: true
              };
            }
            $scope.meetups[id].$priority = event.time;
            $scope.meetups[id].event = event;
            _results.push($scope.meetups.$save(id));
          }
          return _results;
        });
      };
      return $scope.meetups.$on("loaded", function() {
        return eachCity(fetchEvents);
      });
    }
  ]);

}).call(this);

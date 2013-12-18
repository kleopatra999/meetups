var FILTERS = [
  {
    country: 'AT',
    category_id: 34,
    city: 'Vienna'
  },
  {
    country: 'AT',
    category_id: 34,
    city: 'Salzburg'
  },
  {
    country: 'CZ',
    category_id: 34,
    city: 'Prague'
  },
  {
    country: 'CZ',
    category_id: 34,
    city: 'Brno'
  },
  {
    country: 'HU',
    category_id: 34,
    city: 'Budapest'
  },
  {
    country: 'AT',
    category_id: 34,
    city: 'Graz'
  },
  {
    country: 'PL',
    category_id: 34,
    city: 'Krakow'
  },
];

function parseEntry(entry) {
  return {
    'id':         entry.id,
    'time':       entry.time,
    'name':       entry.name,
    'city':       entry.venue ? entry.venue.city : null,
    'attending':  entry.yes_rsvp_count,
    'rsvpLimit':  entry.rsvp_limit ? entry.rsvp_limit : null,
    'eventUrl':   entry.event_url,
    'group':      entry.group.name
  };
}

function parseResult(result) {
  if (!result.results) return [];
  var ret = [];
  for (var i =0; i < result.results.length; i++) {
    ret.push(parseEntry(result.results[i]));
  }
  return ret;
}

function generateUrl(filter) {
  return 'https://api.meetup.com/2/open_events?' +
            'category_id=' + filter.category_id +
            '&country=' + filter.country +
            '&city=' + filter.city +
            '&radius=100' +
            '&key=7013cc73581ac377c5372713c133';
} 

function TodoCtrl($scope, $http) {
  $scope.meetups = [];
  $scope.meetupIds = [];

    for (var i = 0; i < FILTERS.length; i++) {
      $http({
        method: 'JSONP',
        url: generateUrl(FILTERS[i]) + '&callback=JSON_CALLBACK'
      }).
      success(function(data, status, headers, config) {
        var res = parseResult(data);
        for (var j = 0; j < res.length; j++) {
          if ($scope.meetupIds.indexOf(res[j].id) < 0) {
            $scope.meetups.push(res[j]);
            $scope.meetupIds.push(res[j].id);
          }
        }
      }).
      error(function(data, status, headers, config) {
      });
    }
}
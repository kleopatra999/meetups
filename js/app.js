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
  var ret = [];
  for (var i =0; i < result.results.length; i++) {
    ret.push(parseEntry(result.results[i]));
  }
  return ret;
}

function TodoCtrl($scope, $http) {
  $scope.todos = [
    {text:'learn angular', done:true},
    {text:'build an angular app', done:false}];
  
    $http({
      method: 'JSONP',
      url: "https://api.meetup.com/2/open_events?category_id=34&country=AT&city=Vienna&radius=300&key=7013cc73581ac377c5372713c133&callback=JSON_CALLBACK"
    }).
    success(function(data, status, headers, config) {
      console.log(data);
      $scope.meetups = parseResult(data);
      console.log($scope.meetups);
    }).
    error(function(data, status, headers, config) {
    });
}
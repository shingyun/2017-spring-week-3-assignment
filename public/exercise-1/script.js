//Exercise 1: a quick review of crossfilter functionalities and a few other basic data manipulation tasks
var m = {t:85,r:100,b:50,l:100},
	w = document.getElementById('plot1').clientWidth - m.l - m.r,
	h = document.getElementById('plot1').clientHeight - m.t - m.b;
var plots = d3.selectAll('.plot')
	.append('svg')
	.attr('width', w + m.l + m.r)
	.attr('height', h + m.t + m.b)
	.append('g')
	.attr('class','canvas')
	.attr('transform','translate('+m.l+','+m.t+')');
var plot1 = plots.filter(function(d,i){ return i===0;}),
	plot2 = plots.filter(function(d,i){return i===1}).classed('time-series',true);

d3.queue()
	.defer(d3.csv,'../data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'../data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	//Create a crossfilter with trips
    //console.log(trips);

    var cf = crossfilter(trips);
	//Create a dimension on bike_nr
    var tripsByBike = cf.dimension(function(d){return d.bike_nr});
	//Create a dimension on time of the day 
    var tripsByTime = cf.dimension(function(d){return d.startTime.getHours()+d.startTime.getMinutes()/60});
		//Hint: the API for crossfilter dimension requires an accessor function argument
		//crossfilter.dimension(function(d){return ...})
		//Within this accessor function, use Date.getHours() and Date.getMinutes() to convert a Date object to a time of the day

	//Using console.log, log out the answer to the following questions
	//What % of trips take place between 5PM and 8PM?
    var timeTotal = cf.size(); //trips.crossfilter.size() = trips.length
    tripsByTime.filterRange(['17','20']);
    var time17_20 = tripsByTime.top(Infinity).length;
    console.log('Between 5pm-8pm: '+time17_20/timeTotal*100+'%');
	//What % of trips take place before 9AM and after 5PM?
    tripsByTime.filterRange(['9','17']);
    var time9_17 = tripsByTime.top(Infinity).length;
    console.log('Before 9am After 5 pm: '+ (timeTotal-time9_17)/timeTotal*100+'%');
	//How many trips were taken with each unique bike_nr? Which bike has the highest number of trip count?
		//This will require the use dimension.group
    tripsByTime.filterAll();
    var tripsByBikeGroup = tripsByBike.group().top(Infinity);
    console.log('How many trips were taken with each unique bike_nr?')
    console.log(tripsByBikeGroup);
    console.log('Bike"'+tripsByBikeGroup[0].key+'" has the highest number of trip count');
	//How much travel time was logged on each unique bike_nr? Which bike has the highest travel time logged?
		//This will require the use dimension.group, but with a different reduce function
    var topDurationByBike = tripsByBike.group().reduceSum(function(d){return d.duration;});
    console.log('How much travel time was logged on each unique bike_nr?');
    console.log(topDurationByBike.top(Infinity));
    console.log(topDurationByBike.top(1)[0].key+' has the highest travel time logged.');


}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}

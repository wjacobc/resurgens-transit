import csv
import json

class Stop:
    def __init__(self, lat, lon, stop_id, code, name):
        self.lat = lat
        self.lon = lon
        self.id = stop_id
        self.code = code 
        self.name = name
        self.trips = []
        self.routes = []
    
    def __repr__(self):
        new_dict = self.json_dict()
        return str(new_dict)
    
    def json_dict(self):
        self_repr = self.__dict__
        new_dict = {}
        for item in self_repr:
            if item != "trips":
                new_dict[item] = self_repr[item]

        route_list = []
        trip_id_list = []
        for route in self.routes:
            route_list.append(route.short_name)
        for trip in self.trips:
            trip_id_list.append(trip.trip_id)
        
        #new_dict["trips"] = list(set(trip_id_list))
        new_dict["routes"] = route_list
        return new_dict


class Visit:
    def __init__(self, trip_id, arr, depart, stop_id, sequence_num):
        self.trip_id = trip_id
        self.arr = arr
        self.depart = depart
        self.stop_id = stop_id
        self.sequence_num = sequence_num
    
    def __repr__(self):
        return self.trip_id + " " + self.stop_id + " " + self.sequence_num

class Trip:
    def __init__(self, route_id, service_id, trip_id, trip_headsign, direction_id, block_id, shape_id):
        self.trip_id = trip_id
        self.route_id = route_id
        self.service_id = service_id
        self.trip_headsign = trip_headsign
        self.direction_id = direction_id
        self.block_id = block_id
        self.shape_id = shape_id
        self.visits = []

class Route:
    def __init__(self, id, short_name, long_name):
        self.id = id
        self.short_name = short_name
        self.long_name = long_name
        self.trips = []
    
    def __repr__(self):
        return self.short_name

def serialize_stops(stop_list):
    print("[")
    for stop in stop_list:
        print(json.dumps(stop.json_dict()))
        if stop.name != stop_list[-1].name:
            print(",")
    print("]")

def deserialize_stops(file_name):
    with open(file_name, "r") as data_file:
        data = json.load(data_file)
        stop_list = []
        for stop in data:
            stop_list.append(Stop(lat = float(stop["lat"]), lon = float(stop["lon"]), stop_id = stop["id"], code = stop["code"], name = stop["name"]))
        
        return stop_list

def distance(item):
    return (((33.780854 - float(item.lat))**2) + ((-84.405975 - float(item.lon))**2))**0.5

def fix_name(stop):
    new_name = stop.name
    if "@" in new_name:
        post_at_index = new_name.index("@") + 1
        pre_at_index = new_name.index("@") - 1
        str_list = list(new_name)
        str_list[post_at_index] = new_name[post_at_index].upper()

        if str_list[pre_at_index] != " ":
            str_list.insert(pre_at_index + 1, " ")
            #str_list[pre_at_index] = "*"
            post_at_index = str_list.index("@") + 1
        if str_list[post_at_index]!= " ":
            str_list.insert(post_at_index, " ")

        new_name = "".join(str_list)
    temp_name = ""
    for word in new_name.split(" "):
        new_word = word[:1]

        if word in ["NW", "NE", "SW", "SE", "GRTA", "MARTA"]:
            new_word += word[1:]
        else:
            new_word += word[1:].lower()
        temp_name += new_word + " "
    return temp_name.strip()

def modify_stops():
    stop_file = open("stops.txt", 'r')
    stop_list = []
    reader = csv.reader(stop_file)
    next(reader)
    for row in reader:
        stop_list.append(Stop(lat = row[3], lon = row[4], stop_id = row[0], code = row[1], name = row[2]))

    for stop in stop_list:
        stop.name = fix_name(stop)
    
    return stop_list

def load_visits():
    visits = []
    visits_file = open("stop_times.txt", "r")
    reader = csv.reader(visits_file)
    next(reader)
    for row in reader:
        visits.append(Visit(row[0], row[1], row[2], row[3], row[4]))
    return visits

def load_trips():
    trips = []
    trips_file = open("trips.txt", "r")
    reader = csv.reader(trips_file)
    next(reader)
    for row in reader:
        trips.append(Trip(row[0], row[1], row[2], row[3], row[4], row[5], row[6]))
    trips_by_id = {}
    for trip in trips:
        trips_by_id[trip.trip_id] = trip
    return trips_by_id

def load_stops():
    stops = modify_stops()
    stops_by_id = {}
    for stop in stops:
        stops_by_id[stop.id] = stop
    return stops_by_id

def load_routes():
    routes = []
    routes_file = open("routes.txt", "r")
    reader = csv.reader(routes_file)
    next(reader)
    for row in reader:
        routes.append(Route(row[0], row[1], row[2]))
    return routes

def load_routes_by_id():
    routes_by_id = {}
    routes = load_routes()
    for route in routes:
        routes_by_id[route.id] = route
    return routes_by_id

def match_visits_trips():
    visits = load_visits()
    trips_by_id = load_trips()
    for visit in visits:
        trips_by_id[visit.trip_id].visits.append(visit)
    return trips_by_id

def match_stops_trips():
    stops = load_stops()
    trips = match_visits_trips()
    for trip in trips.values():
        for visit in trip.visits:
            stops[visit.stop_id].trips.append(trip)
    return stops

def match_stops_routes():
    stops = match_stops_trips()
    routes = load_routes_by_id()
    for stop in stops.values():
        for trip in stop.trips:
            stop.routes.append(routes[trip.route_id])
        stop.routes = set(stop.routes)
    return stops

def output_stops_csv():
    output_file = open("generated_stops.csv", "w")
    output_file.write("lat,lon,name,routes\n")
    stops = match_stops_routes().values()
    for stop in stops:
        row_string = str(stop.lat) + "," + str(stop.lon) + "," + stop.name + "," + str(stop.routes).replace(",", "") + "\n" 
        print(row_string)
        output_file.write(row_string)
    output_file.close()

stops = list(match_stops_routes().values())
serialize_stops(stops)
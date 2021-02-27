import csv
import json

def load_routes_csv():
    routes = {}
    with open("routes.txt", "r") as route_file:
        reader = csv.reader(route_file)
        next(reader)

        for row in reader:
            route = {"id": row[0], "number": row[1], "name": row[2],
                    "type": row[4], "trips": []}
            routes[row[0]] = route

    return routes

def load_trips_csv():
    trips = []
    with open("trips.txt", "r") as trips_file:
        reader = csv.reader(trips_file)
        next(reader)

        for row in reader:
            trip = {"route_id": row[0], "id": row[2],
                    "headsign": row[3], "direction": row[4]}
            trips.append(trip)

    return trips



if __name__ == "__main__":
    routes = load_routes_csv()
    trips = load_trips_csv()

    for trip in trips:
        # Find the route entry for this trip and add the trip id to the route entry
        matching_route = routes[trip["route_id"]]
        matching_route["trips"].append(trip["id"])

    with open("bus_routes.json", "w") as routes_file:
        json.dump(routes, routes_file)

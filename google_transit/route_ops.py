import csv

def load_routes_csv():
    routes = []
    with open("routes.txt", "r") as route_file:
        reader = csv.reader(route_file)
        next(reader)

        for row in reader:
            route = {"id": row[0], "number": row[1], "name": row[2],
                    "type": row[4], trips: []}
            routes.append(route)

    return routes

def load_trips_csv():
    trips = []
    with open("trips.txt", "r") as trips_file:
        reader = csv.reader(trips_file)
        next(reader)

        for row in reader:
            trip = {"route_id": row[0], "id": row[2], 
                    "headsign": row[3], "direction": row[4]}
